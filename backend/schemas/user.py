"""
Pydantic schemas for users and authentication.
TODO Phase 2: Wire to real database and JWT.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class UserSignup(BaseModel):
    email: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
