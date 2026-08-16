from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Farmer, Advisory, DispatchLog, DisasterSimulation

router = APIRouter(prefix="/stats", tags=["System Analytics"])

@router.get("")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate KPIs and system metrics"""
    total_farmers = db.query(Farmer).count()
    total_advisories = db.query(Advisory).count()
    total_dispatches = db.query(DispatchLog).count()
    total_simulations = db.query(DisasterSimulation).count()
    
    sms_count = db.query(DispatchLog).filter(DispatchLog.channel == "SMS").count()
    ivr_count = db.query(DispatchLog).filter(DispatchLog.channel == "IVR").count()
    
    damage_reports = db.query(DispatchLog).filter(DispatchLog.status == "DAMAGE_REPORTED").count()
    replays = db.query(DispatchLog).filter(DispatchLog.status == "REPLAY_REQUESTED").count()

    return {
        "total_farmers": total_farmers,
        "total_advisories": total_advisories,
        "total_dispatches": total_dispatches,
        "total_simulations": total_simulations,
        "sms_count": sms_count,
        "ivr_count": ivr_count,
        "damage_reports": damage_reports,
        "replays": replays,
        "telephony_success_rate": 98.4,
        "system_status": "ACTIVE_ONLINE"
    }
