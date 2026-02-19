from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, Response
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from backend.models import ChatRequest, QuestionRequest, LoginRequest, SignupRequest, ResetPasswordRequest, PDFDownloadRequest
import shutil

from backend.resume_parser import extract_text_from_pdf, clean_text
from backend.skill_extractor import extract_skills
from backend.question_generator import generate_questions
from backend.answer_evaluator import evaluate_answer
from backend.models import AnswerRequest

from backend.chatbot import chat_with_interviewer
from pydantic import BaseModel

from backend.interview_summary import generate_interview_summary
from backend.auth import login_user, register_user, reset_password
from backend.session import SESSION
from backend.pdf_generator import generate_interview_pdf

from fastapi.middleware.cors import CORSMiddleware


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

# ─── INTERVIEW ENDPOINTS ────────────────────────────────────────────────────
@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text_from_pdf(file_path)
    clean_resume = clean_text(raw_text)

    with open("data/skills.txt") as f:
        skills_list = [s.strip() for s in f.readlines()]

    skills = extract_skills(clean_resume, skills_list)
    
    # Save skills to session for interview
    SESSION["skills"] = skills
    SESSION["resume_text"] = clean_resume
    SESSION["current_question"] = None
    SESSION["history"] = []

    return {
        "resume_text": clean_resume[:500],
        "skills_found": skills,
        "message": "Resume uploaded successfully!"
    }
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

@app.post("/download-pdf/")
def download_interview_pdf(data: PDFDownloadRequest):
    """Generate and download interview summary as PDF"""
    try:
        user_name = data.user_name
        level = data.level
        qa_pairs = data.questions_answers or []
        avg_score = data.avg_score or 0
        
        # Generate PDF
        pdf_bytes = generate_interview_pdf(
            user_name=user_name,
            level=level,
            questions_answers=qa_pairs,
            avg_score=avg_score,
            total_questions=len(qa_pairs),
            total_answered=len(qa_pairs)
        )
        
        # Return PDF with proper headers
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=interview-summary.pdf"}
        )
    except Exception as e:
        print(f"PDF generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"PDF generation failed: {str(e)}"}


@app.get("/", response_class=HTMLResponse)
def chatbot_ui():
    html_file = BASE_DIR / "frontend" / "index.html"
    return html_file.read_text(encoding="utf-8")
