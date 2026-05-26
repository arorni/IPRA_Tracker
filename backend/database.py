"""
Database configuration.
Phase 2: Replace with real PostgreSQL + SQLAlchemy connection.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/ipra")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Please add it to backend/.env")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()