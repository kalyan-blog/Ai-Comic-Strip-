"""
Contact Routes - Contact Form Submissions
AI Comic Strip Challenge 2026
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db
from models import Contact
from schemas import ContactCreate, ContactResponse
from utils.email_service import send_contact_notification

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", response_model=ContactResponse)
async def submit_contact(
    contact_data: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit a contact form message"""
    
    new_contact = Contact(
        name=contact_data.name,
        email=contact_data.email,
        message=contact_data.message
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    # Send notification email in background
    background_tasks.add_task(
        send_contact_notification,
        name=contact_data.name,
        email=contact_data.email,
        message=contact_data.message
    )
    
    return new_contact
