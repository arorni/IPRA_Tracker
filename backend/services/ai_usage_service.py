from datetime import date
from fastapi import HTTPException
from sqlalchemy.orm import Session
import os
from models.ai_usage import AIUsage

DAILY_AI_IMPROVE_LIMIT = int(os.getenv("DAILY_AI_IMPROVE_LIMIT"))

def check_and_increment_ai_usage(db: Session, user_id: str, feature_name:str = "improve_request"):
    today = date.today()

    usage = (db.query(AIUsage)
             .filter(AIUsage.user_id == user_id, AIUsage.feature_name == feature_name, 
                     AIUsage.usage_date == today, ).first())
    
    if usage and usage.count >= DAILY_AI_IMPROVE_LIMIT:
        raise HTTPException(status_code=429, detail= "Daily AI Improve limit reached. Please try again tomorrow.")
    
    if not usage:
        usage = AIUsage(user_id=user_id, feature_name=feature_name, usage_date=today, count=1)
        db.add(usage)
    else:
        usage.count += 1

    db.commit()



