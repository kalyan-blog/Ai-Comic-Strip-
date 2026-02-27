"""
Pydantic Schemas for API Request/Response Validation
AI Comic Strip Challenge 2026
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


# ============ ENUMS ============

class UserRole(str, Enum):
    admin = "admin"
    student = "student"


class PaymentStatus(str, Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class YearEnum(str, Enum):
    first = "1st Year"
    second = "2nd Year"
    third = "3rd Year"
    fourth = "4th Year"


# ============ USER SCHEMAS ============

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    admin_scope: Optional[str] = None


# ============ TEAM SCHEMAS ============

class TeamMember(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None


class TeamBase(BaseModel):
    event_id: str = Field(..., description="comic_strip, prompt_idol, or ai_blitz")
    team_name: str = Field(..., min_length=2, max_length=100)
    department: str = Field(..., min_length=2, max_length=100)
    year: YearEnum
    leader_name: str = Field(..., min_length=2, max_length=100)
    leader_email: EmailStr
    leader_phone: str = Field(..., pattern=r"^[6-9]\d{9}$")
    
    @validator('leader_phone')
    def validate_phone(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Phone number must be 10 digits')
        return v


class TeamCreate(TeamBase):
    member2_name: Optional[str] = Field(None, max_length=100)
    member2_email: Optional[EmailStr] = None
    member3_name: Optional[str] = Field(None, max_length=100)
    member3_email: Optional[EmailStr] = None
    member4_name: Optional[str] = Field(None, max_length=100)
    member4_email: Optional[EmailStr] = None

    @validator('member2_email', 'member3_email', 'member4_email', pre=True)
    def empty_string_to_none(cls, v):
        if v == '' or v is None:
            return None
        return v


class TeamUpdate(BaseModel):
    team_name: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    year: Optional[YearEnum] = None
    leader_name: Optional[str] = Field(None, max_length=100)
    leader_phone: Optional[str] = None
    member2_name: Optional[str] = Field(None, max_length=100)
    member2_email: Optional[EmailStr] = None
    member3_name: Optional[str] = Field(None, max_length=100)
    member3_email: Optional[EmailStr] = None
    member4_name: Optional[str] = Field(None, max_length=100)
    member4_email: Optional[EmailStr] = None


class TeamResponse(TeamBase):
    id: int
    user_id: int
    event_id: str
    member2_name: Optional[str] = None
    member2_email: Optional[str] = None
    member3_name: Optional[str] = None
    member3_email: Optional[str] = None
    member4_name: Optional[str] = None
    member4_email: Optional[str] = None
    verified: bool
    registered_at: datetime

    class Config:
        from_attributes = True


class TeamWithPayment(TeamResponse):
    payment: Optional["PaymentResponse"] = None


# ============ PAYMENT SCHEMAS ============

class PaymentBase(BaseModel):
    amount: float
    currency: str = "INR"
    event_id: str


class PaymentCreate(PaymentBase):
    team_id: int


class PaymentSubmit(BaseModel):
    """User submits transaction ID after UPI payment"""
    transaction_id: str = Field(..., min_length=8, max_length=50)
    order_id: Optional[str] = Field(None, min_length=5, max_length=100)


class PaytmPaymentInfo(BaseModel):
    """Paytm payment details shown to user"""
    amount: int  # Total amount in rupees
    fee_per_member: int
    member_count: int
    team_name: str
    event_id: str
    payment_submitted: bool = False
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    order_id: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: int
    team_id: int
    transaction_id: Optional[str] = None
    order_id: Optional[str] = None
    status: PaymentStatus
    created_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ CONTACT SCHEMAS ============

class ContactBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=1000)


class ContactCreate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ ADMIN SCHEMAS ============

class DashboardStats(BaseModel):
    total_teams: int
    verified_teams: int
    total_revenue: float
    pending_payments: int
    departments: dict  # Department-wise breakdown


class TeamAdminView(TeamResponse):
    payment_status: Optional[str] = None
    payment_amount: Optional[float] = None
    payment_id: Optional[str] = None


# Update forward reference
TeamWithPayment.model_rebuild()
