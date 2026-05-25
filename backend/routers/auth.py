"""
Authentication router.
Phase 1: Mock auth — accepts any credentials and returns a mock token.
TODO Phase 2: Real JWT auth with bcrypt password hashing and PostgreSQL.
"""

from fastapi import APIRouter, HTTPException
from schemas.user import UserSignup, UserLogin, UserOut, TokenResponse
from utils.mock_data import MOCK_USER

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(data: UserSignup):
    """
    Register a new user.
    TODO Phase 2: Hash password with bcrypt, save to database, return real JWT.
    """
    # Phase 1: return mock token for any signup
    user = UserOut(id="user-001", email=data.email, full_name=data.full_name)
    return TokenResponse(access_token="mock-jwt-token-phase1", user=user)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    """
    Login and receive a JWT token.
    TODO Phase 2: Verify password with bcrypt, issue real JWT.
    """
    # Phase 1: accept any credentials
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Email and password required.")
    user = UserOut(id="user-001", email=data.email, full_name="Demo User")
    return TokenResponse(access_token="mock-jwt-token-phase1", user=user)


@router.get("/me", response_model=UserOut)
def get_me():
    """
    Return the current authenticated user.
    TODO Phase 2: Verify JWT from Authorization header.
    """
    return UserOut(
        id=MOCK_USER["id"],
        email=MOCK_USER["email"],
        full_name=MOCK_USER["full_name"],
    )
