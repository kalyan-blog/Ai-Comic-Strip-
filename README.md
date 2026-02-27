# 🎨 AI Comic Strip Challenge 2026

> **A production-ready web application for the AI Comic Strip Challenge organized by SNS College of Engineering**

![Tech Stack](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-3395FF?style=flat-square&logo=razorpay)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Deployment Guide](#-deployment-guide)

---

## ✨ Features

### 🏠 Landing Page
- Animated hero section with countdown timer
- Comic-style neubrutalism design
- FAQ accordion
- Rules & guidelines
- Contact form

### 👥 Registration Flow
- User account creation
- Team registration (1-3 members)
- Razorpay payment integration (₹250)
- Email confirmation on success

### 📊 Student Dashboard
- View registration details
- Check verification status
- Download payment receipt
- Edit profile (before deadline)

### 🔐 Admin Portal
- Statistics cards (Revenue, Teams, etc.)
- Department-wise bar chart
- Teams table with search/filter
- CSV export functionality
- Toggle verification status

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Charts:** Chart.js + react-chartjs-2
- **Notifications:** react-hot-toast
- **Icons:** react-icons

### Backend
- **Framework:** Python FastAPI
- **ORM:** SQLAlchemy 2.0
- **Database:** PostgreSQL (Supabase compatible)
- **Authentication:** JWT (python-jose)
- **Password Hashing:** Passlib (bcrypt)
- **Payment:** Razorpay SDK
- **Email:** SMTP (Gmail/SendGrid)

---

## 📁 Project Structure

```
ai-comic-challenge-2026/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication
│   ├── database.py          # Database configuration
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment template
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── teams.py         # Team registration routes
│   │   ├── payments.py      # Razorpay integration
│   │   ├── admin.py         # Admin dashboard routes
│   │   └── contact.py       # Contact form
│   └── utils/
│       ├── __init__.py
│       └── email_service.py # SMTP email service
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx         # App entry point
│       ├── App.jsx          # Main app with routing
│       ├── index.css        # Global styles
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── TeamRegistration.jsx
│       │   ├── Dashboard.jsx
│       │   └── AdminDashboard.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── services/
│           └── api.js
│
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database (or Supabase account)
- Razorpay account (test mode)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your values

# Run the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database (Supabase/PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database_name

# JWT Secret (generate a strong random string)
SECRET_KEY=your-super-secret-key-min-32-chars

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_SECRET=your_razorpay_secret_key

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Admin Email
ADMIN_EMAIL=admin@snsce.ac.in

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
PRODUCTION_URL=https://your-app.vercel.app

# Registration Deadline
REGISTRATION_DEADLINE=2026-03-15T23:59:59

# Server
PORT=8000
DEBUG=true
```

### Frontend (.env)

```env
# API URL
VITE_API_URL=http://localhost:8000/api

# Razorpay Key (public)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| email | String(255) | Unique, indexed |
| password_hash | String(255) | Bcrypt hash |
| role | String(20) | 'admin' or 'student' |
| created_at | DateTime | Auto-generated |

### Teams Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to users |
| team_name | String(100) | Unique, indexed |
| department | String(100) | |
| year | String(20) | 1st-4th Year |
| leader_name | String(100) | |
| leader_email | String(255) | |
| leader_phone | String(15) | |
| member2_name | String(100) | Optional |
| member2_email | String(255) | Optional |
| member3_name | String(100) | Optional |
| member3_email | String(255) | Optional |
| verified | Boolean | Default: false |
| registered_at | DateTime | Auto-generated |

### Payments Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| team_id | Integer | Foreign key to teams |
| razorpay_order_id | String(100) | Unique |
| razorpay_payment_id | String(100) | Unique |
| razorpay_signature | String(255) | |
| amount | Numeric(10,2) | ₹250 |
| currency | String(10) | INR |
| status | String(20) | pending/success/failed |
| created_at | DateTime | |
| paid_at | DateTime | |

### Contacts Table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(100) | |
| email | String(255) | |
| message | Text | |
| is_read | Boolean | Default: false |
| created_at | DateTime | |

---

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams/register` | Create user account |
| POST | `/api/teams/login` | Login and get JWT |

### Team Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams/create` | Register team |
| GET | `/api/teams/me` | Get current team |
| PUT | `/api/teams/update` | Update team details |
| GET | `/api/teams/registration-status` | Check deadline |

### Payment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| GET | `/api/payments/status` | Get payment status |

### Admin Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/teams` | List all teams |
| PUT | `/api/admin/teams/{id}/verify` | Toggle verification |
| GET | `/api/admin/export/csv` | Export teams CSV |
| GET | `/api/admin/departments` | Department breakdown |

---

## 🚢 Deployment Guide

### Backend Deployment (Render)

1. **Create a Render Account:** https://render.com

2. **Create PostgreSQL Database:**
   - Go to Dashboard → New → PostgreSQL
   - Note down the connection URL

3. **Deploy Backend:**
   - Go to Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Root Directory:** `backend`
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   
4. **Set Environment Variables:**
   - Add all variables from `.env.example`
   - Use the PostgreSQL URL from step 2

### Frontend Deployment (Vercel)

1. **Create a Vercel Account:** https://vercel.com

2. **Import Project:**
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory:** `frontend`
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   ```

4. **Deploy!**

### Post-Deployment Checklist

- [ ] Update `FRONTEND_URL` and `PRODUCTION_URL` in backend
- [ ] Switch Razorpay to live mode
- [ ] Test payment flow with real transaction
- [ ] Set up Razorpay webhook for reliability
- [ ] Configure custom domain (optional)

---

## 🎨 Visual Design

### Color Palette
- **Cyan:** `#00D9FF` - Primary accent
- **Neon Pink:** `#FF00FF` - Secondary accent
- **Yellow:** `#FFE500` - Highlights
- **Green:** `#00FF88` - Success states
- **Dark:** `#1A1A2E` - Background

### Typography
- **Headings:** 'Bangers' (Google Fonts)
- **Body Text:** 'Comic Neue' (Google Fonts)

### Design System
- Neubrutalism style with 5px hard black shadows
- Speech bubble cards
- Animated buttons with glow effects
- Mobile-first responsive design

---

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- CORS configuration
- Role-based access control (RBAC)
- Razorpay signature verification
- Input validation with Pydantic

---

## 📧 Creating Admin User

Run this Python script to create an admin user:

```python
from database import SessionLocal
from models import User
from auth import get_password_hash

db = SessionLocal()
admin = User(
    email="admin@snsce.ac.in",
    password_hash=get_password_hash("admin123"),
    role="admin"
)
db.add(admin)
db.commit()
print("Admin user created!")
```

---

## 📄 License

This project is created for SNS College of Engineering's AI Comic Strip Challenge 2026.

---

## 🤝 Support

For issues or questions, contact: events@snsce.ac.in

---

<p align="center">
  Made with 💜 for AI Comic Strip Challenge 2026
  <br>
  SNS College of Engineering, Coimbatore
</p>