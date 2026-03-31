"""API Router modules for InterviewIQ backend"""

from .auth import router as auth_router
from .resume import router as resume_router
from .interview import router as interview_router

__all__ = ["auth_router", "resume_router", "interview_router"]
