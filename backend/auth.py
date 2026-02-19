import json
import os
from pathlib import Path
from datetime import datetime
import hashlib

# Path to store user data (in production, use a real database)
USERS_FILE = Path(__file__).parent.parent / "data" / "users.json"

def hash_password(password: str) -> str:
    """Hash password for storage"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_users() -> dict:
    """Load user database"""
    if USERS_FILE.exists():
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users: dict):
    """Save user database"""
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def register_user(email: str, password: str, name: str) -> dict:
    """Register a new user"""
    users = load_users()
    
    if email in users:
        return {"success": False, "error": "Email already registered"}
    
    if len(password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters"}
    
    if not email or "@" not in email:
        return {"success": False, "error": "Invalid email address"}
    
    users[email] = {
        "name": name or email.split("@")[0],
        "password": hash_password(password),
        "created_at": datetime.now().isoformat()
    }
    
    save_users(users)
    return {"success": True, "message": "User registered successfully"}

def login_user(email: str, password: str) -> dict:
    """Authenticate user"""
    users = load_users()
    
    if email not in users:
        return {"success": False, "error": "Invalid email or password"}
    
    user = users[email]
    if user["password"] != hash_password(password):
        return {"success": False, "error": "Invalid email or password"}
    
    return {
        "success": True,
        "user": {
            "name": user["name"],
            "email": email
        }
    }

def reset_password(email: str, new_password: str) -> dict:
    """Reset user password"""
    users = load_users()
    
    if email not in users:
        return {"success": False, "error": "Email not found"}
    
    if len(new_password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters"}
    
    users[email]["password"] = hash_password(new_password)
    save_users(users)
    return {"success": True, "message": "Password reset successfully"}
