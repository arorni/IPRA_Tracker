"""
Pydantic schemas for users and authentication.
"""
from pydantic import BaseModel, EmailStr, Field



class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    model_config = {
        "from_attributes": True
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
