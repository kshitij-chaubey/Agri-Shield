from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.database.session import get_db
from app.database.models import Farmer, DisasterSimulation
from app.services.weather_service import weather_service, AGRICULTURAL_REGIONS

router = APIRouter(prefix="/weather", tags=["Weather & Disaster Simulation"])

class WeatherSimulateRequest(BaseModel):
    district: str
    wind_speed_kmh: float = 120.0
    rainfall_mm: float = 180.0
    event_type: str = "Cyclone" # 'Cyclone' or 'Flash Flood' or 'Unseasonal Rain' or 'Hailstorm'

@router.get("/districts")
def list_agricultural_regions():
    """List all agricultural zones with geographical coordinates and disaster vulnerability ratings"""
    result = []
    for name, data in AGRICULTURAL_REGIONS.items():
        result.append({
            "name": name,
            "state": data.get("state", ""),
            "latitude": data["lat"],
            "longitude": data["lng"],
            "zone_type": data.get("zone_type", "Farmland"),
            "cyclone_vulnerability": data["cyclone_vulnerability"],
            "description": data["description"]
        })
    return result

@router.get("/current/{district}")
async def get_district_live_weather(district: str):
    """Fetch live real-time Open-Meteo weather for specified agricultural region"""
    if district not in AGRICULTURAL_REGIONS:
        match = next((d for d in AGRICULTURAL_REGIONS.keys() if d.lower() == district.lower()), "Nashik")
        district = match
    
    live_data = await weather_service.get_live_weather(district)
    return live_data

@router.post("/simulate")
def simulate_disaster_event(payload: WeatherSimulateRequest, db: Session = Depends(get_db)):
    """
    Trigger & simulate an extreme weather event.
    Calculates severity, storm surge, and matches affected farmers in the district.
    """
    sim_result = weather_service.simulate_weather_event(
        district=payload.district,
        wind_speed_kmh=payload.wind_speed_kmh,
        rainfall_mm=payload.rainfall_mm,
        event_type=payload.event_type
    )

    # Query matching farmers in the affected district
    affected_farmers = db.query(Farmer).filter(Farmer.district.ilike(f"%{payload.district}%")).all()
    
    if not affected_farmers:
        # If no direct district match, pick closest or first
        affected_farmers = db.query(Farmer).limit(2).all()

    # Record simulation in database
    sim_record = DisasterSimulation(
        district=payload.district,
        event_type=payload.event_type,
        wind_speed_kmh=payload.wind_speed_kmh,
        rainfall_mm=payload.rainfall_mm,
        severity=sim_result["severity"],
        affected_farmers_count=len(affected_farmers)
    )
    db.add(sim_record)
    db.commit()

    return {
        "simulation": sim_result,
        "affected_farmers_count": len(affected_farmers),
        "affected_farmers": [
            {
                "id": f.id,
                "name": f.name,
                "phone": f.phone,
                "district": f.district,
                "crop_type": f.crop_type,
                "crop_stage": f.crop_stage,
                "soil_type": f.soil_type,
                "language": f.language
            } for f in affected_farmers
        ]
    }
