"""
Admin Routes - Dashboard, Statistics & Team Management
AI Comic Strip Challenge 2026

All routes require admin role (RBAC implemented)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import io
import zipfile
from datetime import datetime

from database import get_db
from models import Team, User, Payment, Contact
from schemas import (
    DashboardStats,
    TeamAdminView,
    ContactResponse
)
from auth import require_admin, TokenData
from utils.email_service import send_payment_approved_email, send_payment_rejected_email

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin)
):
    """Get dashboard statistics for admin"""
    
    # Base queries
    team_query = db.query(Team)
    payment_query = db.query(Payment)
    
    # Filter by event if not super admin
    if admin_user.admin_scope != "all":
        team_query = team_query.filter(Team.event_id == admin_user.admin_scope)
        payment_query = payment_query.filter(Payment.event_id == admin_user.admin_scope)
    
    # Total teams
    total_teams = team_query.count()
    
    # Verified teams
    verified_teams = team_query.filter(Team.verified == True).count()
    
    # Total revenue (from verified payments)
    total_revenue_result = payment_query.filter(
        Payment.status == "verified"
    ).with_entities(func.sum(Payment.amount)).scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0
    
    # Pending payments
    pending_payments = payment_query.filter(Payment.status == "pending").count()
    
    # Department-wise breakdown
    dept_stats = team_query.with_entities(
        Team.department,
        func.count(Team.id).label("count")
    ).group_by(Team.department).all()
    
    departments = {dept: count for dept, count in dept_stats}
    
    return DashboardStats(
        total_teams=total_teams,
        verified_teams=verified_teams,
        total_revenue=total_revenue,
        pending_payments=pending_payments,
        departments=departments
    )


@router.get("/teams")
async def get_all_teams(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin),
    search: str = None,
    department: str = None,
    verified: bool = None,
    event_id: str = None,
    page: int = 1,
    limit: int = 20
):
    """Get all teams with search and filter options"""
    
    query = db.query(Team)
    
    # Filter by admin scope
    if admin_user.admin_scope != "all":
        query = query.filter(Team.event_id == admin_user.admin_scope)
    elif event_id:
        query = query.filter(Team.event_id == event_id)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Team.team_name.ilike(search_term)) |
            (Team.leader_name.ilike(search_term)) |
            (Team.leader_email.ilike(search_term))
        )
    
    if department:
        query = query.filter(Team.department == department)
    
    if verified is not None:
        query = query.filter(Team.verified == verified)
    
    # Get total count
    total = query.count()
    
    # Pagination
    offset = (page - 1) * limit
    teams = query.offset(offset).limit(limit).all()
    
    # Build response with payment info
    result = []
    for team in teams:
        payment = db.query(Payment).filter(Payment.team_id == team.id).first()
        team_data = {
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
            "registered_at": team.registered_at.isoformat(),
            "payment_status": payment.status if payment else None,
            "payment_amount": float(payment.amount) if payment else None,
            "transaction_id": payment.transaction_id if payment else None,
            "order_id": payment.order_id if payment else None
        }
        result.append(team_data)
    
    return {
        "teams": result,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }


@router.put("/teams/{team_id}/verify")
async def toggle_team_verification(
    team_id: int,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin)
):
    """Toggle team verification status (admin override)"""
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    team.verified = not team.verified
    db.commit()
    
    return {
        "id": team.id,
        "team_name": team.team_name,
        "verified": team.verified,
        "message": f"Team {'verified' if team.verified else 'unverified'} successfully"
    }


@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin)
):
    """Delete a registered team and its associated payment & user account"""
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    team_name = team.team_name
    user_id = team.user_id
    
    # Delete associated payment first
    payment = db.query(Payment).filter(Payment.team_id == team.id).first()
    if payment:
        db.delete(payment)
    
    # Delete the team
    db.delete(team)
    
    # Delete the user account
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
    
    db.commit()
    
    return {
        "message": f"Team '{team_name}' and associated records deleted successfully"
    }


@router.put("/payments/{team_id}/verify")
async def verify_payment(
    team_id: int,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin)
):
    """Verify/approve a team's UPI payment (admin action)"""
    
    # Find the payment
    payment = db.query(Payment).filter(Payment.team_id == team_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment found for this team"
        )
    
    if payment.status == "verified":
        # Toggle to pending if already verified
        payment.status = "pending"
        payment.verified_at = None
        message = "Payment marked as pending"
    else:
        # Verify the payment
        payment.status = "verified"
        payment.verified_at = datetime.utcnow()
        
        # Also verify the team
        team = db.query(Team).filter(Team.id == team_id).first()
        if team:
            team.verified = True
        
        message = "Payment verified successfully"
        
        # Send approval email to ALL team members
        if team:
            try:
                send_payment_approved_email(team=team, payment=payment)
            except Exception as e:
                print(f"Failed to send approval email: {e}")
    
    db.commit()
    
    return {
        "team_id": team_id,
        "payment_status": payment.status,
        "transaction_id": payment.transaction_id,
        "verified_at": payment.verified_at.isoformat() if payment.verified_at else None,
        "message": message
    }


@router.put("/payments/{team_id}/reject")
async def reject_payment(
    team_id: int,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin)
):
    """Reject a team's payment (admin action)"""
    
    payment = db.query(Payment).filter(Payment.team_id == team_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment found for this team"
        )
    
    payment.status = "rejected"
    payment.verified_at = None
    
    # Send rejection email to ALL team members
    team = db.query(Team).filter(Team.id == team_id).first()
    if team:
        try:
            send_payment_rejected_email(team=team, payment=payment)
        except Exception as e:
            print(f"Failed to send rejection email: {e}")
    
    db.commit()
    
    return {
        "team_id": team_id,
        "payment_status": "rejected",
        "message": "Payment rejected"
    }


@router.get("/departments")
async def get_departments(
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin)
):
    """Get list of all departments with team counts"""
    
    dept_stats = db.query(
        Team.department,
        func.count(Team.id).label("count")
    ).group_by(Team.department).all()
    
    return [{"department": dept, "count": count} for dept, count in dept_stats]


@router.get("/export/csv")
async def export_teams_csv(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin),
    event_id: str = None
):
    """Export teams data as CSV - filtered by event or admin scope"""
    
    query = db.query(Team)
    if admin_user.admin_scope != "all":
        query = query.filter(Team.event_id == admin_user.admin_scope)
    elif event_id:
        query = query.filter(Team.event_id == event_id)
    
    teams = query.all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row - exact columns as requested
    writer.writerow([
        "S.No",
        "Team Name",
        "Member 1 Name",
        "Member 1 Email",
        "Phone No",
        "Member 2 Name",
        "Member 2 Email",
        "Member 3 Name",
        "Member 3 Email",
        "Member 4 Name",
        "Member 4 Email",
        "Transaction ID",
        "Amount Paid"
    ])
    
    # Data rows
    for idx, team in enumerate(teams, start=1):
        payment = db.query(Payment).filter(Payment.team_id == team.id).first()
        
        # Format transaction_id as Excel-safe text to prevent
        # scientific notation or truncation of long numeric strings
        txn_id = (payment.transaction_id or "") if payment else ""
        if txn_id:
            txn_id = f'="{txn_id}"'
        
        writer.writerow([
            idx,
            team.team_name,
            team.leader_name,
            team.leader_email,
            team.leader_phone,
            team.member2_name or "",
            team.member2_email or "",
            team.member3_name or "",
            team.member3_email or "",
            team.member4_name or "",
            team.member4_email or "",
            txn_id,
            float(payment.amount) if payment else 0
        ])
    
    output.seek(0)
    
    event_tag = event_id or admin_user.admin_scope if admin_user.admin_scope != "all" else "all_events"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={event_tag}_teams_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


def _build_csv_for_teams(teams, db):
    """Helper: build CSV content string from a list of teams"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "S.No", "Team Name",
        "Member 1 Name", "Member 1 Email", "Phone No",
        "Member 2 Name", "Member 2 Email",
        "Member 3 Name", "Member 3 Email",
        "Member 4 Name", "Member 4 Email",
        "Transaction ID", "Amount Paid"
    ])
    for idx, team in enumerate(teams, start=1):
        payment = db.query(Payment).filter(Payment.team_id == team.id).first()
        txn_id = (payment.transaction_id or "") if payment else ""
        if txn_id:
            txn_id = f'="{txn_id}"'
        writer.writerow([
            idx, team.team_name,
            team.leader_name, team.leader_email, team.leader_phone,
            team.member2_name or "", team.member2_email or "",
            team.member3_name or "", team.member3_email or "",
            team.member4_name or "", team.member4_email or "",
            txn_id, float(payment.amount) if payment else 0
        ])
    output.seek(0)
    return output.getvalue()


EVENT_LABELS = {
    "comic_strip": "AI_Comic_Strip",
    "prompt_idol": "Prompt_Engineering_Idol",
    "ai_blitz": "AI_Blitz",
}


@router.get("/export/csv/all")
async def export_all_events_csv(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin)
):
    """Export separate CSV files for each event as a ZIP download"""
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for event_id, label in EVENT_LABELS.items():
            # If scoped admin, only export their event
            if admin_user.admin_scope != "all" and admin_user.admin_scope != event_id:
                continue
            teams = db.query(Team).filter(Team.event_id == event_id).all()
            csv_content = _build_csv_for_teams(teams, db)
            filename = f"{label}_teams_{datetime.now().strftime('%Y%m%d')}.csv"
            zf.writestr(filename, csv_content)
    
    zip_buffer.seek(0)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=TEXPERIA_all_events_{timestamp}.zip"
        }
    )


@router.get("/contacts", response_model=list[ContactResponse])
async def get_contacts(
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin),
    unread_only: bool = False
):
    """Get all contact form submissions"""
    
    query = db.query(Contact)
    
    if unread_only:
        query = query.filter(Contact.is_read == False)
    
    return query.order_by(Contact.created_at.desc()).all()


@router.put("/contacts/{contact_id}/read")
async def mark_contact_read(
    contact_id: int,
    db: Session = Depends(get_db),
    _: TokenData = Depends(require_admin)
):
    """Mark contact message as read"""
    
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    contact.is_read = True
    db.commit()
    
    return {"message": "Marked as read"}


@router.get("/revenue-chart")
async def get_revenue_chart_data(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin),
    event_id: str = None
):
    """Get revenue data for charts (daily breakdown)"""
    
    query = db.query(
        func.date(Payment.verified_at).label("date"),
        func.sum(Payment.amount).label("amount"),
        func.count(Payment.id).label("count")
    ).filter(
        Payment.status == "verified",
        Payment.verified_at.isnot(None)
    )
    
    if admin_user.admin_scope != "all":
        query = query.filter(Payment.event_id == admin_user.admin_scope)
    elif event_id:
        query = query.filter(Payment.event_id == event_id)
    
    payments = query.group_by(
        func.date(Payment.verified_at)
    ).order_by(
        func.date(Payment.verified_at)
    ).all()
    
    return [
        {
            "date": str(p.date),
            "amount": float(p.amount),
            "count": p.count
        }
        for p in payments
    ]


@router.get("/year-wise-stats")
async def get_year_wise_stats(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin),
    event_id: str = None
):
    """Get year-wise team distribution"""
    
    query = db.query(
        Team.year,
        func.count(Team.id).label("count")
    )
    
    if admin_user.admin_scope != "all":
        query = query.filter(Team.event_id == admin_user.admin_scope)
    elif event_id:
        query = query.filter(Team.event_id == event_id)
    
    stats = query.group_by(Team.year).all()
    
    return [{"year": year, "count": count} for year, count in stats]


@router.get("/event-stats")
async def get_event_wise_stats(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(require_admin)
):
    """Get event-wise stats (super admin only)"""
    events = ["comic_strip", "prompt_idol", "ai_blitz"]
    event_labels = {"comic_strip": "AI Comic Strip Challenge", "prompt_idol": "Prompt Engineering Idol", "ai_blitz": "AI Blitz"}
    
    result = []
    for eid in events:
        if admin_user.admin_scope != "all" and admin_user.admin_scope != eid:
            continue
        total = db.query(Team).filter(Team.event_id == eid).count()
        verified = db.query(Team).filter(Team.event_id == eid, Team.verified == True).count()
        rev = db.query(func.sum(Payment.amount)).filter(Payment.event_id == eid, Payment.status == "verified").scalar()
        pending = db.query(Payment).filter(Payment.event_id == eid, Payment.status == "pending").count()
        result.append({
            "event_id": eid,
            "event_name": event_labels.get(eid, eid),
            "total_teams": total,
            "verified_teams": verified,
            "total_revenue": float(rev) if rev else 0.0,
            "pending_payments": pending
        })
    return result
