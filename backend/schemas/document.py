"""
Pydantic schemas for uploaded documents.
TODO Phase 4: Full file upload and summarization.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentOut(BaseModel):
    id: str
    request_id: str
    user_id: str
    file_name: str
    file_path: str
    file_size: int
    file_type: str
    uploaded_at: datetime
    summary: Optional[str] = None
