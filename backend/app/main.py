import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings, AUDIO_DIR
from app.database.session import init_db
from app.api.farmers import router as farmers_router
from app.api.weather import router as weather_router
from app.api.advisory import router as advisory_router
from app.api.audio import router as audio_router
from app.api.alerts import router as alerts_router
from app.api.twilio_webhook import router as twilio_router
from app.api.stats import router as stats_router
from app.api.scheduler_api import router as scheduler_router
from app.services.scheduler_service import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan handler:
    - Startup: Initialise database, seed farm holdings, ensure audio static directory,
      and boot the APScheduler background Open-Meteo polling engine.
    - Shutdown: Gracefully stop the background polling engine.
    """
    print("\n" + "=" * 65)
    print("[STARTUP] Starting AgriShield AI Advisory Platform...")
    print("[STARTUP] Initializing SQLite database & seeding agricultural profiles...")
    init_db()
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    
    # Start APScheduler background weather polling engine (every 1 minute)
    start_scheduler()
    print("=" * 65 + "\n")
    
    yield
    
    # Graceful Shutdown
    print("\n" + "=" * 65)
    print("[SHUTDOWN] Shutting down AgriShield AI Backend...")
    stop_scheduler()
    print("=" * 65 + "\n")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Climate-Resilient Agriculture Advisory System with Automated Background Telemetry & IVR Voice Telephony",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Next.js dashboard and external test clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers (Existing manual trigger endpoints remain 100% intact)
app.include_router(farmers_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(advisory_router, prefix=settings.API_V1_STR)
app.include_router(audio_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(twilio_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(scheduler_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "AgriShield AI",
        "purpose": "Climate-Resilient Smart Agriculture Advisory & IVR Voice Platform",
        "status": "ONLINE",
        "version": "2.0.0",
        "background_scheduler": "ACTIVE (1-minute interval)",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "scheduler_running": True,
        "mock_telephony": settings.MOCK_TELEPHONY,
        "gemini_active": bool(settings.GEMINI_API_KEY),
        "twilio_active": bool(settings.TWILIO_ACCOUNT_SID and not settings.MOCK_TELEPHONY)
    }
