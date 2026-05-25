"""
Deadline calculation service for IPRA requests.

IPRA Rules implemented:
1. Records should be made available immediately or as soon as practicable.
2. Records should be made available no later than 15 CALENDAR days after receipt.
3. If records are not available within 3 BUSINESS days, the agency must provide
   a written response explaining when records will be available.

TODO: Add New Mexico state holiday support for business day calculations.
      Reference: https://www.sos.nm.gov/state-holidays/
"""

from datetime import date, timedelta
from typing import Optional
from schemas.deadline import DeadlineInfo


def add_business_days(start_date: date, business_days: int) -> date:
    """
    Add N business days to start_date, skipping weekends.
    TODO: Also skip New Mexico state holidays.
    """
    current = start_date
    days_added = 0
    while days_added < business_days:
        current += timedelta(days=1)
        # Skip Saturday (5) and Sunday (6)
        if current.weekday() < 5:
            days_added += 1
    return current


def add_calendar_days(start_date: date, calendar_days: int) -> date:
    """Add N calendar days to start_date (weekends included)."""
    return start_date + timedelta(days=calendar_days)


def get_deadline_status(deadline: Optional[date], today: date) -> tuple[str, Optional[int]]:
    """
    Return status string and days remaining for a deadline.
    Status values: 'not_set', 'approaching', 'due_today', 'passed'
    """
    if deadline is None:
        return "not_set", None

    delta = (deadline - today).days

    if delta < 0:
        return "passed", delta
    elif delta == 0:
        return "due_today", 0
    elif delta <= 2:
        return "approaching", delta
    else:
        return "pending", delta


def calculate_deadlines(submitted_date: date) -> dict:
    """
    Calculate IPRA deadlines from the submitted date.
    Returns dict with both deadline dates.
    """
    three_day = add_business_days(submitted_date, 3)
    fifteen_day = add_calendar_days(submitted_date, 15)
    return {
        "three_business_day_deadline": three_day,
        "fifteen_calendar_day_deadline": fifteen_day,
    }


def build_deadline_info(request_id: str, submitted_date: Optional[date]) -> DeadlineInfo:
    """Build full DeadlineInfo for a request."""
    today = date.today()

    if submitted_date is None:
        return DeadlineInfo(
            request_id=request_id,
            submitted_date=None,
            three_business_day_deadline=None,
            fifteen_calendar_day_deadline=None,
            three_day_status="not_set",
            fifteen_day_status="not_set",
            days_until_three_day=None,
            days_until_fifteen_day=None,
        )

    deadlines = calculate_deadlines(submitted_date)
    three_deadline = deadlines["three_business_day_deadline"]
    fifteen_deadline = deadlines["fifteen_calendar_day_deadline"]

    three_status, three_days = get_deadline_status(three_deadline, today)
    fifteen_status, fifteen_days = get_deadline_status(fifteen_deadline, today)

    return DeadlineInfo(
        request_id=request_id,
        submitted_date=submitted_date,
        three_business_day_deadline=three_deadline,
        fifteen_calendar_day_deadline=fifteen_deadline,
        three_day_status=three_status,
        fifteen_day_status=fifteen_status,
        days_until_three_day=three_days,
        days_until_fifteen_day=fifteen_days,
    )
