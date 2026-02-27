"""
Team Routes - Registration & Management
AI Comic Strip Challenge 2026
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import os
from dotenv import load_dotenv

from database import get_db
from models import Team, User, Payment
from schemas import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamWithPayment,
    UserCreate,
    UserResponse,
    UserLogin,
    Token
)
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_flexible,
    TokenData
)

load_dotenv()

router = APIRouter(prefix="/teams", tags=["Teams"])

# Registration deadline
REGISTRATION_DEADLINE = os.getenv("REGISTRATION_DEADLINE", "2026-03-15T23:59:59")


def is_registration_open() -> bool:
    """Check if registration is still open"""
    try:
        deadline = datetime.fromisoformat(REGISTRATION_DEADLINE)
        return datetime.utcnow() < deadline
    except:
        return True


@router.post("/register", response_model=Token)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user account"""
    
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role="student"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role}
    )
    
    return Token(access_token=access_token, token_type="bearer", role=new_user.role)


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    
    return Token(access_token=access_token, token_type="bearer", role=user.role)


@router.post("/create", response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Create/Register a new team"""
    
    if not is_registration_open():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed"
        )
    
    # Get user
    user = db.query(User).filter(User.email == current_user.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user already has a team
    existing_team = db.query(Team).filter(Team.user_id == user.id).first()
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already registered a team"
        )
    
    # Check team name uniqueness
    name_exists = db.query(Team).filter(Team.team_name == team_data.team_name).first()
    if name_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already taken"
        )
    
    # Validate team size per event
    EVENT_TEAM_RULES = {
        "comic_strip": {"min": 1, "max": 3},
        "prompt_idol": {"min": 1, "max": 2},
        "ai_blitz": {"min": 4, "max": 4},
    }
    rules = EVENT_TEAM_RULES.get(team_data.event_id)
    if rules:
        member_count = 1  # leader always counts
        if team_data.member2_name and team_data.member2_email:
            member_count += 1
        if team_data.member3_name and team_data.member3_email:
            member_count += 1
        if team_data.member4_name and team_data.member4_email:
            member_count += 1
        if member_count < rules["min"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This event requires at least {rules['min']} team members. You have {member_count}."
            )
        if member_count > rules["max"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This event allows at most {rules['max']} team members. You have {member_count}."
            )
    
    # Create team
    new_team = Team(
        user_id=user.id,
        event_id=team_data.event_id,
        team_name=team_data.team_name,
        department=team_data.department,
        year=team_data.year.value,
        leader_name=team_data.leader_name,
        leader_email=team_data.leader_email,
        leader_phone=team_data.leader_phone,
        member2_name=team_data.member2_name,
        member2_email=team_data.member2_email,
        member3_name=team_data.member3_name,
        member3_email=team_data.member3_email,
        member4_name=team_data.member4_name,
        member4_email=team_data.member4_email,
        verified=False
    )
    
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    
    return new_team


@router.get("/me", response_model=TeamWithPayment)
async def get_my_team(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Get current user's team details with payment info"""
    
    user = db.query(User).filter(User.email == current_user.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found. Please register your team first."
        )
    
    # Get payment info
    payment = db.query(Payment).filter(Payment.team_id == team.id).first()
    
    team_dict = {
        "id": team.id,
        "user_id": team.user_id,
        "event_id": team.event_id,
        "team_name": team.team_name,
        "department": team.department,
        "year": team.year,
        "leader_name": team.leader_name,
        "leader_email": team.leader_email,
        "leader_phone": team.leader_phone,
        "member2_name": team.member2_name,
        "member2_email": team.member2_email,
        "member3_name": team.member3_name,
        "member3_email": team.member3_email,
        "member4_name": team.member4_name,
        "member4_email": team.member4_email,
        "verified": team.verified,
        "registered_at": team.registered_at,
        "payment": payment
    }
    
    return team_dict


@router.put("/update", response_model=TeamResponse)
async def update_team(
    team_data: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Update team details (locked after deadline)"""
    
    if not is_registration_open():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile editing is locked after registration deadline"
        )
    
    user = db.query(User).filter(User.email == current_user.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if team is already verified (paid)
    if team.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit team after payment verification"
        )
    
    # Update fields
    update_data = team_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if field == "year":
                setattr(team, field, value.value)
            else:
                setattr(team, field, value)
    
    db.commit()
    db.refresh(team)
    
    return team


@router.get("/registration-status")
async def get_registration_status():
    """Get registration status and deadline"""
    return {
        "is_open": is_registration_open(),
        "deadline": REGISTRATION_DEADLINE,
        "fee": 250.00
    }
