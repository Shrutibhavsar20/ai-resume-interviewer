from pydantic import BaseModel
from typing import List

class QuestionRequest(BaseModel):
    skills: List[str]
    level: str = "medium"


class AnswerRequest(BaseModel):
    question: str
    answer: str

class ChatRequest(BaseModel):
    message: str
    level: str = "medium"

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str = ""

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class PDFDownloadRequest(BaseModel):
    user_name: str
    level: str = "mid"
    questions_answers: list = []
    avg_score: float = 0
