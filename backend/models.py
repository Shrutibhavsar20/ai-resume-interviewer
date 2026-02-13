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
