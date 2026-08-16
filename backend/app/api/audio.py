import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from app.database.session import get_db
from app.database.models import Advisory
from app.core.config import AUDIO_DIR, settings
from app.services.audio_service import audio_service

router = APIRouter(prefix="/audio", tags=["Audio & Voice Broadcast"])

@router.get("/stream/{filename}")
def stream_audio_file(filename: str):
    """Stream generated MP3 voice broadcast directly to browser / Twilio caller"""
    file_path = AUDIO_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        filename=filename,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400"
        }
    )

@router.get("/{advisory_id}")
def get_or_generate_audio(advisory_id: int, db: Session = Depends(get_db)):
    """Retrieve audio metadata or generate if missing for specific advisory"""
    advisory = db.query(Advisory).filter(Advisory.id == advisory_id).first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found")
    
    # Check if audio exists
    if advisory.audio_filename:
        audio_path = AUDIO_DIR / advisory.audio_filename
        if audio_path.exists():
            return {
                "advisory_id": advisory.id,
                "filename": advisory.audio_filename,
                "audio_url": advisory.audio_url,
                "full_url": f"{settings.PUBLIC_BASE_URL}{advisory.audio_url}",
                "status": "READY"
            }

    # Generate on the fly
    res = audio_service.generate_speech(
        text=advisory.translated_advisory,
        language=advisory.language,
        advisory_id=advisory.id
    )
    advisory.audio_filename = res["filename"]
    advisory.audio_url = res["audio_url"]
    db.commit()

    return {
        "advisory_id": advisory.id,
        "filename": advisory.audio_filename,
        "audio_url": advisory.audio_url,
        "full_url": res["full_url"],
        "status": "GENERATED"
    }
