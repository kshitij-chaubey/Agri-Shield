import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_db
from app.database.models import Farmer, Advisory
from app.services.advisory_engine import advisory_engine
from app.services.audio_service import audio_service

router = APIRouter(prefix="/advisory", tags=["AI Advisory Engine"])

class AdvisoryGenerateRequest(BaseModel):
    farmer_id: Optional[int] = None
    farmer_name: Optional[str] = "Farmer"
    district: str = "Puri"
    crop_type: str = "Paddy"
    crop_stage: str = "Harvest-Ready"
    soil_type: str = "Clayey"
    language: str = "or" # 'or' for Odia, 'hi' for Hindi, 'en' for English
    event_type: str = "Cyclone"
    wind_speed_kmh: float = 120.0
    rainfall_mm: float = 180.0

class AdvisoryBatchRequest(BaseModel):
    district: str
    event_type: str = "Cyclone"
    wind_speed_kmh: float = 120.0
    rainfall_mm: float = 180.0

@router.post("/generate")
async def generate_advisory(payload: AdvisoryGenerateRequest, db: Session = Depends(get_db)):
    """
    Generate hyperlocal AI crop advisory tailored to farmer's crop, stage & extreme weather.
    Automatically generates localized text (Odia/Hindi) and synthesizes audio MP3.
    """
    # If farmer_id is provided, load exact farmer details from DB
    farmer = None
    if payload.farmer_id:
        farmer = db.query(Farmer).filter(Farmer.id == payload.farmer_id).first()
        if farmer:
            farmer_name = farmer.name
            district = farmer.district
            crop_type = farmer.crop_type
            crop_stage = farmer.crop_stage
            soil_type = farmer.soil_type
            language = farmer.language
        else:
            farmer_name = payload.farmer_name
            district = payload.district
            crop_type = payload.crop_type
            crop_stage = payload.crop_stage
            soil_type = payload.soil_type
            language = payload.language
    else:
        farmer_name = payload.farmer_name
        district = payload.district
        crop_type = payload.crop_type
        crop_stage = payload.crop_stage
        soil_type = payload.soil_type
        language = payload.language

    # Generate Advisory via AI Engine / Agronomist Matrix
    advisory_data = await advisory_engine.generate_advisory(
        farmer_name=farmer_name,
        district=district,
        crop_type=crop_type,
        crop_stage=crop_stage,
        soil_type=soil_type,
        language=language,
        event_type=payload.event_type,
        wind_speed_kmh=payload.wind_speed_kmh,
        rainfall_mm=payload.rainfall_mm
    )

    # Save provisional record to DB to get advisory ID
    advisory_record = Advisory(
        farmer_id=farmer.id if farmer else None,
        district=district,
        event_type=payload.event_type,
        wind_speed_kmh=payload.wind_speed_kmh,
        rainfall_mm=payload.rainfall_mm,
        urgency_level=advisory_data.get("urgency_level", "CRITICAL"),
        english_advisory=advisory_data.get("english_advisory", ""),
        translated_advisory=advisory_data.get("translated_advisory", ""),
        language=advisory_data.get("language", language),
        points_json=json.dumps({
            "english_points": advisory_data.get("english_points", []),
            "translated_points": advisory_data.get("translated_points", []),
            "reasoning": advisory_data.get("reasoning", "")
        })
    )
    db.add(advisory_record)
    db.commit()
    db.refresh(advisory_record)

    # Synthesize Audio (Odia/Hindi MP3)
    audio_res = audio_service.generate_speech(
        text=advisory_record.translated_advisory,
        language=advisory_record.language,
        advisory_id=advisory_record.id
    )

    # Update record with audio URL
    advisory_record.audio_filename = audio_res["filename"]
    advisory_record.audio_url = audio_res["audio_url"]
    db.commit()
    db.refresh(advisory_record)

    return {
        "advisory_id": advisory_record.id,
        "farmer_id": advisory_record.farmer_id,
        "farmer_name": farmer_name,
        "district": district,
        "crop_type": crop_type,
        "crop_stage": crop_stage,
        "urgency_level": advisory_record.urgency_level,
        "language": advisory_record.language,
        "english_advisory": advisory_record.english_advisory,
        "translated_advisory": advisory_record.translated_advisory,
        "english_points": advisory_data.get("english_points", []),
        "translated_points": advisory_data.get("translated_points", []),
        "reasoning": advisory_data.get("reasoning", ""),
        "audio_url": advisory_record.audio_url,
        "audio_filename": advisory_record.audio_filename,
        "source": advisory_data.get("source", "KrishiSetu AI Agronomist"),
        "created_at": advisory_record.created_at.isoformat()
    }

@router.post("/batch")
async def generate_batch_advisories(payload: AdvisoryBatchRequest, db: Session = Depends(get_db)):
    """Generate tailored advisories for all registered farmers in affected district"""
    farmers = db.query(Farmer).filter(Farmer.district.ilike(f"%{payload.district}%")).all()
    if not farmers:
        farmers = db.query(Farmer).all()

    results = []
    for farmer in farmers:
        req = AdvisoryGenerateRequest(
            farmer_id=farmer.id,
            farmer_name=farmer.name,
            district=farmer.district,
            crop_type=farmer.crop_type,
            crop_stage=farmer.crop_stage,
            soil_type=farmer.soil_type,
            language=farmer.language,
            event_type=payload.event_type,
            wind_speed_kmh=payload.wind_speed_kmh,
            rainfall_mm=payload.rainfall_mm
        )
        adv = await generate_advisory(req, db)
        results.append(adv)

    return {
        "district": payload.district,
        "generated_count": len(results),
        "advisories": results
    }

@router.get("/{advisory_id}")
def get_advisory(advisory_id: int, db: Session = Depends(get_db)):
    """Fetch advisory details by ID"""
    adv = db.query(Advisory).filter(Advisory.id == advisory_id).first()
    if not adv:
        raise HTTPException(status_code=404, detail="Advisory not found")
    
    points_dict = json.loads(adv.points_json) if adv.points_json else {}
    return {
        "id": adv.id,
        "farmer_id": adv.farmer_id,
        "district": adv.district,
        "event_type": adv.event_type,
        "urgency_level": adv.urgency_level,
        "english_advisory": adv.english_advisory,
        "translated_advisory": adv.translated_advisory,
        "language": adv.language,
        "english_points": points_dict.get("english_points", []),
        "translated_points": points_dict.get("translated_points", []),
        "reasoning": points_dict.get("reasoning", ""),
        "audio_url": adv.audio_url,
        "audio_filename": adv.audio_filename,
        "created_at": adv.created_at.isoformat()
    }
