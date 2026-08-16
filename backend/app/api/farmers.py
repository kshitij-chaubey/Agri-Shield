from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_db, init_db
from app.database.models import Farmer
from app.services.weather_service import AGRICULTURAL_REGIONS

router = APIRouter(prefix="/farmers", tags=["Farmers"])

class FarmerCreate(BaseModel):
    name: str
    phone: str
    district: str
    crop_type: str
    crop_stage: str
    soil_type: str
    language: str = "hi"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    crop_type: Optional[str] = None
    crop_stage: Optional[str] = None
    soil_type: Optional[str] = None
    language: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FarmerResponse(BaseModel):
    id: int
    name: str
    phone: str
    district: str
    crop_type: str
    crop_stage: str
    soil_type: str
    language: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[FarmerResponse])
def get_all_farmers(district: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all registered farmers, optionally filtered by district"""
    query = db.query(Farmer)
    if district:
        query = query.filter(Farmer.district.ilike(f"%{district}%"))
    return query.order_by(Farmer.id.asc()).all()

@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer_by_id(farmer_id: int, db: Session = Depends(get_db)):
    """Retrieve single farmer by ID"""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer

@router.post("", response_model=FarmerResponse)
def create_farmer(payload: FarmerCreate, db: Session = Depends(get_db)):
    """Register a new farmer (e.g. Judge / Evaluator live test profile)"""
    # Auto-resolve coordinates based on target agricultural district if omitted
    lat = payload.latitude
    lng = payload.longitude
    
    if lat is None or lng is None:
        region_data = AGRICULTURAL_REGIONS.get(payload.district)
        if not region_data:
            match = next((v for k, v in AGRICULTURAL_REGIONS.items() if k.lower() in payload.district.lower()), None)
            region_data = match or AGRICULTURAL_REGIONS["Nashik"]
        lat = region_data["lat"]
        lng = region_data["lng"]

    new_farmer = Farmer(
        name=payload.name,
        phone=payload.phone,
        district=payload.district,
        crop_type=payload.crop_type,
        crop_stage=payload.crop_stage,
        soil_type=payload.soil_type,
        language=payload.language or "hi",
        latitude=lat,
        longitude=lng,
        created_at=datetime.utcnow()
    )
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer

@router.put("/{farmer_id}", response_model=FarmerResponse)
def update_farmer(farmer_id: int, payload: FarmerUpdate, db: Session = Depends(get_db)):
    """Update farmer details (e.g. attach real phone number for live Twilio demo)"""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(farmer, key, val)
    
    db.commit()
    db.refresh(farmer)
    return farmer

@router.delete("/{farmer_id}")
def delete_farmer(farmer_id: int, db: Session = Depends(get_db)):
    """Delete a farmer profile"""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer_name = farmer.name
    db.delete(farmer)
    db.commit()
    return {"message": f"Farmer {farmer_name} deleted successfully"}

@router.post("/seed/reset")
@router.post("/reset-seeds")
def reset_seed_farmers(db: Session = Depends(get_db)):
    """Reset and re-populate database with default pan-regional agricultural seed farmers"""
    db.query(Farmer).delete()
    db.commit()
    init_db()
    farmers = db.query(Farmer).all()
    return {"message": "Seed farmers re-populated successfully", "count": len(farmers), "farmers": [f.name for f in farmers]}
