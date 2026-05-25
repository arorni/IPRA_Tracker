"""
AI service router.
Returns placeholder responses in Phase 1.
TODO Phase 3/4/5: Connect real OpenAI API.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
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
def improve_request(data: ImproveRequestInput):
    """
    Improve an IPRA request draft using AI.
    Returns improved text and specific suggestions.
    """
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
