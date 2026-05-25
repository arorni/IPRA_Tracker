"""
Document upload router.
TODO Phase 4: Implement real file upload and metadata storage.
Files will be stored in backend/uploads/ for MVP.
Replace with cloud object storage (S3, GCS, etc.) in production.
"""

from fastapi import APIRouter, HTTPException
from typing import List
from schemas.document import DocumentOut
from utils.mock_data import get_documents_for_request, get_request

router = APIRouter()


@router.get("/{request_id}/documents", response_model=List[DocumentOut])
def list_documents(request_id: str):
    """List all uploaded documents for a request."""
    req = get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    return [DocumentOut(**d) for d in get_documents_for_request(request_id)]


@router.post("/{request_id}/documents/upload")
def upload_document(request_id: str):
    """
    Upload a document for a request.
    TODO Phase 4: Accept multipart/form-data, save to backend/uploads/,
    store metadata in uploaded_documents table.
    """
    raise HTTPException(
        status_code=501,
        detail="Document upload is not yet implemented. Coming in Phase 4."
    )
