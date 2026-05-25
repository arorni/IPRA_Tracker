"""
Pydantic schemas for IPRA requests.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from enum import Enum


class RequestStatus(str, Enum):
    draft = "draft"
    ready_to_submit = "ready_to_submit"
    submitted = "submitted"
    records_received = "records_received"
    closed = "closed"
    # NOTE: "overdue" is NOT a manual status.
    # Overdue is calculated from deadline dates and surfaced via is_overdue flag.


class SubmissionMethod(str, Enum):
    email = "email"
    portal = "online_portal"
    mail = "mail"
    phone = "phone"
    other = "other"


class IPRARequestCreate(BaseModel):
    title: str
    agency_name: str
    agency_email: Optional[str] = None
    description: str
    request_text: str
    notes: Optional[str] = None


class IPRARequestUpdate(BaseModel):
    title: Optional[str] = None
    agency_name: Optional[str] = None
    agency_email: Optional[str] = None
    description: Optional[str] = None
    request_text: Optional[str] = None
    status: Optional[RequestStatus] = None
    notes: Optional[str] = None


class MarkSubmittedInput(BaseModel):
    submission_method: SubmissionMethod
    submitted_date: date
    submission_notes: Optional[str] = None


class IPRARequestOut(BaseModel):
    id: str
    user_id: str
    title: str
    agency_name: str
    agency_email: Optional[str]
    description: str
    request_text: str
    status: RequestStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    submitted_date: Optional[date]
    submission_method: Optional[str]
    submission_notes: Optional[str]
    three_day_deadline: Optional[date]
    fifteen_day_deadline: Optional[date]
    is_overdue: bool
