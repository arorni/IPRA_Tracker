"""
Pydantic schemas for deadline tracking.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date


class DeadlineInfo(BaseModel):
    request_id: str
    submitted_date: Optional[date]
    three_business_day_deadline: Optional[date]
    fifteen_calendar_day_deadline: Optional[date]
    three_day_status: str   # "pending" | "approaching" | "passed"
    fifteen_day_status: str # "pending" | "approaching" | "passed"
    days_until_three_day: Optional[int]
    days_until_fifteen_day: Optional[int]
    note: str = "Holidays are not currently factored into calculations. TODO: Add NM holiday support."
