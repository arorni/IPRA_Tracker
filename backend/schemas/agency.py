from pydantic import BaseModel
from typing import Optional

class AgencyOut(BaseModel):
    id: str
    name: str
    agency_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    website_url: Optional[str] = None
    nextrequest_url: Optional[str] = None
    ipra_email: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    notes: Optional[str] = None
    model_config = {
        "from_attributes":True
    }

class AgencyCreate(BaseModel):
    name: str
    agency_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    website_url: Optional[str] = None
    nextrequest_url: Optional[str] = None
    ipra_email: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    notes: str | None = None