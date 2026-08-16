import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
AUDIO_DIR = BASE_DIR / "app" / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriShield AI - Intelligent Climate-Resilient Agriculture Advisory"
    API_V1_STR: str = "/api"
    
    # AI Keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Twilio Telephony Settings
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    TEST_RECEIVER_PHONE: Optional[str] = "+919876543210"
    
    # Telephony Mock Mode
    MOCK_TELEPHONY: bool = True
    
    # Public Base URL for Twilio Webhooks & Audio streaming
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
    
    # Database (Default to local SQLite, handles postgresql:// dialect fix if deployed on Render/Railway)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/agrishield.db")
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Fix Heroku / Render legacy postgres:// uri schema for SQLAlchemy 2.0
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)

if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
    pass
else:
    settings.MOCK_TELEPHONY = True
