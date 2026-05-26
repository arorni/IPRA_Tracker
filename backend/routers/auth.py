"""
Authentication router.
Phase 2: Real JWT auth with bcrypt password hashing and PostgreSQL.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from dependencies.auth import get_current_user
from models.user import User
from schemas.user import UserSignup, UserLogin, UserOut, TokenResponse
from services.auth_service import hash_password, verify_password, create_access_token


router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Phase 1: return mock token for any signup
    user = User(email = data.email, full_name = data.full_name, hashed_password = hash_password(data.password),)
    
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
     Verify password with bcrypt, issue real JWT.
    """
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    

    token = create_access_token({"sub": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user":user
    }
    

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Return the current authenticated user.
    TODO Phase 2: Verify JWT from Authorization header.
    """
    return current_user
