"""
AI service for IPRA request management.

Provides:
- improve_request_draft(): Improve IPRA request wording
- summarize_document(): Summarize uploaded records
- suggest_follow_up_requests(): Suggest follow-up IPRA requests

If OPENAI_API_KEY is not set, returns clearly labeled placeholder responses.

AI SAFETY: This tool does NOT provide legal advice. All AI output is
clearly labeled as AI-generated. Users should verify all information.

"""

import os
from typing import Optional

from openai import OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
model = os.environ.get("OPENAI_MODEL")

DISCLAIMER = (
    "This tool helps draft and track public records requests but does not "
    "provide legal advice. AI output should be reviewed carefully before use."
)


def _ai_available() -> bool:
    """Check if OpenAI API key is configured."""
    return bool(os.environ.get("OPENAI_API_KEY"))


def improve_request_draft(request_text: str, agency_name: str) -> dict:
    """
    Improve the wording of an IPRA request draft.
    Returns improved text and suggestions.
    """
    if not request_text or not request_text.strip():
        return {
                "success": False,
                "original_text": request_text,
                "improved_text":"", 
                "suggestions":["Please enter request text before using AI Improve."],
                "is_demo": False, 
                "disclaimer": DISCLAIMER}
    if len(request_text) > 5000:
        return {
            "success": False,
            "original_text": request_text,
            "improved_text": "", 
            "suggestions":["Request text is too long for AI Improve. Please shorten it before trying again."],
            "is_demo": False, 
            "disclaimer": DISCLAIMER
        }
    if not _ai_available():
        return {
            "success":False, 
            "original_text":request_text,
            "improved_text": "",
            "suggestions": [
                "[DEMO OUTPUT] Specify a date range for the records you are requesting.",
                "[DEMO OUTPUT] Name the specific record type (emails, contracts, reports, etc.).",
                "[DEMO OUTPUT] Reference the relevant department or program name.",
                "[DEMO OUTPUT] Keep the request focused on one topic for faster response.",
            ],
            "is_demo": True,
            "disclaimer": DISCLAIMER,
        }

    try:
        response = client.responses.create(
           model=model, 
           instructions=(
               "You help users improve New Mexico Inspection of Public Records Act "
                "(IPRA) request drafts. You do not provide legal advice. "
                "Rewrite the request to be clear, specific, professional, and focused. "
                "Preserve the user's intent. Do not invent facts, dates, departments, "
                "people, or record types that the user did not provide. "
                "If the draft is broad, improve it by making the wording more precise "
                "without changing the meaning. "
                "Return only the improved request text, with no markdown heading."
           ), 
           input=(
               f"Agency: {agency_name or 'the agency'}\n\n"
               f"Original request:\n{request_text}\n\n"
               "Please improve this public records request."
           ),
        )

        improved_text = response.output_text.strip()

        return{
            "success": True,
            "original_text":request_text, 
            "improved_text": improved_text,
            "suggestions": [
                "Review the AI-generated text before using it.",
                "Confirm the dates, departments, names, and record types are accurate.",
                "Make sure the final request reflects exactly what you want to ask for.",
                "Do not include greetings, closings, or thank-you language."
            ],
            "is_demo": False,
            "disclaimer": DISCLAIMER,
        }
    
    except Exception as e:
        return {
            "success":False,
            "original_text":request_text,
            "improved_text": "", 
            "suggestions":[
                "AI Improve is temporarily unavailable. Please try again later.",
            ],
            "is_demo": False, 
            "disclaimer": DISCLAIMER
        }


def summarize_document(document_text: str) -> dict:
    """
    Summarize an uploaded document.
    Identifies key dates, entities, topics, and potential follow-ups.

    TODO Phase 4: Replace placeholder with real OpenAI call.
    """
    if not _ai_available():
        return {
            "summary": "[DEMO OUTPUT] This is a placeholder document summary. Connect an OpenAI API key to enable real AI summarization.",
            "key_dates": ["[DEMO] Date not extracted — AI not configured"],
            "key_entities": ["[DEMO] Entities not extracted — AI not configured"],
            "major_topics": ["[DEMO] Topics not extracted — AI not configured"],
            "is_demo": True,
            "disclaimer": DISCLAIMER,
            "note": "If information is not found in the document, the AI will say 'not found in document' rather than guessing.",
        }

    # TODO Phase 4: Real AI call
    pass


def suggest_follow_up_requests(
    original_request: str,
    document_summary: Optional[str] = None
) -> dict:
    """
    Suggest follow-up IPRA requests based on original request and received documents.

    TODO Phase 5: Replace placeholder with real OpenAI call.
    """
    if not _ai_available():
        return {
            "suggestions": [
                "[DEMO OUTPUT] Request any attachments referenced in the received documents.",
                "[DEMO OUTPUT] Request communications between the specific officials mentioned.",
                "[DEMO OUTPUT] Request meeting minutes related to the topic.",
                "[DEMO OUTPUT] Request the underlying data or reports cited in the response.",
            ],
            "is_demo": True,
            "disclaimer": DISCLAIMER,
        }

    # TODO Phase 5: Real AI call
    pass
