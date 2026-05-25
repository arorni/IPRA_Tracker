"""
Synthetic mock data for Phase 1.

FOR TESTING ONLY — SYNTHETIC SAMPLE DATA.
All agencies, people, and emails are fictional.

TODO Phase 2: Replace with real PostgreSQL database.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List
import uuid

# ── Mock Agencies ──────────────────────────────────────────────────────────────
MOCK_AGENCIES = [
    {
        "id": "agency-001",
        "name": "New Mexico Department of Sample Services",
        "email": "records@sample-nmds.gov.example",
        "address": "123 State Plaza, Santa Fe, NM 87501",
    },
    {
        "id": "agency-002",
        "name": "City of Demo Records Office",
        "email": "publicrecords@demo-city.gov.example",
        "address": "456 Municipal Drive, Albuquerque, NM 87102",
    },
    {
        "id": "agency-003",
        "name": "Sample County Clerk's Office",
        "email": "clerk@sample-county.gov.example",
        "address": "789 County Road, Las Cruces, NM 88001",
    },
]

# ── Mock User ──────────────────────────────────────────────────────────────────
MOCK_USER = {
    "id": "user-001",
    "email": "testuser@example.com",
    "full_name": "Test Researcher",
    "password_hash": "not-a-real-hash",  # Phase 2: real bcrypt hash
}

# ── Mock Requests ──────────────────────────────────────────────────────────────
today = date.today()

MOCK_REQUESTS: Dict[str, dict] = {
    "req-001": {
        "id": "req-001",
        "user_id": "user-001",
        "title": "Budget Reports FY2024",
        "agency_name": "New Mexico Department of Sample Services",
        "agency_email": "records@sample-nmds.gov.example",
        "description": "Requesting annual budget documents",
        "request_text": (
            "Pursuant to the New Mexico Inspection of Public Records Act (NMSA 1978, § 14-2-1 et seq.), "
            "I request copies of all budget reports, expenditure reports, and financial statements "
            "for fiscal year 2024. Please include any amendments or revised versions."
        ),
        "status": "submitted",
        "notes": "Submitted via email to records coordinator.",
        "created_at": datetime.now() - timedelta(days=10),
        "updated_at": datetime.now() - timedelta(days=8),
        "submitted_date": today - timedelta(days=8),
        "submission_method": "email",
        "submission_notes": "Submitted to records@sample-nmds.gov.example",
        "three_day_deadline": today - timedelta(days=5),   # already passed
        "fifteen_day_deadline": today + timedelta(days=7),
        "is_overdue": False,
    },
    "req-002": {
        "id": "req-002",
        "user_id": "user-001",
        "title": "Meeting Minutes — Planning Board Q1",
        "agency_name": "City of Demo Records Office",
        "agency_email": "publicrecords@demo-city.gov.example",
        "description": "Q1 2024 planning board meeting minutes",
        "request_text": (
            "Pursuant to the New Mexico Inspection of Public Records Act, I request all meeting "
            "minutes, agendas, and exhibits from the Planning Board meetings held between "
            "January 1, 2024 and March 31, 2024."
        ),
        "status": "draft",
        "notes": None,
        "created_at": datetime.now() - timedelta(days=2),
        "updated_at": datetime.now() - timedelta(days=2),
        "submitted_date": None,
        "submission_method": None,
        "submission_notes": None,
        "three_day_deadline": None,
        "fifteen_day_deadline": None,
        "is_overdue": False,
    },
    "req-003": {
        "id": "req-003",
        "user_id": "user-001",
        "title": "Vendor Contracts 2023",
        "agency_name": "Sample County Clerk's Office",
        "agency_email": "clerk@sample-county.gov.example",
        "description": "All vendor contracts executed in 2023",
        "request_text": (
            "Pursuant to the New Mexico Inspection of Public Records Act, I request copies of "
            "all vendor contracts, purchase orders, and agreements executed by Sample County "
            "during calendar year 2023, including any amendments or addenda."
        ),
        # Overdue is CALCULATED from deadline dates — NOT a manual status
        "status": "submitted",
        "notes": "No response received after 15-day deadline.",
        "created_at": datetime.now() - timedelta(days=25),
        "updated_at": datetime.now() - timedelta(days=25),
        "submitted_date": today - timedelta(days=20),
        "submission_method": "mail",
        "submission_notes": "Sent certified mail",
        "three_day_deadline": today - timedelta(days=17),
        "fifteen_day_deadline": today - timedelta(days=5),
        "is_overdue": True,  # 15-day deadline has passed
    },
    "req-004": {
        "id": "req-004",
        "user_id": "user-001",
        "title": "Employee Roster — Public Works Dept",
        "agency_name": "City of Demo Records Office",
        "agency_email": "publicrecords@demo-city.gov.example",
        "description": "Names and titles of Public Works employees",
        "request_text": (
            "Pursuant to the New Mexico Inspection of Public Records Act, I request a current "
            "roster of all employees in the Public Works Department, including names, titles, "
            "and department assignments. Exclude home addresses and personal phone numbers."
        ),
        "status": "records_received",
        "notes": "Records received on time. Partial response — follow-up may be needed.",
        "created_at": datetime.now() - timedelta(days=30),
        "updated_at": datetime.now() - timedelta(days=15),
        "submitted_date": today - timedelta(days=30),
        "submission_method": "online_portal",
        "submission_notes": "Submitted through city portal",
        "three_day_deadline": today - timedelta(days=27),
        "fifteen_day_deadline": today - timedelta(days=15),
        "is_overdue": False,
    },
    "req-005": {
        "id": "req-005",
        "user_id": "user-001",
        "title": "Inspector General Reports 2022-2023",
        "agency_name": "New Mexico Department of Sample Services",
        "agency_email": "records@sample-nmds.gov.example",
        "description": "IG audit and investigation reports",
        "request_text": (
            "Pursuant to the New Mexico Inspection of Public Records Act, I request all Inspector "
            "General reports, audits, and investigative summaries produced between January 1, 2022 "
            "and December 31, 2023."
        ),
        "status": "ready_to_submit",
        "notes": "Draft reviewed and ready.",
        "created_at": datetime.now() - timedelta(days=1),
        "updated_at": datetime.now() - timedelta(hours=2),
        "submitted_date": None,
        "submission_method": None,
        "submission_notes": None,
        "three_day_deadline": None,
        "fifteen_day_deadline": None,
        "is_overdue": False,
    },
}

# ── Mock Documents ─────────────────────────────────────────────────────────────
MOCK_DOCUMENTS: Dict[str, dict] = {
    "doc-001": {
        "id": "doc-001",
        "request_id": "req-004",
        "user_id": "user-001",
        "file_name": "public_works_roster_FOR_TESTING_ONLY.pdf",
        "file_path": "backend/uploads/doc-001.pdf",
        "file_size": 48200,
        "file_type": "application/pdf",
        "uploaded_at": datetime.now() - timedelta(days=15),
        "summary": "FOR TESTING ONLY — SYNTHETIC SAMPLE RECORD. This document contains a partial list of Public Works staff.",
    },
    "doc-002": {
        "id": "doc-002",
        "request_id": "req-001",
        "user_id": "user-001",
        "file_name": "budget_summary_fy2024_FOR_TESTING_ONLY.pdf",
        "file_path": "backend/uploads/doc-002.pdf",
        "file_size": 125000,
        "file_type": "application/pdf",
        "uploaded_at": datetime.now() - timedelta(days=3),
        "summary": None,
    },
}


def get_all_requests(user_id: str = "user-001") -> List[dict]:
    return [r for r in MOCK_REQUESTS.values() if r["user_id"] == user_id]


def get_request(request_id: str) -> dict | None:
    return MOCK_REQUESTS.get(request_id)


def create_request(data: dict) -> dict:
    req_id = f"req-{str(uuid.uuid4())[:8]}"
    now = datetime.now()
    record = {
        "id": req_id,
        "user_id": "user-001",
        "status": "draft",
        "created_at": now,
        "updated_at": now,
        "submitted_date": None,
        "submission_method": None,
        "submission_notes": None,
        "three_day_deadline": None,
        "fifteen_day_deadline": None,
        "is_overdue": False,
        **data,
    }
    MOCK_REQUESTS[req_id] = record
    return record


def update_request(request_id: str, updates: dict) -> dict | None:
    req = MOCK_REQUESTS.get(request_id)
    if not req:
        return None
    req.update({**updates, "updated_at": datetime.now()})
    # Recalculate is_overdue whenever deadlines are present
    if req.get("fifteen_day_deadline"):
        req["is_overdue"] = (
            req["fifteen_day_deadline"] < date.today()
            and req["status"] not in ("records_received", "closed")
        )
    return req


def delete_request(request_id: str) -> bool:
    if request_id in MOCK_REQUESTS:
        del MOCK_REQUESTS[request_id]
        return True
    return False


def get_documents_for_request(request_id: str) -> List[dict]:
    return [d for d in MOCK_DOCUMENTS.values() if d["request_id"] == request_id]
