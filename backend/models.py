from pydantic import BaseModel
from typing import List, Optional

class QuestionRequest(BaseModel):
    skills: List[str]
    level: str = "medium"
    interview_type: str = "technical"  # technical, practical, hr
    mode: Optional[str] = None


class AnswerRequest(BaseModel):
    question: str
    answer: str

class ChatRequest(BaseModel):
    message: str
    level: str = "medium"
    interview_type: str = "technical"  # technical, practical, hr
    mode: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str = ""

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

