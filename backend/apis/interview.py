"""Interview Logic API endpoints"""

from fastapi import APIRouter
from backend.models import ChatRequest, QuestionRequest, AnswerRequest
from backend.question_generator import generate_questions
from backend.answer_evaluator import evaluate_answer
from backend.chatbot import chat_with_interviewer
from backend.interview_summary import generate_interview_summary
from backend.session import SESSION

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/generate-questions/")
def generate_interview_questions(request: QuestionRequest):
    """Generate interview questions based on skills and difficulty level"""
    questions = generate_questions(
        skills=request.skills,
        level=request.level
    )
    return {"questions": questions}


@router.post("/evaluate-answer/")
def evaluate_interview_answer(data: AnswerRequest):
    """Evaluate candidate's answer to an interview question"""
    evaluation = evaluate_answer(
        question=data.question,
        answer=data.answer
    )
    return {"evaluation": evaluation}


@router.post("/chat/")
def interview_chat(data: ChatRequest):
    """Send message to AI interviewer and get response"""
    return chat_with_interviewer(
        user_message=data.message,
        level=data.level
    )


@router.get("/summary/")
def interview_summary():
    """Get interview summary and performance metrics"""
    return generate_interview_summary()


@router.get("/debug-session/")
def debug_session():
    """Debug endpoint to check current session state"""
    return {
        "has_skills": bool(SESSION.get("skills")),
        "has_history": bool(SESSION.get("history")),
        "history_length": len(SESSION.get("history", [])),
        "history_items": SESSION.get("history", [])
    }
