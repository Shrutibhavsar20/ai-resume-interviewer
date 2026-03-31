from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# API routers
from backend.apis import auth_router, resume_router, interview_router

# Database
from backend.database import init_db

load_dotenv()

# Initialize database
init_db()

app = FastAPI(title="InterviewIQ API", version="1.0.0")

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

# ─── INCLUDE API ROUTERS ────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(interview_router)

# ─── ROOT ENDPOINT ──────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
def chatbot_ui():
    """Serve frontend HTML"""
    html_file = BASE_DIR / "frontend" / "index.html"
    return html_file.read_text(encoding="utf-8")
