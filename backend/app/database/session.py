import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.database.models import Base, Farmer

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Re-seed farmers with multi-regional agricultural profiles
        if db.query(Farmer).count() == 0:
            seed_farmers = [
                Farmer(
                    name="Rajesh Patil (राजेश पाटिल)",
                    phone="+919822012345",
                    district="Nashik",
                    crop_type="Onion & Grapes",
                    crop_stage="Harvest-Ready",
                    soil_type="Black Cotton Soil",
                    language="hi",
                    latitude=19.9975,
                    longitude=73.7898
                ),
                Farmer(
                    name="Harpreet Singh (ਹਰਪ੍ਰੀਤ ਸਿੰਘ)",
                    phone="+919814023456",
                    district="Ludhiana",
                    crop_type="Wheat",
                    crop_stage="Flowering",
                    soil_type="Alluvial Loam",
                    language="hi",
                    latitude=30.9010,
                    longitude=75.8573
                ),
                Farmer(
                    name="K. Venkat Rao (కె. వెంకట్ రావు)",
                    phone="+919848034567",
                    district="Guntur",
                    crop_type="Chilli & Cotton",
                    crop_stage="Vegetative",
                    soil_type="Red Sandy Loam",
                    language="hi",
                    latitude=16.3067,
                    longitude=80.4365
                ),
                Farmer(
                    name="Ramesh Pradhan (ରମେଶ ପ୍ରଧାନ)",
                    phone="+919861045678",
                    district="Puri",
                    crop_type="Paddy",
                    crop_stage="Harvest-Ready",
                    soil_type="Clayey Delta",
                    language="or",
                    latitude=19.8135,
                    longitude=85.8312
                ),
                Farmer(
                    name="M. Selvakumar (செல்வகுமார்)",
                    phone="+919840056789",
                    district="Thanjavur",
                    crop_type="Paddy (Samba)",
                    crop_stage="Tillering",
                    soil_type="Riverine Alluvial",
                    language="hi",
                    latitude=10.7870,
                    longitude=79.1378
                ),
                Farmer(
                    name="Bhavesh Patel (ભાવેશ પટેલ)",
                    phone="+919825067890",
                    district="Anand",
                    crop_type="Groundnut & Tobacco",
                    crop_stage="Flowering",
                    soil_type="Sandy Loam",
                    language="hi",
                    latitude=22.5645,
                    longitude=72.9289
                ),
                Farmer(
                    name="Subrata Banerjee (সুব্রত ব্যানার্জি)",
                    phone="+919831078901",
                    district="Midnapore",
                    crop_type="Mustard & Paddy",
                    crop_stage="Seedling",
                    soil_type="Saline Alluvial",
                    language="hi",
                    latitude=22.4257,
                    longitude=87.3199
                ),
                Farmer(
                    name="Ramashish Yadav (रामाशीष यादव)",
                    phone="+919835089012",
                    district="Patna",
                    crop_type="Maize & Pulses",
                    crop_stage="Flowering",
                    soil_type="Gangetic Silt",
                    language="hi",
                    latitude=25.5941,
                    longitude=85.1376
                )
            ]
            db.add_all(seed_farmers)
            db.commit()
            print(f"[OK] Database initialized and seeded with {len(seed_farmers)} multi-regional agricultural farmers.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
