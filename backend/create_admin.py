"""
Admin User Creation Script
Run this script to create an admin user for the system

Usage:
    python create_admin.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, create_tables
from models import User
from auth import get_password_hash, ADMIN_WHITELIST, ADMIN_PASSWORDS

def create_all_admins():
    """Create all admin users with their specific passwords"""
    create_tables()
    db = SessionLocal()
    
    try:
        # Delete all old admin accounts first
        deleted = db.query(User).filter(User.role == "admin").delete()
        if deleted:
            print(f"🗑️  Deleted {deleted} old admin account(s)")
        
        # Create fresh admin accounts
        for email in ADMIN_WHITELIST:
            password = ADMIN_PASSWORDS.get(email, "admin123")
            admin = User(
                email=email,
                password_hash=get_password_hash(password),
                role="admin"
            )
            db.add(admin)
            print(f"✅ Created admin: {email}")
        db.commit()
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🎨 TEXPERIA 2026 - Admin Setup\n")
    create_all_admins()
    print("\n✅ All admin accounts ready!")
