"""
IPRA requests router — CRUD + mark-as-submitted.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from models.user import User

from database import get_db
from models.request import IPRARequest
from dependencies.auth import get_current_user


from schemas.request import IPRARequestCreate, IPRARequestUpdate, IPRARequestOut, MarkSubmittedInput
from services.deadline_service import calculate_deadlines

"""from utils.mock_data import (
    get_all_requests, get_request, create_request, update_request, delete_request
)"""

router = APIRouter()

"""
def _to_out(r: dict) -> IPRARequestOut:
    return IPRARequestOut(**{k: v for k, v in r.items() if k in IPRARequestOut.model_fields})
"""

@router.get("", response_model=List[IPRARequestOut])
def list_requests(db: Session=Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return all requests for the current user."""
    return db.query(IPRARequest).filter(IPRARequest.user_id == current_user.id).all()


@router.post("", response_model=IPRARequestOut, status_code=201)
def create(data: IPRARequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new IPRA request as a draft."""
    record = IPRARequest(
        id=str(uuid.uuid4()),
        user_id= current_user.id,
        status="draft",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        is_overdue=False, 
        **data.model_dump()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return record

@router.get("/{request_id}", response_model=IPRARequestOut)
def get_one(request_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a single request by ID."""
    req = db.query(IPRARequest).filter(IPRARequest.id == request_id, IPRARequest.user_id == current_user.id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    return req


@router.put("/{request_id}", response_model=IPRARequestOut)
def update(request_id: str, data: IPRARequestUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update an existing request.
    """
    req = db.query(IPRARequest).filter(IPRARequest.id == request_id, IPRARequest.user_id == current_user.id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    ALLOWED_TRANSITIONS_FROM_SUBMITTED = {"records_received", "closed"}

    if req.status == "submitted":
        # Only allow status-only transitions — no field edits on submitted requests
        non_status_fields = {
            k for k, v in data.model_dump().items()
            if v is not None and k != "status"
        }
        if non_status_fields:
            raise HTTPException(
                status_code=400,
                detail="Submitted requests cannot be edited. Only the status may be changed."
            )
        if data.status not in ALLOWED_TRANSITIONS_FROM_SUBMITTED:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from 'submitted' to '{data.status}'. Allowed: {ALLOWED_TRANSITIONS_FROM_SUBMITTED}."
            )

    updates = data.model_dump(exclude_unset=True)
    
    for field, value in updates.items():
        setattr(req, field, value)
    
    req.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=204)
def delete(request_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a request."""
    req = db.query(IPRARequest).filter(IPRARequest.id == request_id, IPRARequest.user_id == current_user.id).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    
    db.delete(req)
    db.commit()

    return None


@router.post("/{request_id}/mark-submitted", response_model=IPRARequestOut)
def mark_submitted(request_id: str, data: MarkSubmittedInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Mark a request as submitted and calculate deadlines.
    """
    req = db.query(IPRARequest).filter(IPRARequest.id == request_id, IPRARequest.user_id == current_user.id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    if req.status == "submitted":
        raise HTTPException(status_code=400, detail="Request is already marked as submitted.")

    deadlines = calculate_deadlines(data.submitted_date)

    req.status = "submitted"
    req.submitted_date = data.submitted_date
    req.submission_method = data.submission_method
    req.submission_notes = data.submission_notes
    req.three_day_deadline = deadlines["three_business_day_deadline"]
    req.fifteen_day_deadline = deadlines["fifteen_calendar_day_deadline"]
    req.is_overdue=False
    req.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(req)
    return req
