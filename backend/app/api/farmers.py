from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_db, init_db, engine
from app.database.models import Farmer, Base

router = APIRouter(prefix="/farmers", tags=["Farmers"])

class FarmerCreate(BaseModel):
    name: str
    phone: str
    district: str
    crop_type: str
    crop_stage: str
    soil_type: str
    language: str = "or"
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
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[FarmerResponse])
def get_all_farmers(district: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all registered Odisha farmers, optionally filtered by district"""
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
    """Register a new farmer (e.g. Hackathon Judge test profile)"""
    new_farmer = Farmer(
        name=payload.name,
        phone=payload.phone,
        district=payload.district,
        crop_type=payload.crop_type,
        crop_stage=payload.crop_stage,
        soil_type=payload.soil_type,
        language=payload.language,
        latitude=payload.latitude or 19.8135,
        longitude=payload.longitude or 85.8312
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
    
    db.delete(farmer)
    db.commit()
    return {"message": f"Farmer {farmer.name} deleted successfully"}

@router.post("/reset-seeds")
def reset_seed_farmers(db: Session = Depends(get_db)):
    """Reset database to the standard 6 coastal Odisha seed farmers"""
    db.query(Farmer).delete()
    db.commit()
    init_db()
    farmers = db.query(Farmer).all()
    return {"message": "Reset completed", "total_farmers": len(farmers)}
