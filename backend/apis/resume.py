"""Resume Management API endpoints"""

from fastapi import APIRouter, UploadFile, File, Form
from backend.resume_parser import extract_text_from_bytes, clean_text
from backend.skill_extractor import extract_skills
from backend.session import SESSION
from backend.database import SessionLocal, Resume

router = APIRouter(prefix="/resume", tags=["Resume Management"])


@router.post("/upload/")
async def upload_resume(file: UploadFile = File(...), user_id: int = Form(None), force_reset: bool = Form(False)):
    """Upload and process a resume file (PDF or DOCX)
    
    Args:
        file: Resume file (PDF or DOCX)
        user_id: User ID for persistence
        force_reset: If True, explicitly reset active interview. If False and interview active, return warning.
    """
    file_bytes = await file.read()
    raw_text = extract_text_from_bytes(file_bytes, file.filename)
    clean_resume = clean_text(raw_text)

    with open("data/skills.txt") as f:
        skills_list = [s.strip() for s in f.readlines()]

    skills = extract_skills(clean_resume, skills_list)

    # Check if there's an active interview
    has_active_interview = len(SESSION.get("history", [])) > 0 or SESSION.get("current_question") is not None
    
    if has_active_interview and not force_reset:
        # Return warning — don't reset yet
        return {
            "success": False,
            "error": "Active interview in progress",
            "warning": "You have an active interview session. Uploading a new resume will reset your progress, history, and current question.",
            "requires_confirmation": True,
            "message": "Please confirm if you want to proceed with uploading a new resume.",
            "resume_filename": file.filename
        }

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

    # Save skills to session for interview (reset only if confirmed or no active interview)
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
        "message": "Resume uploaded successfully! Interview reset with new resume.",
        "confirmed": True
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
