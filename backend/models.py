"""
SQLAlchemy Database Models for AI Comic Strip Challenge 2026
SNS College of Technology
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User model for authentication - supports admin and student roles"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # admin or student
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    team = relationship("Team", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email}>"


class Team(Base):
    """Team registration model for the AI Comic Strip Challenge"""
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    event_id = Column(String(50), nullable=False, default="comic_strip")  # comic_strip, prompt_idol, ai_blitz
    
    # Team Details
    team_name = Column(String(100), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    year = Column(String(20), nullable=False)  # 1st, 2nd, 3rd, 4th
    
    # Leader Details
    leader_name = Column(String(100), nullable=False)
    leader_email = Column(String(255), nullable=False)
    leader_phone = Column(String(15), nullable=False)
    
    # Optional Team Members (1-3 members allowed)
    member2_name = Column(String(100), nullable=True)
    member2_email = Column(String(255), nullable=True)
    
    member3_name = Column(String(100), nullable=True)
    member3_email = Column(String(255), nullable=True)
    
    member4_name = Column(String(100), nullable=True)
    member4_email = Column(String(255), nullable=True)
    
    # Verification Status
    verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="team")
    payment = relationship("Payment", back_populates="team", uselist=False)

    def __repr__(self):
        return f"<Team {self.team_name}>"


class Payment(Base):
    """Payment model for UPI transactions"""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), unique=True, nullable=False)
    event_id = Column(String(50), nullable=False, default="comic_strip")
    
    # Paytm Transaction Details
    transaction_id = Column(String(100), unique=True, nullable=True, index=True)
    order_id = Column(String(100), unique=True, nullable=True, index=True)
    
    # Payment Info
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, verified, rejected
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)  # When admin verified the payment
    
    # Relationship
    team = relationship("Team", back_populates="payment")

    def __repr__(self):
        return f"<Payment {self.transaction_id} - {self.status}>"


class Contact(Base):
    """Contact form submissions"""
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Contact {self.email}>"
