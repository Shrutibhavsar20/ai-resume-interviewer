from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, Response
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from backend.models import ChatRequest, QuestionRequest, LoginRequest, SignupRequest, ResetPasswordRequest
import shutil

from backend.resume_parser import extract_text_from_file, clean_text
from backend.skill_extractor import extract_skills
from backend.question_generator import generate_questions
from backend.answer_evaluator import evaluate_answer
from backend.models import AnswerRequest

from backend.chatbot import chat_with_interviewer
from pydantic import BaseModel

from backend.interview_summary import generate_interview_summary
from backend.auth import login_user, register_user, reset_password, oauth_login
from backend.session import SESSION
from backend.database import init_db, SessionLocal, Resume
from fastapi import Form

from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize database
init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent

# Serve frontend static files
app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "frontend"),
    name="static"
)

# ─── AUTHENTICATION ENDPOINTS ───────────────────────────────────────────────
@app.post("/signup/")
async def signup(request: SignupRequest):
    result = register_user(request.email, request.password, request.name)
    if result.get("success"):
        return {"success": True, "message": "Account created successfully"}
    return {"success": False, "error": result.get("error", "Registration failed")}

@app.post("/login/")
async def login(request: LoginRequest):
    result = login_user(request.email, request.password)
    if result.get("success"):
        return {"success": True, "user": result.get("user")}
    return {"success": False, "error": result.get("error", "Login failed")}

@app.post("/reset-password/")
async def reset_pwd(request: ResetPasswordRequest):
    result = reset_password(request.email, request.new_password)
    if result.get("success"):
        return {"success": True, "message": "Password reset successfully"}
    return {"success": False, "error": result.get("error", "Password reset failed")}

@app.post("/auth/oauth-callback/")
async def oauth_callback(request: dict):
    """Handle OAuth login (Google/LinkedIn)"""
    email = request.get("email")
    name = request.get("name")
    
    if not email or not name:
        return {"success": False, "error": "Email and name are required"}
    
    result = oauth_login(email, name)
    if result.get("success"):
        return {"success": True, "user": result.get("user")}
    return {"success": False, "error": result.get("error", "OAuth login failed")}

# ─── INTERVIEW ENDPOINTS ────────────────────────────────────────────────────
@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...), user_id: int = Form(None)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text_from_file(file_path)
    clean_resume = clean_text(raw_text)

    with open("data/skills.txt") as f:
        skills_list = [s.strip() for s in f.readlines()]

    skills = extract_skills(clean_resume, skills_list)

    # Persist to DB if user logged in
    resume_id = None
    if user_id:
        db = SessionLocal()
        try:
            new_resume = Resume(
                user_id=user_id,
                filename=file.filename,
                text=clean_resume,
                skills=",".join(skills)
            )
            db.add(new_resume)
            db.commit()
            db.refresh(new_resume)
            resume_id = new_resume.id
        except Exception as e:
            db.rollback()
            return {"success": False, "error": f"Could not save resume: {e}"}
        finally:
            db.close()

    # Save skills to session for interview
    SESSION["skills"] = skills
    SESSION["resume_text"] = clean_resume
    SESSION["current_question"] = None
    SESSION["history"] = []
    SESSION["resume_id"] = resume_id

    return {
        "success": True,
        "resume_id": resume_id,
        "resume_text": clean_resume[:500],
        "skills_found": skills,
        "message": "Resume uploaded successfully!"
    }


@app.get("/user-resumes/")
def user_resumes(user_id: int):
    db = SessionLocal()
    try:
        items = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.updated_at.desc()).all()
        return {
            "resumes": [
                {
                    "id": r.id,
                    "filename": r.filename,
                    "skills": r.skills.split(",") if r.skills else [],
                    "uploaded_at": r.created_at.isoformat(),
                }
                for r in items
            ]
        }
    finally:
        db.close()


@app.post("/select-resume/")
def select_resume(user_id: int = Form(...), resume_id: int = Form(...)):
    db = SessionLocal()
    try:
        chosen = db.query(Resume).filter(Resume.user_id == user_id, Resume.id == resume_id).first()
        if not chosen:
            return {"success": False, "error": "Resume not found"}

        # load into session state
        SESSION["resume_id"] = chosen.id
        SESSION["resume_text"] = chosen.text
        SESSION["skills"] = chosen.skills.split(",") if chosen.skills else []
        SESSION["current_question"] = None
        SESSION["history"] = []

        return {
            "success": True,
            "resume_id": chosen.id,
            "resume_text": chosen.text[:500],
            "skills_found": SESSION["skills"],
            "message": "Resume selected successfully",
        }
    finally:
        db.close()


@app.post("/generate-questions/")
def generate_interview_questions(request: QuestionRequest):
    questions = generate_questions(
        skills=request.skills,
        level=request.level
    )
    return {"questions": questions}

@app.post("/evaluate-answer/")
def evaluate_interview_answer(data: AnswerRequest):
    evaluation = evaluate_answer(
        question=data.question,
        answer=data.answer
    )
    return {"evaluation": evaluation}

@app.post("/chat/")
def interview_chat(data: ChatRequest):
    return chat_with_interviewer(
        user_message=data.message,
        level=data.level
    )

@app.get("/interview-summary/")
def interview_summary():
    return generate_interview_summary()

@app.get("/debug-session/")
def debug_session():
    """Debug endpoint to check session state"""
    return {
        "has_skills": bool(SESSION.get("skills")),
        "has_history": bool(SESSION.get("history")),
        "history_length": len(SESSION.get("history", [])),
        "history_items": SESSION.get("history", [])
    }

# Download endpoint removed per request — no download functionality exposed


@app.get("/", response_class=HTMLResponse)
def chatbot_ui():
    html_file = BASE_DIR / "frontend" / "index.html"
    return html_file.read_text(encoding="utf-8")
