"""
IPRA requests router — CRUD + mark-as-submitted.
"""

from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from schemas.request import IPRARequestCreate, IPRARequestUpdate, IPRARequestOut, MarkSubmittedInput
from services.deadline_service import calculate_deadlines
from utils.mock_data import (
    get_all_requests, get_request, create_request, update_request, delete_request
)

router = APIRouter()


def _to_out(r: dict) -> IPRARequestOut:
    return IPRARequestOut(**{k: v for k, v in r.items() if k in IPRARequestOut.model_fields})


@router.get("", response_model=List[IPRARequestOut])
def list_requests():
    """Return all requests for the current user."""
    return [IPRARequestOut(**r) for r in get_all_requests()]


@router.post("", response_model=IPRARequestOut, status_code=201)
def create(data: IPRARequestCreate):
    """Create a new IPRA request as a draft."""
    record = create_request(data.model_dump())
    return IPRARequestOut(**record)


@router.get("/{request_id}", response_model=IPRARequestOut)
def get_one(request_id: str):
    """Get a single request by ID."""
    req = get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    return IPRARequestOut(**req)


@router.put("/{request_id}", response_model=IPRARequestOut)
def update(request_id: str, data: IPRARequestUpdate):
    """
    Update an existing request.
    Saves previous state in request_versions for audit trail.
    TODO Phase 2: Actually write old version to request_versions table.
    """
    req = get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    ALLOWED_TRANSITIONS_FROM_SUBMITTED = {"records_received", "closed"}

    if req["status"] == "submitted":
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

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    updated = update_request(request_id, updates)
    return IPRARequestOut(**updated)


@router.delete("/{request_id}", status_code=204)
def delete(request_id: str):
    """Delete a request."""
    if not delete_request(request_id):
        raise HTTPException(status_code=404, detail="Request not found.")


@router.post("/{request_id}/mark-submitted", response_model=IPRARequestOut)
def mark_submitted(request_id: str, data: MarkSubmittedInput):
    """
    Mark a request as submitted and calculate deadlines.
    A request must NOT be auto-submitted — the user must explicitly confirm.
    """
    req = get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    if req["status"] == "submitted":
        raise HTTPException(status_code=400, detail="Request is already marked as submitted.")

    deadlines = calculate_deadlines(data.submitted_date)

    updates = {
        "status": "submitted",
        "submitted_date": data.submitted_date,
        "submission_method": data.submission_method,
        "submission_notes": data.submission_notes,
        "three_day_deadline": deadlines["three_business_day_deadline"],
        "fifteen_day_deadline": deadlines["fifteen_calendar_day_deadline"],
        "is_overdue": False,
    }

    updated = update_request(request_id, updates)
    return IPRARequestOut(**updated)
