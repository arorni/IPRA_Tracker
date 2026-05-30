from sqlalchemy import Column, String, Text
import uuid

from database import Base

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True, index=True)
    agency_type = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True, default="NM")
    website_url = Column(String, nullable=True)
    nextrequest_url = Column(String, nullable=True)
    ipra_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    fax = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    


                
