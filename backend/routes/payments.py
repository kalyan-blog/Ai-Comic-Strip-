"""
Payment Routes - Paytm Integration
TEXPERIA 2026
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
import os
import json
from dotenv import load_dotenv
import paytmchecksum

from database import get_db
from models import Payment, Team, User
from schemas import (
    PaymentResponse,
    PaymentSubmit,
    PaytmPaymentInfo
)
from auth import get_current_user_flexible, TokenData
from utils.email_service import send_registration_confirmation

load_dotenv()

router = APIRouter(prefix="/payments", tags=["Payments"])

# Paytm Configuration
PAYTM_MERCHANT_ID = os.getenv("PAYTM_MERCHANT_ID", "YOUR_MERCHANT_ID")
PAYTM_MERCHANT_KEY = os.getenv("PAYTM_MERCHANT_KEY", "YOUR_MERCHANT_KEY")
PAYTM_WEBSITE = os.getenv("PAYTM_WEBSITE", "WEBSTAGING")
PAYTM_INDUSTRY_TYPE_ID = os.getenv("PAYTM_INDUSTRY_TYPE_ID", "Retail")
PAYTM_CALLBACK_URL = os.getenv("PAYTM_CALLBACK_URL", "http://localhost:8000/api/payments/callback")

# Registration fees (per head for all events)
FEES = {
    "comic_strip": 250, # per head
    "prompt_idol": 200, # per head
    "ai_blitz": 300     # per head
}

def calculate_team_fee(team: Team) -> int:
    """Calculate total fee based on event and number of team members (per head)"""
    fee_per_head = FEES.get(team.event_id, 250)
    member_count = 1  # leader always counts
    if team.member2_name and team.member2_email:
        member_count += 1
    if team.member3_name and team.member3_email:
        member_count += 1
    if team.member4_name and team.member4_email:
        member_count += 1
    return fee_per_head * member_count

@router.get("/info", response_model=PaytmPaymentInfo)
async def get_payment_info(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Get payment information for the team"""
    user = db.query(User).filter(User.email == current_user.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(status_code=400, detail="Please register your team first")
    
    amount = calculate_team_fee(team)
    fee_per_member = FEES.get(team.event_id, 250)
    member_count = amount // fee_per_member
    
    existing_payment = db.query(Payment).filter(Payment.team_id == team.id).first()
    
    return PaytmPaymentInfo(
        amount=amount,
        fee_per_member=fee_per_member,
        member_count=member_count,
        team_name=team.team_name,
        event_id=team.event_id,
        payment_submitted=existing_payment is not None,
        payment_status=existing_payment.status if existing_payment else None,
        transaction_id=existing_payment.transaction_id if existing_payment else None,
        order_id=existing_payment.order_id if existing_payment else None
    )

@router.post("/initiate")
async def initiate_payment(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Initiate Paytm payment and generate checksum"""
    user = db.query(User).filter(User.email == current_user.email).first()
    team = db.query(Team).filter(Team.user_id == user.id).first()
    
    if not team:
        raise HTTPException(status_code=400, detail="Team not found")
        
    amount = calculate_team_fee(team)
    order_id = f"ORDER_{team.id}_{int(datetime.utcnow().timestamp())}"
    
    paytm_params = {
        "MID": PAYTM_MERCHANT_ID,
        "WEBSITE": PAYTM_WEBSITE,
        "INDUSTRY_TYPE_ID": PAYTM_INDUSTRY_TYPE_ID,
        "CHANNEL_ID": "WEB",
        "ORDER_ID": order_id,
        "CUST_ID": str(user.id),
        "TXN_AMOUNT": str(amount),
        "CALLBACK_URL": PAYTM_CALLBACK_URL,
        "EMAIL": user.email,
        "MOBILE_NO": team.leader_phone
    }
    
    checksum = paytmchecksum.generateSignature(paytm_params, PAYTM_MERCHANT_KEY)
    paytm_params["CHECKSUMHASH"] = checksum
    
    # Save pending payment
    existing_payment = db.query(Payment).filter(Payment.team_id == team.id).first()
    if existing_payment:
        existing_payment.order_id = order_id
        existing_payment.amount = amount
        existing_payment.status = "pending"
    else:
        new_payment = Payment(
            team_id=team.id,
            event_id=team.event_id,
            order_id=order_id,
            amount=amount,
            status="pending"
        )
        db.add(new_payment)
    
    db.commit()
    
    return {
        "paytm_params": paytm_params,
        "order_id": order_id
    }

@router.post("/submit", response_model=PaymentResponse)
async def submit_payment(
    payment_data: PaymentSubmit,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Submit payment details after Paytm or UPI payment"""
    user = db.query(User).filter(User.email == current_user.email).first()
    team = db.query(Team).filter(Team.user_id == user.id).first()
    
    if not team:
        raise HTTPException(status_code=400, detail="Team not found")
        
    payment = db.query(Payment).filter(Payment.team_id == team.id).first()
    
    # Auto-generate order_id if not provided
    order_id = payment_data.order_id or f"UPI_{team.event_id}_{int(datetime.utcnow().timestamp())}"
    
    if not payment:
        amount = calculate_team_fee(team)
        payment = Payment(
            team_id=team.id,
            event_id=team.event_id,
            order_id=order_id,
            transaction_id=payment_data.transaction_id,
            amount=amount,
            status="pending"
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
    else:
        payment.transaction_id = payment_data.transaction_id
        payment.order_id = order_id
        # All payments need admin verification
        payment.status = "pending"
        
        db.commit()
        db.refresh(payment)
    
    return PaymentResponse(
        id=payment.id,
        team_id=payment.team_id,
        amount=payment.amount,
        currency="INR",
        event_id=payment.event_id,
        status=payment.status,
        transaction_id=payment.transaction_id,
        order_id=payment.order_id,
        created_at=payment.created_at,
        verified_at=payment.verified_at
    )

@router.get("/status", response_model=PaymentResponse)
async def get_payment_status(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user_flexible)
):
    """Get current payment status"""
    user = db.query(User).filter(User.email == current_user.email).first()
    team = db.query(Team).filter(Team.user_id == user.id).first()
    
    if not team:
        raise HTTPException(status_code=400, detail="No team registered")
        
    payment = db.query(Payment).filter(Payment.team_id == team.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="No payment found")
        
    return PaymentResponse(
        id=payment.id,
        team_id=payment.team_id,
        amount=payment.amount,
        currency="INR",
        event_id=payment.event_id,
        status=payment.status,
        transaction_id=payment.transaction_id,
        order_id=payment.order_id,
        created_at=payment.created_at,
        verified_at=payment.verified_at
    )
