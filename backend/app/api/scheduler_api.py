from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.scheduler_service import (
    poll_weather_and_trigger_advisories, 
    _execute_automated_advisory_pipeline,
    DEFAULT_REGION,
    CYCLONE_WIND_THRESHOLD_KMH,
    FLOOD_RAIN_THRESHOLD_MM
)

router = APIRouter(prefix="/scheduler", tags=["Automated Poller / Cron"])

class SimulateTriggerRequest(BaseModel):
    district: Optional[str] = DEFAULT_REGION
    event_type: Optional[str] = "Cyclone"
    wind_speed_kmh: Optional[float] = 115.0
    rainfall_mm: Optional[float] = 185.0

@router.post("/trigger-now")
async def trigger_polling_job_now():
    """Manually trigger the 1-minute Open-Meteo background polling job immediately"""
    await poll_weather_and_trigger_advisories()
    return {"message": "Background Open-Meteo telemetry polling job executed successfully."}

@router.post("/simulate-threshold")
async def simulate_threshold_trigger(payload: SimulateTriggerRequest):
    """
    Simulate extreme threshold exceeded event for instant hackathon demonstration.
    Forces the automated background pipeline to generate AI advisories and dispatch SMS/IVR.
    """
    print(f"\n[DEMO-TRIGGER] Forcing Automated Disaster Threshold Pipeline for {payload.district} ({payload.event_type})...")
    await _execute_automated_advisory_pipeline(
        district=payload.district or DEFAULT_REGION,
        event_type=payload.event_type or "Cyclone",
        wind_speed_kmh=payload.wind_speed_kmh or 115.0,
        rainfall_mm=payload.rainfall_mm or 185.0
    )
    return {
        "message": "Automated advisory & telephony dispatch pipeline triggered for threshold simulation.",
        "district": payload.district,
        "event_type": payload.event_type,
        "wind_speed_kmh": payload.wind_speed_kmh,
        "rainfall_mm": payload.rainfall_mm
    }
