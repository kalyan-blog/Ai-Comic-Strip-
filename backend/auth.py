"""
Authentication Module - JWT & Password Hashing
AI Comic Strip Challenge 2026
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from models import User
from schemas import TokenData

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Allowed admin email whitelist (only these can access admin portal)
SUPER_ADMINS = [
    "kalyanganesh1804@gmail.com",
    "gajavanan27@gmail.com",
]

EVENT_ADMINS = {
    "comic_strip": ["kalyanganesh1804@gmail.com", "gajavanan27@gmail.com"],
    "prompt_idol": ["doruvasanp@gmail.com", "priyadharshinianand042007@gmail.com"],
    "ai_blitz": ["durgaparamashivam2007@gmail.com", "dharunrajavs@gmail.com"],
}

ADMIN_WHITELIST = list(set(SUPER_ADMINS + [email for emails in EVENT_ADMINS.values() for email in emails]))

# Per-admin passwords (used by create_admin.py)
ADMIN_PASSWORDS = {
    "kalyanganesh1804@gmail.com": "kalyan2007@",
    "gajavanan27@gmail.com": "gaja2006@",
    "durgaparamashivam2007@gmail.com": "durga2007@",
    "dharunrajavs@gmail.com": "dharun2006@",
    "doruvasanp@gmail.com": "pandy2006@",
    "priyadharshinianand042007@gmail.com": "priya2006@",
}

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer Security
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return TokenData(email=email, role=role)
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = None
) -> TokenData:
    """Get current user from JWT token"""
    token = credentials.credentials
    return decode_token(token)


def require_role(required_role: str):
    """Role-based access control decorator factory"""
    async def role_checker(
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> TokenData:
        token = credentials.credentials
        token_data = decode_token(token)
        
        if token_data.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}"
            )
        
        return token_data
    
    return role_checker


# Convenience dependencies - Admin requires both role AND email whitelist
async def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """Admin access check - requires admin role AND whitelisted email"""
    token = credentials.credentials
    token_data = decode_token(token)
    
    if token_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required."
        )
    
    if token_data.email not in ADMIN_WHITELIST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Your account is not authorized for admin access."
        )
        
    # Determine admin scope
    if token_data.email in SUPER_ADMINS:
        token_data.admin_scope = "all"
    else:
        for event, emails in EVENT_ADMINS.items():
            if token_data.email in emails:
                token_data.admin_scope = event
                break
    
    return token_data

require_student = require_role("student")


async def get_current_user_flexible(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """Get current user without role restriction"""
    token = credentials.credentials
    return decode_token(token)
