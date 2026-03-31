"""Resume Management API endpoints"""

import shutil
from fastapi import APIRouter, UploadFile, File, Form
from backend.resume_parser import extract_text_from_file, clean_text
from backend.skill_extractor import extract_skills
from backend.session import SESSION
from backend.database import SessionLocal, Resume

router = APIRouter(prefix="/resume", tags=["Resume Management"])


@router.post("/upload/")
async def upload_resume(file: UploadFile = File(...), user_id: int = Form(None)):
    """Upload and process a resume file (PDF or DOCX)"""
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


@router.get("/list/")
def user_resumes(user_id: int):
    """Get all resumes for a user"""
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


@router.post("/select/")
def select_resume(user_id: int = Form(...), resume_id: int = Form(...)):
    """Select an existing resume to use for interview"""
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
