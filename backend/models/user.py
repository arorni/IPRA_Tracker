from sqlalchemy import Column, String, DateTime
from datetime import datetime
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(
        String, 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )

    email = Column(
        String, 
        unique=True,
        nullable=False, 
        index=True
    )

    full_name = Column(
        String, 
        nullable=False
    )

    hashed_password = Column(
        String, 
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

