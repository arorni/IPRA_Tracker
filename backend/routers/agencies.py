from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.agency import Agency
from schemas.agency import AgencyOut, AgencyCreate

router = APIRouter()

@router.get("", response_model=List[AgencyOut])
def list_agencies(db: Session = Depends(get_db)):
    return db.query(Agency).order_by(Agency.name).all()


@router.get("/{agency_id}", response_model=AgencyOut)
def get_agency(agency_id: str, db: Session = Depends(get_db)):
    return db.query(Agency).filter(Agency.id == agency_id).first()

@router.post("", response_model=AgencyOut)
def create_agency(data: AgencyCreate, db: Session = Depends(get_db)):
    
    existing = (db.query(Agency).filter(Agency.name == data.name).first())

    if existing:
        raise HTTPException(status_code=400, detail="Agency already exists.")

    agency = Agency(**data.model_dump())

    db.add(agency)
    db.commit()
    db.refresh(agency)

    return agency