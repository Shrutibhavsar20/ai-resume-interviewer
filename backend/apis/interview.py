"""Interview Logic API endpoints"""

from fastapi import APIRouter
from backend.models import ChatRequest, QuestionRequest, AnswerRequest
from backend.question_generator import generate_questions
from backend.answer_evaluator import evaluate_answer
from backend.chatbot import chat_with_interviewer
from backend.interview_summary import generate_interview_summary
from backend.session import SESSION

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/set-interview-type/")
def set_interview_type(interview_type: str):
    """Set the interview type for the session"""
    if interview_type not in ["technical", "practical", "hr"]:
        return {"success": False, "error": "Invalid interview type. Must be: technical, practical, or hr"}
    
    SESSION["interview_type"] = interview_type
    SESSION["current_question"] = None  # Reset conversation
    SESSION["history"] = []
    
    return {"success": True, "message": f"Interview type set to {interview_type}"}


@router.post("/generate-questions/")
def generate_interview_questions(request: QuestionRequest):
    """Generate interview questions based on skills and difficulty level"""
    interview_type = request.interview_type or request.mode or SESSION.get("interview_type", "technical")
    questions = generate_questions(
        skills=request.skills,
        level=request.level,
        interview_type=interview_type
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
    interview_type = data.interview_type or data.mode or SESSION.get("interview_type", "technical")
    return chat_with_interviewer(
        user_message=data.message,
        level=data.level,
        interview_type=interview_type
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
