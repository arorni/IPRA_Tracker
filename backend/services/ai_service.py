"""
AI service for IPRA request management.

Provides:
- improve_request_draft(): Improve IPRA request wording
- summarize_document(): Summarize uploaded records
- suggest_follow_up_requests(): Suggest follow-up IPRA requests

If OPENAI_API_KEY is not set, returns clearly labeled placeholder responses.

AI SAFETY: This tool does NOT provide legal advice. All AI output is
clearly labeled as AI-generated. Users should verify all information.

TODO Phase 3: Connect real OpenAI API calls.
"""

import os
from typing import Optional

# TODO Phase 3: Uncomment and use real OpenAI client
# from openai import OpenAI
# client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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

    TODO Phase 3: Replace placeholder with real OpenAI call.
    """
    if not _ai_available():
        return {
            "improved_text": request_text,
            "suggestions": [
                "[DEMO OUTPUT] Specify a date range for the records you are requesting.",
                "[DEMO OUTPUT] Name the specific record type (emails, contracts, reports, etc.).",
                "[DEMO OUTPUT] Reference the relevant department or program name.",
                "[DEMO OUTPUT] Keep the request focused on one topic for faster response.",
            ],
            "is_demo": True,
            "disclaimer": DISCLAIMER,
        }

    # TODO Phase 3: Real AI call
    # response = client.chat.completions.create(
    #     model="gpt-4o",
    #     messages=[
    #         {"role": "system", "content": "You are an expert in New Mexico IPRA law. ..."},
    #         {"role": "user", "content": f"Improve this public records request for {agency_name}:\n\n{request_text}"}
    #     ]
    # )
    # return {"improved_text": response.choices[0].message.content, "is_demo": False}
    pass


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
