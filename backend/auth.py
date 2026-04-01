import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import User, PasswordReset, SessionLocal

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

def forgot_password(email: str, db: Session = None) -> dict:
    """Send password reset email"""
    if db is None:
        db = SessionLocal()
    
    try:
        user = get_user_by_email(email, db)
        
        # Always generate a token and send email, even if user doesn't exist
        # This prevents email enumeration attacks
        
        # Generate reset token
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Save reset token only if user exists
        if user:
            reset_entry = PasswordReset(
                email=email,
                token=token,
                expires_at=expires_at
            )
            db.add(reset_entry)
            db.commit()
            
            # Send email
            send_reset_email(email, token)
        else:
            # For non-existent users, just log and return success
            print(f"Password reset requested for non-existent email: {email}")
        
        return {"success": True, "message": "If an account with this email exists, a password reset link has been sent."}
    
    except Exception as e:
        db.rollback()
        print(f"Forgot password error: {str(e)}")
        # Still return success to prevent information leakage
        return {"success": True, "message": "If an account with this email exists, a password reset link has been sent."}
    
    finally:
        db.close()

def send_reset_email(email: str, token: str):
    """Send password reset email"""
    import os
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    
    if not smtp_user or not smtp_password:
        print(f"SMTP not configured. Reset link for {email}: {reset_link}")
        return
    
    # ... rest of the email sending code
    
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = email
    msg['Subject'] = "Password Reset Request"
    
    body = f"""
    Hi,
    
    You requested a password reset for your account.
    
    Click the link below to reset your password:
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
    
    Best,
    Interview AI Team
    """
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_user, email, text)
        server.quit()
        print(f"Password reset email sent successfully to {email}")
    except Exception as e:
        print(f"Failed to send email to {email}: {str(e)}")
        # Fallback: print the link for development
        print(f"Reset link: {reset_link}")

def reset_password_with_token(token: str, new_password: str, db: Session = None) -> dict:
    """Reset password using token"""
    if db is None:
        db = SessionLocal()
    
    try:
        reset_entry = db.query(PasswordReset).filter(
            PasswordReset.token == token,
            PasswordReset.used == False,
            PasswordReset.expires_at > datetime.utcnow()
        ).first()
        
        if not reset_entry:
            return {"success": False, "error": "Invalid or expired token"}
        
        user = get_user_by_email(reset_entry.email, db)
        if not user:
            return {"success": False, "error": "User not found"}
        
        if len(new_password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters"}
        
        user.password = hash_password(new_password)
        reset_entry.used = True
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
