from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from backend.models import ChatRequest, QuestionRequest
import shutil

from backend.resume_parser import extract_text_from_pdf, clean_text
from backend.skill_extractor import extract_skills
from backend.question_generator import generate_questions
from backend.answer_evaluator import evaluate_answer
from backend.models import AnswerRequest

from backend.chatbot import chat_with_interviewer
from pydantic import BaseModel

from backend.interview_summary import generate_interview_summary

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent.parent

# Serve frontend static files
app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "frontend"),
    name="static"
)

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

    return {
        "resume_text": clean_resume[:500],
        "skills_found": skills
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
    return chat_with_interviewer(data.message)

@app.get("/interview-summary/")
def interview_summary():
    return generate_interview_summary()

@app.get("/", response_class=HTMLResponse)
def chatbot_ui():
    html_file = BASE_DIR / "frontend" / "index.html"
    return html_file.read_text(encoding="utf-8")
