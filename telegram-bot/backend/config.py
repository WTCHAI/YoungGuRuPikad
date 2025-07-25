import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# App configuration
class Settings:
    database_url: str = DATABASE_URL
    app_name: str = "Device Monitoring & Blockchain Events API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"

settings = Settings()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
