"""Interview Logic API endpoints"""

from fastapi import APIRouter
from backend.models import ChatRequest, QuestionRequest, AnswerRequest
from backend.question_generator import generate_questions
from backend.answer_evaluator import evaluate_answer
from backend.chatbot import chat_with_interviewer
from backend.interview_summary import generate_interview_summary
from backend.session import SESSION
from backend.database import SessionLocal, InterviewSession, User
from datetime import datetime
import json

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/set-interview-type/")
def set_interview_type(interview_type: str = None):
    """Set the interview type for the session
    
    Args:
        interview_type: Query parameter - must be one of: technical, practical, hr
    """
    if not interview_type:
        return {"success": False, "error": "Missing interview_type parameter"}
    
    if interview_type not in ["technical", "practical", "hr"]:
        return {"success": False, "error": "Invalid interview type. Must be: technical, practical, or hr"}
    
    SESSION["interview_type"] = interview_type
    SESSION["current_question"] = None  # Reset conversation
    SESSION["history"] = []
    
    return {"success": True, "message": f"Interview type set to {interview_type}"}


@router.post("/set-interview-level/")
def set_interview_level(level: str = None):
    """Set the interview difficulty level for the session"""
    if not level:
        return {"success": False, "error": "Missing level parameter"}
    if level not in ["junior", "mid", "senior"]:
        return {"success": False, "error": "Invalid level. Must be: junior, mid, or senior"}
    SESSION["level"] = level
    return {"success": True, "message": f"Interview level set to {level}"}


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


@router.post("/save-session/")
def save_interview_session(user_id: int = None):
    """Save current interview session to database"""
    history = SESSION.get("history", [])
    
    if not history:
        return {"success": False, "error": "No interview history to save"}
    
    # Calculate stats
    total_score = sum(item.get("score", 0) for item in history)
    avg_score = (total_score / len(history)) if history else 0
    
    try:
        db = SessionLocal()
        session_record = InterviewSession(
            user_id=user_id,
            interview_type=SESSION.get("interview_type", "technical"),
            level=SESSION.get("level", "junior"),
            total_questions=len(history),
            average_score=f"{avg_score:.1f}",
            duration_minutes=SESSION.get("duration_minutes", 0),
            history_data=json.dumps(history)
        )
        db.add(session_record)
        db.commit()
        db.refresh(session_record)
        return {
            "success": True,
            "session_id": session_record.id,
            "average_score": session_record.average_score
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()


@router.get("/sessions/user/{user_id}")
def get_user_sessions(user_id: int):
    """Get all interview sessions for a user"""
    db = SessionLocal()
    try:
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == user_id
        ).order_by(InterviewSession.created_at.desc()).all()
        
        return {
            "success": True,
            "total_sessions": len(sessions),
            "sessions": [
                {
                    "id": s.id,
                    "interview_type": s.interview_type,
                    "level": s.level,
                    "total_questions": s.total_questions,
                    "average_score": s.average_score,
                    "duration_minutes": s.duration_minutes,
                    "date": s.created_at.isoformat(),
                    "history": json.loads(s.history_data) if s.history_data else []
                }
                for s in sessions
            ]
        }
    finally:
        db.close()


@router.get("/sessions/user/{user_id}/recent")
def get_recent_sessions(user_id: int, limit: int = 3):
    """Get recent interview sessions for a user"""
    db = SessionLocal()
    try:
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == user_id
        ).order_by(InterviewSession.created_at.desc()).limit(limit).all()
        
        return {
            "success": True,
            "recent_sessions": [
                {
                    "id": s.id,
                    "interview_type": s.interview_type,
                    "level": s.level,
                    "total_questions": s.total_questions,
                    "average_score": float(s.average_score) if s.average_score else 0,
                    "duration_minutes": s.duration_minutes,
                    "date": s.created_at.strftime("%b %d, %Y"),
                    "questions_answered": s.total_questions,
                    "history": json.loads(s.history_data) if s.history_data else []
                }
                for s in sessions
            ]
        }
    finally:
        db.close()


@router.get("/sessions/user/{user_id}/stats")
def get_interview_stats(user_id: int):
    """Get aggregated interview statistics for a user"""
    db = SessionLocal()
    try:
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == user_id
        ).all()
        
        if not sessions:
            return {
                "success": True,
                "total_sessions": 0,
                "average_score": 0,
                "best_score": 0,
                "total_minutes": 0
            }
        
        scores = [float(s.average_score) for s in sessions if s.average_score]
        
        return {
            "success": True,
            "total_sessions": len(sessions),
            "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "best_score": max(scores) if scores else 0,
            "total_minutes": sum(s.duration_minutes for s in sessions)
        }
    finally:
        db.close()
