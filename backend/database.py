"""
Database configuration.
TODO Phase 2: Replace with real PostgreSQL + SQLAlchemy connection.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:pass@localhost/ipra")

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
"""

# Phase 1: no-op placeholder
def get_db():
    """Phase 2: yields a real SQLAlchemy session."""
    pass
