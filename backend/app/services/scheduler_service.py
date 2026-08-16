import json
import httpx
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.database.session import SessionLocal
from app.database.models import Farmer, Advisory, DispatchLog
from app.services.advisory_engine import advisory_engine
from app.services.audio_service import audio_service
from app.services.telephony_service import telephony_service

# Initialize AsyncIOScheduler for FastAPI event loop
scheduler = AsyncIOScheduler()

# Default monitoring coordinates (Puri, Odisha / Coastal Belt: lat=19.81, lon=85.83)
DEFAULT_LAT = 19.81
DEFAULT_LON = 85.83
DEFAULT_REGION = "Puri"

# Severe Weather Thresholds
CYCLONE_WIND_THRESHOLD_KMH = 65.0
FLOOD_RAIN_THRESHOLD_MM = 50.0

async def poll_weather_and_trigger_advisories():
    """
    Automated background worker scheduled to run every 1 minute.
    Fetches real-time telemetry from Open-Meteo API, evaluates thresholds,
    and automatically triggers AI crop advisories + SMS/IVR dispatches when exceeded.
    """
    print("\n" + "=" * 65)
    print(f"[CRON] [{datetime.now().strftime('%H:%M:%S')}] Checking Open-Meteo Telemetry (Lat: {DEFAULT_LAT}, Lon: {DEFAULT_LON})...")
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={DEFAULT_LAT}&longitude={DEFAULT_LON}&current=temperature_2m,precipitation,wind_speed_10m"
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url)
            
        if response.status_code != 200:
            print(f"[CRON] [WARN] Open-Meteo API returned non-200 status code: {response.status_code}")
            return

        data = response.json()
        current = data.get("current", {})
        
        wind_speed_kmh = float(current.get("wind_speed_10m", 0.0))
        precipitation_mm = float(current.get("precipitation", 0.0))
        temp_c = float(current.get("temperature_2m", 0.0))

        print(f"[CRON] Telemetry -> Wind Speed: {wind_speed_kmh} km/h | 24h Rain: {precipitation_mm} mm | Temp: {temp_c} deg C")

        # Evaluate Thresholds
        is_cyclone = wind_speed_kmh > CYCLONE_WIND_THRESHOLD_KMH
        is_flood = precipitation_mm > FLOOD_RAIN_THRESHOLD_MM

        if is_cyclone or is_flood:
            event_type = "Cyclone" if is_cyclone else "Flash Flood"
            print(f"[ALERT] EXTREME WEATHER THRESHOLD EXCEEDED!")
            print(f"[ALERT] Event: {event_type} | Wind: {wind_speed_kmh} km/h (Threshold: >{CYCLONE_WIND_THRESHOLD_KMH}) | Rain: {precipitation_mm} mm (Threshold: >{FLOOD_RAIN_THRESHOLD_MM})")
            
            # Execute automated advisory generation & dispatch pipeline
            await _execute_automated_advisory_pipeline(
                district=DEFAULT_REGION,
                event_type=event_type,
                wind_speed_kmh=wind_speed_kmh,
                rainfall_mm=precipitation_mm
            )
        else:
            print(f"[CRON] [OK] Weather telemetry within safe parameters (Wind < {CYCLONE_WIND_THRESHOLD_KMH} km/h, Rain < {FLOOD_RAIN_THRESHOLD_MM} mm). No emergency action required.")

    except Exception as e:
        print(f"[CRON] [ERROR] Error in background weather polling job: {e}")
    finally:
        print("=" * 65 + "\n")

async def _execute_automated_advisory_pipeline(
    district: str,
    event_type: str,
    wind_speed_kmh: float,
    rainfall_mm: float
):
    """Internal runner to query affected farmers, generate AI advice, and dispatch SMS/IVR"""
    db = SessionLocal()
    try:
        # 1. Query Matching Farmers
        farmers = db.query(Farmer).filter(Farmer.district.ilike(f"%{district}%")).all()
        if not farmers:
            farmers = db.query(Farmer).limit(2).all()

        print(f"[PIPELINE] Identified {len(farmers)} farmer holding(s) in affected hazard zone: {district}")

        for farmer in farmers:
            safe_name = farmer.name.encode('ascii', 'ignore').decode('ascii') or "Farmer"
            print(f"[PIPELINE] Generating AI Agronomist advisory for {safe_name} (Crop: {farmer.crop_type}, Stage: {farmer.crop_stage})...")
            
            # 2. AI Reasoning
            advisory_data = await advisory_engine.generate_advisory(
                farmer_name=farmer.name,
                district=farmer.district,
                crop_type=farmer.crop_type,
                crop_stage=farmer.crop_stage,
                soil_type=farmer.soil_type,
                language=farmer.language,
                event_type=event_type,
                wind_speed_kmh=wind_speed_kmh,
                rainfall_mm=rainfall_mm
            )

            # 3. Save Advisory to DB
            advisory_record = Advisory(
                farmer_id=farmer.id,
                district=farmer.district,
                event_type=event_type,
                wind_speed_kmh=wind_speed_kmh,
                rainfall_mm=rainfall_mm,
                urgency_level=advisory_data.get("urgency_level", "CRITICAL"),
                english_advisory=advisory_data.get("english_advisory", ""),
                translated_advisory=advisory_data.get("translated_advisory", ""),
                language=advisory_data.get("language", farmer.language),
                points_json=json.dumps({
                    "english_points": advisory_data.get("english_points", []),
                    "translated_points": advisory_data.get("translated_points", []),
                    "reasoning": advisory_data.get("reasoning", "")
                })
            )
            db.add(advisory_record)
            db.commit()
            db.refresh(advisory_record)

            # 4. Synthesize Audio MP3
            audio_res = audio_service.generate_speech(
                text=advisory_record.translated_advisory,
                language=advisory_record.language,
                advisory_id=advisory_record.id
            )
            advisory_record.audio_filename = audio_res["filename"]
            advisory_record.audio_url = audio_res["audio_url"]
            db.commit()

            print(f"[PIPELINE] Audio broadcast synthesized: {audio_res['filename']}")

            # 5. Dispatch SMS
            sms_res = await telephony_service.send_sms(
                to_phone=farmer.phone,
                farmer_name=farmer.name,
                district=farmer.district,
                advisory_text=advisory_record.translated_advisory,
                urgency=advisory_record.urgency_level
            )
            sms_log = DispatchLog(
                advisory_id=advisory_record.id,
                farmer_id=farmer.id,
                farmer_name=farmer.name,
                farmer_phone=farmer.phone,
                district=farmer.district,
                channel="SMS",
                status=sms_res["status"],
                twilio_sid=sms_res.get("sid"),
                simulated=sms_res.get("simulated", True),
                created_at=datetime.utcnow()
            )
            db.add(sms_log)
            db.commit()

            # 6. Dispatch Automated IVR Call
            ivr_res = await telephony_service.trigger_ivr_call(
                to_phone=farmer.phone,
                farmer_name=farmer.name,
                advisory_id=advisory_record.id,
                audio_url=advisory_record.audio_url,
                advisory_text=advisory_record.translated_advisory,
                language=advisory_record.language
            )
            ivr_log = DispatchLog(
                advisory_id=advisory_record.id,
                farmer_id=farmer.id,
                farmer_name=farmer.name,
                farmer_phone=farmer.phone,
                district=farmer.district,
                channel="IVR",
                status=ivr_res["status"],
                twilio_sid=ivr_res.get("sid"),
                simulated=ivr_res.get("simulated", True),
                duration_seconds=ivr_res.get("duration_seconds", 35),
                ivr_response=ivr_res.get("ivr_response", "Auto-Triggered IVR Broadcast"),
                created_at=datetime.utcnow()
            )
            db.add(ivr_log)
            db.commit()

            print(f"[TELEPHONY] Auto-Dispatched SMS to {farmer.phone} (Status: {sms_log.status})")
            print(f"[TELEPHONY] Auto-Dispatched IVR Call to {farmer.phone} (Status: {ivr_log.status})")

    except Exception as e:
        print(f"[PIPELINE] [ERROR] Error in automated pipeline execution: {e}")
        db.rollback()
    finally:
        db.close()

def start_scheduler():
    """Start the APScheduler background polling engine"""
    if not scheduler.running:
        # Schedule the polling job to run every 1 minute
        scheduler.add_job(
            poll_weather_and_trigger_advisories,
            trigger="interval",
            minutes=1,
            id="open_meteo_weather_poller",
            replace_existing=True
        )
        scheduler.start()
        print("[SCHEDULER] APScheduler Background Engine started (Interval: 1 minute).")

def stop_scheduler():
    """Gracefully stop the APScheduler engine"""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("[SCHEDULER] APScheduler Background Engine stopped.")
