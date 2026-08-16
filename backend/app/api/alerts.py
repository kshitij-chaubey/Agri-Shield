from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_db
from app.database.models import Farmer, Advisory, DispatchLog
from app.services.telephony_service import telephony_service
from app.core.config import settings

router = APIRouter(prefix="/alerts", tags=["Telephony & Dispatch"])

class DispatchRequest(BaseModel):
    advisory_id: int
    override_phone: Optional[str] = None
    channels: List[str] = ["SMS", "IVR"]

class BatchDispatchRequest(BaseModel):
    advisory_ids: List[int]
    override_phone: Optional[str] = None
    channels: List[str] = ["SMS", "IVR"]

class SimulateIVRPressRequest(BaseModel):
    dispatch_id: int
    digit_pressed: str # '1' or '2'

@router.post("/dispatch")
async def dispatch_alert(payload: DispatchRequest, db: Session = Depends(get_db)):
    """
    Dispatch SMS & Automated IVR Voice Call to target farmer.
    Uses Twilio API if credentials configured, otherwise uses High-Fidelity Mock Mode.
    """
    advisory = db.query(Advisory).filter(Advisory.id == payload.advisory_id).first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found")
    
    farmer = advisory.farmer or (
        db.query(Farmer).filter(Farmer.id == advisory.farmer_id).first() if advisory.farmer_id else None
    )

    farmer_name = farmer.name if farmer else "Odisha Farmer"
    target_phone = payload.override_phone or (farmer.phone if farmer else settings.TEST_RECEIVER_PHONE or "+919861012345")
    district = advisory.district
    advisory_text = advisory.translated_advisory or advisory.english_advisory
    lang = advisory.language

    results = []

    # 1. SMS Dispatch
    if "SMS" in payload.channels:
        sms_res = await telephony_service.send_sms(
            to_phone=target_phone,
            farmer_name=farmer_name,
            district=district,
            advisory_text=advisory_text,
            urgency=advisory.urgency_level
        )
        sms_log = DispatchLog(
            advisory_id=advisory.id,
            farmer_id=farmer.id if farmer else None,
            farmer_name=farmer_name,
            farmer_phone=target_phone,
            district=district,
            channel="SMS",
            status=sms_res["status"],
            twilio_sid=sms_res.get("sid"),
            simulated=sms_res.get("simulated", True),
            created_at=datetime.utcnow()
        )
        db.add(sms_log)
        db.commit()
        db.refresh(sms_log)
        results.append({
            "dispatch_id": sms_log.id,
            "channel": "SMS",
            "status": sms_log.status,
            "to": target_phone,
            "sid": sms_log.twilio_sid,
            "simulated": sms_log.simulated
        })

    # 2. Automated IVR Call Dispatch
    if "IVR" in payload.channels:
        ivr_res = await telephony_service.trigger_ivr_call(
            to_phone=target_phone,
            farmer_name=farmer_name,
            advisory_id=advisory.id,
            audio_url=advisory.audio_url or "",
            advisory_text=advisory_text,
            language=lang
        )
        ivr_log = DispatchLog(
            advisory_id=advisory.id,
            farmer_id=farmer.id if farmer else None,
            farmer_name=farmer_name,
            farmer_phone=target_phone,
            district=district,
            channel="IVR",
            status=ivr_res["status"],
            twilio_sid=ivr_res.get("sid"),
            simulated=ivr_res.get("simulated", True),
            duration_seconds=ivr_res.get("duration_seconds", 35),
            ivr_response=ivr_res.get("ivr_response", "Connected - Broadcast audio delivered"),
            created_at=datetime.utcnow()
        )
        db.add(ivr_log)
        db.commit()
        db.refresh(ivr_log)
        results.append({
            "dispatch_id": ivr_log.id,
            "channel": "IVR",
            "status": ivr_log.status,
            "to": target_phone,
            "sid": ivr_log.twilio_sid,
            "simulated": ivr_log.simulated,
            "duration_seconds": ivr_log.duration_seconds,
            "audio_url": advisory.audio_url
        })

    return {
        "advisory_id": advisory.id,
        "farmer_name": farmer_name,
        "target_phone": target_phone,
        "district": district,
        "dispatches": results
    }

@router.post("/dispatch-batch")
async def dispatch_batch(payload: BatchDispatchRequest, db: Session = Depends(get_db)):
    """Dispatch alerts in batch for multiple advisories"""
    all_results = []
    for adv_id in payload.advisory_ids:
        req = DispatchRequest(
            advisory_id=adv_id,
            override_phone=payload.override_phone,
            channels=payload.channels
        )
        res = await dispatch_alert(req, db)
        all_results.append(res)
    
    return {
        "dispatched_count": len(all_results),
        "results": all_results
    }

@router.get("/live")
def get_live_dispatches(limit: int = 30, db: Session = Depends(get_db)):
    """Retrieve real-time stream of recent dispatch and IVR interaction logs"""
    logs = db.query(DispatchLog).order_by(DispatchLog.id.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "advisory_id": l.advisory_id,
            "farmer_name": l.farmer_name,
            "farmer_phone": l.farmer_phone,
            "district": l.district,
            "channel": l.channel,
            "status": l.status,
            "twilio_sid": l.twilio_sid,
            "simulated": l.simulated,
            "ivr_response": l.ivr_response,
            "duration_seconds": l.duration_seconds,
            "created_at": l.created_at.strftime("%H:%M:%S | %d %b %Y")
        } for l in logs
    ]

@router.post("/simulate-ivr-press")
def simulate_ivr_press(payload: SimulateIVRPressRequest, db: Session = Depends(get_db)):
    """Simulate a farmer pressing key 1 (Replay) or 2 (Report Inundation) on the dashboard"""
    dispatch = db.query(DispatchLog).filter(DispatchLog.id == payload.dispatch_id).first()
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch record not found")
    
    if payload.digit_pressed == "1":
        dispatch.status = "REPLAY_REQUESTED"
        dispatch.ivr_response = "Farmer pressed '1': Replayed emergency advisory audio."
    elif payload.digit_pressed == "2":
        dispatch.status = "DAMAGE_REPORTED"
        dispatch.ivr_response = "Farmer pressed '2': Inundation & severe crop lodging reported. Escalated to Block Agronomist."
    else:
        dispatch.status = "ANSWERED"
        dispatch.ivr_response = f"Farmer pressed '{payload.digit_pressed}'"
    
    db.commit()
    db.refresh(dispatch)
    return {
        "dispatch_id": dispatch.id,
        "new_status": dispatch.status,
        "ivr_response": dispatch.ivr_response
    }
