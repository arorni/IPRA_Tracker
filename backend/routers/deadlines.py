"""
Deadline tracking router.
"""

from fastapi import APIRouter, HTTPException
from schemas.deadline import DeadlineInfo
from services.deadline_service import build_deadline_info
from utils.mock_data import get_request, get_all_requests
from typing import List

router = APIRouter()


@router.get("/{request_id}/deadlines", response_model=DeadlineInfo)
def get_deadlines(request_id: str):
    """Get deadline information for a specific request."""
    req = get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    return build_deadline_info(request_id, req.get("submitted_date"))


@router.post("/{request_id}/calculate-deadlines", response_model=DeadlineInfo)
def recalculate_deadlines(request_id: str):
    """Recalculate and return deadlines for a request."""
    req = get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if not req.get("submitted_date"):
        raise HTTPException(status_code=400, detail="Request has not been submitted yet.")
    return build_deadline_info(request_id, req["submitted_date"])


@router.get("/dashboard/deadlines", response_model=List[DeadlineInfo])
def get_all_deadlines():
    """Get deadline info for all submitted requests (for dashboard)."""
    requests = get_all_requests()
    submitted = [r for r in requests if r.get("submitted_date")]
    return [build_deadline_info(r["id"], r["submitted_date"]) for r in submitted]
