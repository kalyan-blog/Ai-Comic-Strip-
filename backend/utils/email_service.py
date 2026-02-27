"""
Email Service - SMTP Integration (SendGrid/Gmail)
AI Comic Strip Challenge 2026
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_NAME = "TEXPERIA 2026"


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: Optional[str] = None
) -> bool:
    """Send email using SMTP"""
    try:
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print("SMTP credentials not configured")
            return False

        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SENDER_NAME} <{SMTP_EMAIL}>"
        message["To"] = to_email

        # Add plain text and HTML parts
        if plain_text:
            part1 = MIMEText(plain_text, "plain")
            message.attach(part1)
        
        part2 = MIMEText(html_content, "html")
        message.attach(part2)

        # Connect and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, message.as_string())

        print(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False


def send_registration_confirmation(
    to_email: str,
    team_name: str,
    leader_name: str,
    payment_id: str,
    amount: float
) -> bool:
    """Send registration confirmation email"""
    
    subject = f"🎉 Registration Confirmed - AI Comic Strip Challenge 2026"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Comic Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #00D9FF, #FF00FF);
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 5px 5px 0px #000000;
                border: 3px solid #000000;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                font-family: 'Bangers', cursive;
                font-size: 32px;
                color: #FF00FF;
                margin: 0;
                text-shadow: 2px 2px 0px #00D9FF;
            }}
            .content {{
                color: #333333;
                line-height: 1.8;
            }}
            .badge {{
                display: inline-block;
                background: linear-gradient(135deg, #00D9FF, #00FF88);
                color: #000000;
                padding: 10px 20px;
                border-radius: 50px;
                font-weight: bold;
                border: 2px solid #000000;
                margin: 20px 0;
            }}
            .details {{
                background: #FFF59D;
                border: 3px solid #000000;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }}
            .details p {{
                margin: 10px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px dashed #000000;
                color: #666666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 AI Comic Strip Challenge 2026</h1>
                <p>SNS College of Technology</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>{leader_name}</strong>,</p>
                
                <p>Congratulations! Your team has been successfully registered for the AI Comic Strip Challenge 2026!</p>
                
                <div class="badge">✅ REGISTRATION CONFIRMED</div>
                
                <div class="details">
                    <p><strong>🏆 Team Name:</strong> {team_name}</p>
                    <p><strong>💳 Payment ID:</strong> {payment_id}</p>
                    <p><strong>💰 Amount Paid:</strong> ₹{amount}</p>
                </div>
                
                <p>You can now access your dashboard to:</p>
                <ul>
                    <li>View your registration details</li>
                    <li>Download your payment receipt</li>
                    <li>Check your verification status</li>
                </ul>
                
                <p>Get ready to unleash your creativity with AI!</p>
            </div>
            
            <div class="footer">
                <p>🚀 See you at the challenge!</p>
                <p><small>AI Comic Strip Challenge 2026 | SNS College of Technology</small></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_text = f"""
    AI Comic Strip Challenge 2026 - Registration Confirmed!
    
    Dear {leader_name},
    
    Congratulations! Your team "{team_name}" has been successfully registered.
    
    Payment Details:
    - Payment ID: {payment_id}
    - Amount Paid: ₹{amount}
    
    You can now access your dashboard to view registration details and download your receipt.
    
    See you at the challenge!
    
    SNS College of Technology
    """
    
    return send_email(to_email, subject, html_content, plain_text)


EVENT_LABELS = {
    "comic_strip": "AI Comic Strip Challenge",
    "prompt_idol": "Prompt Engineering Idol",
    "ai_blitz": "AI Blitz",
}

FEES_PER_HEAD = {
    "comic_strip": 250,
    "prompt_idol": 200,
    "ai_blitz": 300,
}


def _build_team_members_html(team) -> str:
    """Build HTML list of team members from a Team model object"""
    members_html = f'<p><strong>👤 Team Leader:</strong> {team.leader_name} ({team.leader_email})</p>'
    if team.member2_name and team.member2_email:
        members_html += f'<p><strong>👤 Member 2:</strong> {team.member2_name} ({team.member2_email})</p>'
    if team.member3_name and team.member3_email:
        members_html += f'<p><strong>👤 Member 3:</strong> {team.member3_name} ({team.member3_email})</p>'
    if team.member4_name and team.member4_email:
        members_html += f'<p><strong>👤 Member 4:</strong> {team.member4_name} ({team.member4_email})</p>'
    return members_html


def _build_team_members_text(team) -> str:
    """Build plain text list of team members"""
    members = f'  - Team Leader: {team.leader_name} ({team.leader_email})'
    if team.member2_name and team.member2_email:
        members += f'\n  - Member 2: {team.member2_name} ({team.member2_email})'
    if team.member3_name and team.member3_email:
        members += f'\n  - Member 3: {team.member3_name} ({team.member3_email})'
    if team.member4_name and team.member4_email:
        members += f'\n  - Member 4: {team.member4_name} ({team.member4_email})'
    return members


def _get_all_recipient_emails(team) -> list:
    """Get list of all team member emails (leader + members)"""
    emails = [team.leader_email]
    if team.member2_email:
        emails.append(team.member2_email)
    if team.member3_email:
        emails.append(team.member3_email)
    if team.member4_email:
        emails.append(team.member4_email)
    return emails


def _count_members(team) -> int:
    """Count total team members"""
    count = 1
    if team.member2_name and team.member2_email:
        count += 1
    if team.member3_name and team.member3_email:
        count += 1
    if team.member4_name and team.member4_email:
        count += 1
    return count


def send_payment_approved_email(team, payment) -> bool:
    """Send approval email to ALL team members with full event & payment details"""
    
    event_name = EVENT_LABELS.get(team.event_id, team.event_id)
    fee_per_head = FEES_PER_HEAD.get(team.event_id, 250)
    member_count = _count_members(team)
    members_html = _build_team_members_html(team)
    members_text = _build_team_members_text(team)
    
    subject = f"✅ Payment Approved - {event_name} | TEXPERIA 2026"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Comic Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #00D9FF, #00FF88);
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 5px 5px 0px #000000;
                border: 3px solid #000000;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                font-family: 'Bangers', cursive;
                font-size: 28px;
                color: #00AA00;
                margin: 0;
            }}
            .content {{
                color: #333333;
                line-height: 1.8;
            }}
            .badge {{
                display: inline-block;
                background: linear-gradient(135deg, #00FF88, #00CC66);
                color: #000000;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: bold;
                font-size: 18px;
                border: 2px solid #000000;
                margin: 20px 0;
            }}
            .details {{
                background: #E8F5E9;
                border: 3px solid #000000;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }}
            .details p {{
                margin: 10px 0;
            }}
            .members {{
                background: #E3F2FD;
                border: 3px solid #000000;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }}
            .members p {{
                margin: 8px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px dashed #000000;
                color: #666666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Payment Approved!</h1>
                <p>{event_name} | TEXPERIA 2026</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>{team.team_name}</strong> team,</p>
                
                <p>Great news! Your payment for <strong>{event_name}</strong> has been <strong>approved</strong> by the admin team. Your registration is now confirmed!</p>
                
                <div style="text-align: center;">
                    <span class="badge">✅ PAYMENT VERIFIED</span>
                </div>
                
                <div class="details">
                    <h3 style="margin-top:0;">📋 Event & Payment Details</h3>
                    <p><strong>🎯 Event:</strong> {event_name}</p>
                    <p><strong>🏆 Team Name:</strong> {team.team_name}</p>
                    <p><strong>🏫 Department:</strong> {team.department}</p>
                    <p><strong>📅 Year:</strong> {team.year}</p>
                    <p><strong>💳 Transaction ID:</strong> {payment.transaction_id or 'N/A'}</p>
                    <p><strong>🆔 Order ID:</strong> {payment.order_id or 'N/A'}</p>
                    <p><strong>💰 Fee per Head:</strong> ₹{fee_per_head}</p>
                    <p><strong>👥 Members:</strong> {member_count}</p>
                    <p><strong>💵 Total Amount Paid:</strong> ₹{float(payment.amount)}</p>
                    <p><strong>📌 Status:</strong> Verified ✅</p>
                </div>
                
                <div class="members">
                    <h3 style="margin-top:0;">👥 Team Members</h3>
                    {members_html}
                </div>
                
                <p>You're all set! Here's what to do next:</p>
                <ul>
                    <li>Log in to your dashboard to view your registration details</li>
                    <li>Prepare for the event and gather your team</li>
                    <li>Stay tuned for event updates and announcements</li>
                </ul>
                
                <p>We look forward to seeing you at TEXPERIA 2026! 🚀</p>
            </div>
            
            <div class="footer">
                <p>🎉 See you at the event!</p>
                <p><small>TEXPERIA 2026 | SNS College of Technology</small></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_text = f"""
    TEXPERIA 2026 - Payment Approved!
    
    Dear {team.team_name} team,
    
    Great news! Your payment for {event_name} has been approved.
    Your registration is now confirmed!
    
    Event & Payment Details:
    - Event: {event_name}
    - Team Name: {team.team_name}
    - Department: {team.department}
    - Year: {team.year}
    - Transaction ID: {payment.transaction_id or 'N/A'}
    - Order ID: {payment.order_id or 'N/A'}
    - Fee per Head: ₹{fee_per_head}
    - Members: {member_count}
    - Total Amount Paid: ₹{float(payment.amount)}
    - Status: Verified ✅
    
    Team Members:
{members_text}
    
    Log in to your dashboard to view your registration details.
    
    See you at TEXPERIA 2026!
    
    SNS College of Technology
    """
    
    # Send to ALL team members
    recipients = _get_all_recipient_emails(team)
    success = True
    for email_addr in recipients:
        try:
            result = send_email(email_addr, subject, html_content, plain_text)
            if not result:
                success = False
        except Exception as e:
            print(f"Failed to send approval email to {email_addr}: {e}")
            success = False
    return success


def send_payment_rejected_email(team, payment) -> bool:
    """Send rejection email to ALL team members with full event & payment details"""
    
    event_name = EVENT_LABELS.get(team.event_id, team.event_id)
    fee_per_head = FEES_PER_HEAD.get(team.event_id, 250)
    member_count = _count_members(team)
    members_html = _build_team_members_html(team)
    members_text = _build_team_members_text(team)
    
    subject = f"❌ Payment Rejected - {event_name} | TEXPERIA 2026"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Comic Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #FF6B6B, #FF00FF);
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 5px 5px 0px #000000;
                border: 3px solid #000000;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                font-family: 'Bangers', cursive;
                font-size: 28px;
                color: #CC0000;
                margin: 0;
            }}
            .content {{
                color: #333333;
                line-height: 1.8;
            }}
            .badge {{
                display: inline-block;
                background: linear-gradient(135deg, #FF6B6B, #CC0000);
                color: #FFFFFF;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: bold;
                font-size: 18px;
                border: 2px solid #000000;
                margin: 20px 0;
            }}
            .details {{
                background: #FFEBEE;
                border: 3px solid #000000;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }}
            .details p {{
                margin: 10px 0;
            }}
            .members {{
                background: #E3F2FD;
                border: 3px solid #000000;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }}
            .members p {{
                margin: 8px 0;
            }}
            .action-box {{
                background: #FFF3E0;
                border: 3px solid #FF9800;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px dashed #000000;
                color: #666666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Payment Rejected</h1>
                <p>{event_name} | TEXPERIA 2026</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>{team.team_name}</strong> team,</p>
                
                <p>Unfortunately, your payment for <strong>{event_name}</strong> has been <strong>rejected</strong> by the admin team.</p>
                
                <div style="text-align: center;">
                    <span class="badge">❌ PAYMENT REJECTED</span>
                </div>
                
                <div class="details">
                    <h3 style="margin-top:0;">📋 Event & Payment Details</h3>
                    <p><strong>🎯 Event:</strong> {event_name}</p>
                    <p><strong>🏆 Team Name:</strong> {team.team_name}</p>
                    <p><strong>🏫 Department:</strong> {team.department}</p>
                    <p><strong>📅 Year:</strong> {team.year}</p>
                    <p><strong>💳 Transaction ID:</strong> {payment.transaction_id or 'N/A'}</p>
                    <p><strong>🆔 Order ID:</strong> {payment.order_id or 'N/A'}</p>
                    <p><strong>💰 Fee per Head:</strong> ₹{fee_per_head}</p>
                    <p><strong>👥 Members:</strong> {member_count}</p>
                    <p><strong>💵 Amount:</strong> ₹{float(payment.amount)}</p>
                    <p><strong>📌 Status:</strong> Rejected ❌</p>
                </div>
                
                <div class="members">
                    <h3 style="margin-top:0;">👥 Team Members</h3>
                    {members_html}
                </div>
                
                <div class="action-box">
                    <p><strong>⚠️ What should you do?</strong></p>
                    <ul>
                        <li>Double-check your transaction ID — you may have entered it incorrectly</li>
                        <li>Ensure the payment was made to the correct UPI ID / account</li>
                        <li>Try registering again with the correct payment details</li>
                        <li>Contact the organizing team if you believe this is an error</li>
                    </ul>
                </div>
                
                <p>If you have any questions, please reach out to us through the contact form on our website.</p>
            </div>
            
            <div class="footer">
                <p>📧 Need help? Contact us through the website</p>
                <p><small>TEXPERIA 2026 | SNS College of Technology</small></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_text = f"""
    TEXPERIA 2026 - Payment Rejected
    
    Dear {team.team_name} team,
    
    Unfortunately, your payment for {event_name} has been rejected.
    
    Event & Payment Details:
    - Event: {event_name}
    - Team Name: {team.team_name}
    - Department: {team.department}
    - Year: {team.year}
    - Transaction ID: {payment.transaction_id or 'N/A'}
    - Order ID: {payment.order_id or 'N/A'}
    - Fee per Head: ₹{fee_per_head}
    - Members: {member_count}
    - Amount: ₹{float(payment.amount)}
    - Status: Rejected ❌
    
    Team Members:
{members_text}
    
    What should you do?
    - Double-check your transaction ID
    - Ensure the payment was made to the correct UPI ID / account
    - Try registering again with the correct payment details
    - Contact the organizing team if you believe this is an error
    
    SNS College of Technology
    """
    
    # Send to ALL team members
    recipients = _get_all_recipient_emails(team)
    success = True
    for email_addr in recipients:
        try:
            result = send_email(email_addr, subject, html_content, plain_text)
            if not result:
                success = False
        except Exception as e:
            print(f"Failed to send rejection email to {email_addr}: {e}")
            success = False
    return success


def send_contact_notification(
    name: str,
    email: str,
    message: str
) -> bool:
    """Send notification about new contact form submission"""
    
    admin_email = os.getenv("ADMIN_EMAIL", SMTP_EMAIL)
    subject = f"📬 New Contact Form Submission - {name}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #00D9FF;">
            {message}
        </blockquote>
    </body>
    </html>
    """
    
    return send_email(admin_email, subject, html_content)
