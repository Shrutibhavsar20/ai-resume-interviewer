"""Authentication API endpoints"""

from fastapi import APIRouter
from backend.models import LoginRequest, SignupRequest, ForgotPasswordRequest, ResetPasswordRequest
from backend.auth import login_user, register_user, forgot_password, reset_password_with_token, oauth_login

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup/")
async def signup(request: SignupRequest):
    """Register a new user account"""
    result = register_user(request.email, request.password, request.name)
    if result.get("success"):
        return {"success": True, "message": "Account created successfully"}
    return {"success": False, "error": result.get("error", "Registration failed")}


@router.post("/login/")
async def login(request: LoginRequest):
    """Login user with email and password"""
    result = login_user(request.email, request.password)
    if result.get("success"):
        return {"success": True, "user": result.get("user")}
    return {"success": False, "error": result.get("error", "Login failed")}


@router.post("/reset-password/")
async def reset_pwd(request: ResetPasswordRequest):
    """Reset user password using token"""
    result = reset_password_with_token(request.token, request.new_password)
    if result.get("success"):
        return {"success": True, "message": "Password reset successfully"}
    return {"success": False, "error": result.get("error", "Password reset failed")}


@router.post("/forgot-password/")
async def forgot_pwd(request: ForgotPasswordRequest):
    """Send password reset email"""
    result = forgot_password(request.email)
    if result.get("success"):
        return {"success": True, "message": "Password reset email sent"}
    return {"success": False, "error": result.get("error", "Failed to send reset email")}


@router.post("/oauth-callback/")
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
