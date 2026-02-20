import hashlib
from sqlalchemy.orm import Session
from backend.database import User, SessionLocal

def hash_password(password: str) -> str:
    """Hash password for storage"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_by_email(email: str, db: Session = None) -> User:
    """Get user by email"""
    if db is None:
        db = SessionLocal()
    return db.query(User).filter(User.email == email).first()

def register_user(email: str, password: str, name: str, db: Session = None) -> dict:
    """Register a new user"""
    if db is None:
        db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = get_user_by_email(email, db)
        if existing_user:
            return {"success": False, "error": "Email already registered"}
        
        # Validate password
        if len(password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters"}
        
        # Validate email
        if not email or "@" not in email:
            return {"success": False, "error": "Invalid email address"}
        
        # Create new user
        new_user = User(
            email=email,
            name=name or email.split("@")[0],
            password=hash_password(password),
            oauth=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"success": True, "message": "User registered successfully"}
    
    except Exception as e:
        db.rollback()
        return {"success": False, "error": f"Registration error: {str(e)}"}
    
    finally:
        db.close()

def login_user(email: str, password: str, db: Session = None) -> dict:
    """Authenticate user"""
    if db is None:
        db = SessionLocal()
    
    try:
        user = get_user_by_email(email, db)
        
        if not user:
            return {"success": False, "error": "Invalid email or password"}
        
        if user.password != hash_password(password):
            return {"success": False, "error": "Invalid email or password"}
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": email
            }
        }
    
    except Exception as e:
        return {"success": False, "error": f"Login error: {str(e)}"}
    
    finally:
        db.close()

def reset_password(email: str, new_password: str, db: Session = None) -> dict:
    """Reset user password"""
    if db is None:
        db = SessionLocal()
    
    try:
        user = get_user_by_email(email, db)
        
        if not user:
            return {"success": False, "error": "Email not found"}
        
        if len(new_password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters"}
        
        user.password = hash_password(new_password)
        db.commit()
        
        return {"success": True, "message": "Password reset successfully"}
    
    except Exception as e:
        db.rollback()
        return {"success": False, "error": f"Reset error: {str(e)}"}
    
    finally:
        db.close()

def oauth_login(email: str, name: str, db: Session = None) -> dict:
    """Handle OAuth login (Google/LinkedIn) — auto-register or login"""
    if db is None:
        db = SessionLocal()
    
    try:
        # Validate email
        if not email or "@" not in email:
            return {"success": False, "error": "Invalid email from OAuth provider"}
        
        # Check if user exists
        user = get_user_by_email(email, db)
        
        if not user:
            # Auto-register new user
            user = User(
                email=email,
                name=name or email.split("@")[0],
                password="",  # OAuth users have no password
                oauth=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": email
            }
        }
    
    except Exception as e:
        db.rollback()
        return {"success": False, "error": f"OAuth error: {str(e)}"}
    
    finally:
        db.close()
