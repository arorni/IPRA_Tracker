"""
Deadline tracking router.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.request import IPRARequest
from schemas.deadline import DeadlineInfo
from services.deadline_service import build_deadline_info


router = APIRouter()


@router.get("/{request_id}/deadlines", response_model=DeadlineInfo)
def get_deadlines(request_id: str, db: Session = Depends(get_db)):
    """Get deadline information for a specific request."""
    req = db.query(IPRARequest).filter(IPRARequest.id == request_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    if not req.agency_received_date:
        raise HTTPException(
            status_code=400,
            detail="Agency received date is not set. Deadlines cannot be calculated yet."
        )

    return build_deadline_info(request_id, req.agency_received_date)


@router.post("/{request_id}/calculate-deadlines", response_model=DeadlineInfo)
def recalculate_deadlines(request_id: str, db: Session = Depends(get_db)):
    """Recalculate and return deadlines for a request."""
    req = db.query(IPRARequest).filter(IPRARequest.id == request_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    if not req.agency_received_date:
        raise HTTPException(
            status_code=400,
            detail="Agency received date is not set. Deadlines cannot be calculated yet."
        )

    return build_deadline_info(request_id, req.agency_received_date)


@router.get("/dashboard/deadlines", response_model=List[DeadlineInfo])
def get_all_deadlines(db: Session = Depends(get_db)):
    """Get deadline info for all requests with agency received date."""
    requests = (
        db.query(IPRARequest)
        .filter(IPRARequest.agency_received_date.isnot(None))
        .all()
    )

    return [
        build_deadline_info(r.id, r.agency_received_date)
        for r in requests
    ]