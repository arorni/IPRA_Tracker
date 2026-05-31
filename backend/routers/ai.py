"""
AI service router.
Provides AI-assisted features for IPRA request management.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from sqlalchemy.orm import Session
from database import get_db
from dependencies.auth import get_current_user
from models.user import User

from services.ai_usage_service import check_and_increment_ai_usage
from services.ai_service import improve_request_draft, summarize_document, suggest_follow_up_requests



router = APIRouter()


class ImproveRequestInput(BaseModel):
    request_text: str
    agency_name: str


class SummarizeInput(BaseModel):
    document_text: str


class FollowUpInput(BaseModel):
    original_request: str
    document_summary: Optional[str] = None


@router.post("/improve-request")
def improve_request(data: ImproveRequestInput, 
                    db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    """
    Improve an IPRA request draft using AI.
    Returns improved text and specific suggestions.
    Limited to 3 uses per user per day
    """
    check_and_increment_ai_usage(
        db=db, 
        user_id=current_user.id, 
        feature_name="improve_request",
    )
    return improve_request_draft(data.request_text, data.agency_name)


@router.post("/summarize-document")
def summarize(data: SummarizeInput):
    """
    Summarize an uploaded document.
    Identifies key dates, entities, and topics.
    """
    return summarize_document(data.document_text)


@router.post("/suggest-followups")
def suggest_followups(data: FollowUpInput):
    """
    Suggest follow-up IPRA requests based on received records.
    """
    return suggest_follow_up_requests(data.original_request, data.document_summary)
