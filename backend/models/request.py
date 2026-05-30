from sqlalchemy import Column, String, Text, Date, DateTime, Boolean, Enum
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base
from schemas.request import RequestStatus, SubmissionMethod

class IPRARequest(Base):
    __tablename__ = "requests"

    id = Column(
        String, 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )

    user_id = Column(
        String, 
        nullable=False
    )

    agency_id = Column(
    String,
    ForeignKey("agencies.id"),
    nullable=True
    )

    agency = relationship("Agency")

    title = Column(
        String,
        nullable=False
    )

    agency_name = Column(
        String, 
        nullable=False
    )

    agency_email = Column(
        String, 
        nullable=True
    )

    description = Column(
        Text, 
        nullable=False
    )

    request_text = Column(
    Text,
    nullable=False
    )
    
    status = Column(
        Enum(RequestStatus),
        default=RequestStatus.draft,
        nullable=False
    )

    notes = Column(
        Text, 
        nullable=True
    )

    created_at = Column(
        DateTime, 
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    submitted_date = Column(
        Date, 
        nullable=True
    )

    submission_method = Column(
        Enum(SubmissionMethod),
        nullable=True
    )

    submission_url = Column(
    String,
    nullable=True
    )

    request_identifier = Column(
    String,
    nullable=True
    )

    agency_received_date = Column(
    Date,
    nullable=True
    )

    submission_notes = Column(
    Text, 
    nullable=True
    )

    submission_notes = Column(
        Text, 
        nullable=True
    )

    three_day_deadline = Column(
        Date,
        nullable=True
    )

    fifteen_day_deadline = Column(
        Date, 
        nullable=True
    )

    is_overdue = Column(
        Boolean, 
        default=False
    )
