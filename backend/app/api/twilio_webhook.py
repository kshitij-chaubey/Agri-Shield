from fastapi import APIRouter, Depends, Request, Response, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.database.models import Advisory
from app.services.telephony_service import telephony_service

router = APIRouter(prefix="/twilio", tags=["Twilio TwiML Webhooks"])

@router.api_route("/voice-webhook", methods=["GET", "POST"])
async def voice_webhook(
    request: Request,
    advisory_id: Optional[int] = None,
    lang: Optional[str] = "or",
    db: Session = Depends(get_db)
):
    """
    Twilio Programmable Voice Webhook.
    Returns TwiML XML to play the synthesized advisory and capture IVR keypad input.
    """
    advisory_text = "ଜରୁରୀକାଳୀନ କୃଷି ସତର୍କତା। ଧାନ ଫସଲକୁ ତୁରନ୍ତ କାଟି ନିଅନ୍ତୁ।"
    audio_url = None
    language = lang or "or"

    if advisory_id:
        adv = db.query(Advisory).filter(Advisory.id == advisory_id).first()
        if adv:
            advisory_text = adv.translated_advisory or adv.english_advisory
            audio_url = adv.audio_url
            language = adv.language

    twiml_xml = telephony_service.generate_twiml_response(
        advisory_text=advisory_text,
        audio_url=audio_url,
        language=language
    )
    return Response(content=twiml_xml, media_type="application/xml")

@router.api_route("/ivr-input", methods=["GET", "POST"])
async def handle_ivr_input(
    request: Request,
    lang: Optional[str] = "or"
):
    """
    Twilio IVR Gather Callback:
    Processes DTMF key pressed by farmer ('1' for Replay, '2' for Damage Report).
    """
    # Twilio sends Digits in form data or query params
    form_data = {}
    if request.method == "POST":
        try:
            form_data = await request.form()
        except Exception:
            pass
    
    digits = form_data.get("Digits") or request.query_params.get("Digits", "1")
    twiml_xml = telephony_service.generate_twiml_digit_action(digit=str(digits), language=lang or "or")
    return Response(content=twiml_xml, media_type="application/xml")
