from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    district = Column(String(50), nullable=False, index=True)
    crop_type = Column(String(50), nullable=False)   # e.g., Paddy, Groundnut, Mustard, Brinjal, Betel Vine
    crop_stage = Column(String(50), nullable=False)  # e.g., Flowering, Harvest-Ready, Seedling, Vegetative, Tillering
    soil_type = Column(String(50), nullable=False)   # e.g., Clayey, Alluvial, Sandy Loam, Saline
    language = Column(String(10), default="or")      # 'or' for Odia, 'hi' for Hindi, 'en' for English
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    advisories = relationship("Advisory", back_populates="farmer", cascade="all, delete-orphan")
    dispatches = relationship("DispatchLog", back_populates="farmer", cascade="all, delete-orphan")


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    district = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False)   # 'Cyclone' or 'Flash Flood' or 'Depression'
    wind_speed_kmh = Column(Float, default=0.0)
    rainfall_mm = Column(Float, default=0.0)
    urgency_level = Column(String(20), default="CRITICAL") # CRITICAL, HIGH, MODERATE
    
    english_advisory = Column(Text, nullable=False)
    translated_advisory = Column(Text, nullable=False)
    language = Column(String(10), default="or")
    
    # Points breakdown stored as JSON string
    points_json = Column(Text, nullable=True)
    
    audio_filename = Column(String(255), nullable=True)
    audio_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="advisories")
    dispatches = relationship("DispatchLog", back_populates="advisory", cascade="all, delete-orphan")


class DispatchLog(Base):
    __tablename__ = "dispatch_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    advisory_id = Column(Integer, ForeignKey("advisories.id"), nullable=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    district = Column(String(50), nullable=False)
    channel = Column(String(20), nullable=False) # 'SMS' or 'IVR'
    status = Column(String(50), default="QUEUED") # QUEUED, SENT, DELIVERED, ANSWERED, FAILED, REPLAY_REQUESTED, DAMAGE_REPORTED
    twilio_sid = Column(String(100), nullable=True)
    simulated = Column(Boolean, default=True)
    ivr_response = Column(String(255), nullable=True) # Keypress or response notes (e.g. "Pressed 1: Replayed", "Pressed 2: Inundation reported")
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="dispatches")
    advisory = relationship("Advisory", back_populates="dispatches")


class DisasterSimulation(Base):
    __tablename__ = "disaster_simulations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    severity = Column(String(50), default="SEVERE")
    affected_farmers_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
