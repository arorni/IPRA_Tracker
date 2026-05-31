from sqlalchemy import Column, String, Date, Integer, UniqueConstraint
from datetime import date
import uuid

from database import Base

class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    feature_name = Column(String, nullable=False, default="improve_request")
    usage_date = Column(Date, nullable=False, default=date.today)
    count = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint("user_id", "feature_name", "usage_date", name="uq-ai-usage-user-feature-date"),
    )
