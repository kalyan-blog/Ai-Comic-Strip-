"""
AI Comic Strip Challenge 2026 - Backend API
SNS College of Technology

FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import create_tables
from routes import teams, payments, admin, contact

load_dotenv()

# Application metadata
APP_TITLE = "AI Comic Strip Challenge 2026 API"
APP_DESCRIPTION = """
🎨 **AI Comic Strip Challenge 2026** - SNS College of Technology

## Features
- 🔐 JWT Authentication
- 👥 Team Registration
- 💳 Razorpay Payment Integration
- 📊 Admin Dashboard
- 📧 Email Notifications

## Registration Flow
1. Create account
2. Register team details
3. Complete payment via Razorpay
4. Receive confirmation email

## API Documentation
- Swagger UI: `/docs`
- ReDoc: `/redoc`
"""
APP_VERSION = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    print("🚀 Starting AI Comic Strip Challenge 2026 API...")
    create_tables()
    print("✅ Database tables created/verified")
    yield
    # Shutdown
    print("👋 Shutting down API...")


# Create FastAPI application
app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]

# Add production URLs if defined
if os.getenv("PRODUCTION_URL"):
    ALLOWED_ORIGINS.append(os.getenv("PRODUCTION_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(teams.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(contact.router, prefix="/api")


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """API Health Check"""
    return {
        "status": "healthy",
        "message": "AI Comic Strip Challenge 2026 API",
        "version": APP_VERSION
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
