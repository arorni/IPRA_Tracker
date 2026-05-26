"""
IPRA Request Manager - FastAPI Backend
Phase 1: Mock data, no real database or auth
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models.request import IPRARequest
from models.user import User
from routers import auth, requests, deadlines, documents, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IPRA Request Manager API",
    description="New Mexico IPRA Public Records Request Management",
    version="0.2.0",
)

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(requests.router, prefix="/requests", tags=["requests"])
app.include_router(deadlines.router, prefix="/requests", tags=["deadlines"])
app.include_router(documents.router, prefix="/requests", tags=["documents"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": "0.1.0", "phase": 1}
