# 🏥 A4 Medical Consortium Hospital Management System

<div align="center">


**A full-stack, production-ready Hospital Management System built with Laravel & React**

--> LIVE • [A4 Medical Consortium](https://hms-limr.vercel.app)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo-accounts) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [Core Modules](#-core-modules)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Security Features](#-security-features)
- [Payment Integration](#-payment-integration)
- [Demo Accounts](#-demo-accounts)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

**A4 Medical Consortium** is a comprehensive, enterprise-grade Hospital Management System designed to streamline healthcare operations. Built with modern web technologies, it provides a seamless experience for patients, doctors, administrators, receptionists, and pharmacy staff.

### 🎯 Problem Statement

Traditional hospital management systems are often fragmented, difficult to use, and lack real-time synchronization between departments. A4 Medical Consortium solves this by providing:

- **Unified Platform**: Single system for all hospital operations
- **Real-time Updates**: Instant synchronization across all modules
- **Role-based Access**: Secure, department-specific interfaces
- **Automated Billing**: Integrated payment processing with Paystack
- **Smart Workflows**: Automated appointment reminders and prescription management

### 🚀 Why A4 Medical Consortium?

- ✅ **Production-Ready**: Battle-tested with real-world hospital workflows
- ✅ **Scalable**: Designed to handle thousands of daily transactions
- ✅ **Secure**: JWT authentication with refresh tokens, CORS protection, and SQL injection prevention
- ✅ **Modern UI/UX**: Beautiful, intuitive interfaces built with React and TailwindCSS
- ✅ **API-First**: RESTful backend perfect for mobile app integration
- ✅ **Open Source**: MIT licensed - free to use and modify

---

## ✨ Features

### 👥 Multi-Role System

<table>
  <tr>
    <td width="20%"><b>🩺 Patients</b></td>
    <td>
      • Book and manage appointments<br>
      • View prescriptions and medical records<br>
      • Make online payments via Paystack<br>
      • Request medical reports<br>
      • Track billing history and receipts
    </td>
  </tr>
  <tr>
    <td><b>👨‍⚕️ Doctors</b></td>
    <td>
      • Manage appointment queue<br>
      • Create and update medical records<br>
      • Write e-prescriptions with drug inventory integration<br>
      • Track patient history<br>
      • View revenue dashboard
    </td>
  </tr>
  <tr>
    <td><b>👔 Administrators</b></td>
    <td>
      • User management and role assignment<br>
      • System logs and activity monitoring<br>
      • Medical report request approvals<br>
      • Full access to all system modules<br>
      • Analytics and reporting
    </td>
  </tr>
  <tr>
    <td><b>📋 Receptionists</b></td>
    <td>
      • Appointment scheduling and management<br>
      • Patient check-in and registration<br>
      • Cash payment processing<br>
      • Access to patient records<br>
      • Billing support
    </td>
  </tr>
  <tr>
    <td><b>💊 Pharmacy</b></td>
    <td>
      • Drug inventory management<br>
      • Prescription dispensing<br>
      • Stock tracking and restocking<br>
      • Sales records<br>
      • Low-stock alerts
    </td>
  </tr>
</table>

### 🔐 Authentication & Security

- **JWT Token-Based Authentication**: Secure, stateless authentication
- **Automatic Token Refresh**: Seamless user experience with background token renewal
- **Password Reset Flow**: Email-based password recovery with token expiration
- **Role-Based Access Control (RBAC)**: Fine-grained permissions per user role
- **CORS Protection**: Secure cross-origin resource sharing
- **Session Management**: Automatic logout on inactivity

### 📅 Appointment Management

- **Smart Scheduling**: Prevents double-booking with conflict detection
- **Multi-status Workflow**: Pending → Confirmed → Completed/Cancelled
- **Email Notifications**: Automatic appointment confirmations and reminders
- **Rescheduling**: Easy date/time changes with availability checking
- **Cancellation Tracking**: Records reasons for quality improvement
- **Doctor Queue Management**: Priority-based appointment viewing

### 💰 Billing & Payments

- **Paystack Integration**: Secure online payments for Nigerian market
- **Invoice Generation**: Itemized bills with platform fees and taxes
- **Receipt Management**: Automatic receipt generation with PDF download
- **Multiple Payment Methods**: Card, Bank Transfer, USSD, Mobile Money
- **Cash Payment Support**: Reception desk payment recording
- **Payment Webhooks**: Real-time payment verification
- **Billing History**: Complete transaction records

### 💊 Prescription & Pharmacy

- **E-Prescription System**: Digital prescription creation and management
- **Drug Inventory**: Real-time stock tracking with low-stock alerts
- **Prescription Dispensing**: Mark prescriptions as fulfilled
- **Refill Requests**: Patient-initiated prescription renewals
- **Drug Search**: Quick lookup by name, category, or generic name
- **Dosage Tracking**: Complete medication history per patient

### 📋 Medical Records

- **Complete Patient History**: Diagnoses, treatments, lab results
- **Secure Storage**: Encrypted sensitive medical data
- **Doctor Notes**: Detailed consultation records
- **Medical Report Requests**: Patient-initiated, admin-approved
- **Document Uploads**: Support for lab results, X-rays, scans
- **Search & Filter**: Quick access to historical records

### 🎨 UI/UX Features

- **Dark Mode**: System-wide theme toggle
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Smooth Animations**: Framer Motion for delightful transitions
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Skeleton screens and progress indicators
- **Form Validation**: Real-time input validation with helpful errors
- **Accessibility**: WCAG 2.1 compliant interfaces

---

## 🛠 Tech Stack

### Frontend (React SPA)

| Technology          | Version | Purpose             |
| ------------------- | ------- | ------------------- |
| **React**           | 19.1.1  | UI framework        |
| **React Router**    | 6.30.1  | Client-side routing |
| **TailwindCSS**     | 4.1.14  | Utility-first CSS   |
| **Framer Motion**   | 12.23   | Animations          |
| **Axios**           | 1.13.4  | HTTP client         |
| **React Hook Form** | 7.71.1  | Form handling       |
| **React Hot Toast** | 2.6.0   | Notifications       |
| **Lucide React**    | 0.563   | Icon library        |
| **Vite**            | 7.1.7   | Build tool          |

### Backend (Laravel API)

| Technology          | Version  | Purpose              |
| ------------------- | -------- | -------------------- |
| **Laravel**         | 12.0     | PHP framework        |
| **PHP**             | 8.2+     | Server-side language |
| **MySQL**           | 8.0+     | Relational database  |
| **JWT Auth**        | 2.2      | Authentication       |
| **Laravel Sanctum** | 4.0      | API tokens           |
| **Resend**          | —        | Email service         |
| **Composer**        | 2.x      | Dependency manager   |

### Third-Party Services

- **Paystack**: Payment gateway for Nigeria
- **Resend**: Transactional email delivery (password reset, appointment/report notifications)
- **Laravel Herd**: Local development server (optional)

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │    Mobile    │  │   Tablet     │     │
│  │   (React)    │  │  (React PWA) │  │  (Adaptive)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway  │
                    │   (Axios +     │
                    │   Interceptors)│
                    └───────┬────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
┌─────────▼──────────┐            ┌──────────▼─────────┐
│  APPLICATION LAYER │            │  AUTHENTICATION    │
│   (Laravel API)    │            │   (JWT Tokens)     │
│                    │◄───────────┤   - Access Token   │
│  - Controllers     │            │   - Refresh Token  │
│  - Services        │            │   - Blacklisting   │
│  - Middleware      │            └────────────────────┘
│  - Validators      │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│   BUSINESS LOGIC   │
│                    │
│  ┌──────────────┐  │
│  │ Appointments │  │
│  ├──────────────┤  │
│  │   Billing    │  │
│  ├──────────────┤  │
│  │Prescriptions │  │
│  ├──────────────┤  │
│  │   Payments   │  │
│  ├──────────────┤  │
│  │Medical Recs  │  │
│  └──────────────┘  │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│   DATA LAYER       │
│                    │
│  ┌──────────────┐  │
│  │    MySQL     │  │
│  │   Database   │  │
│  └──────────────┘  │
│                    │
│  Tables:           │
│  • users           │
│  • appointments    │
│  • invoices        │
│  • payments        │
│  • prescriptions   │
│  • medical_records │
│  • drugs           │
│  • receipts        │
└────────────────────┘

┌────────────────────┐
│ EXTERNAL SERVICES  │
│                    │
│  ┌──────────────┐  │
│  │   Paystack   │  │
│  │   (Payments) │  │
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │ Mail Server  │  │
│  │ (GMAIL/API)  │  │
│  └──────────────┘  │
└────────────────────┘
```

### Data Flow Example: Appointment Booking

```
Patient (React)
      │
      │ 1. POST /api/appointments
      ▼
API Interceptor
      │
      │ 2. Attach JWT token
      ▼
Laravel Middleware
      │
      │ 3. Verify token & role
      ▼
AppointmentController
      │
      │ 4. Validate data
      │ 5. Check doctor availability
      ▼
Database
      │
      │ 6. Create appointment (status: pending)
      │ 7. Create invoice
      ▼
BillingController
      │
      │ 8. Calculate fees (consultation + platform)
      ▼
Email Service
      │
      │ 9. Send confirmation to patient
      │ 10. Notify doctor
      ▼
JSON Response → React
      │
      │ 11. Update UI
      │ 12. Show success toast
      │ 13. Redirect to "My Appointments"
      ▼
Patient sees booking confirmation
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2 ([Download](https://www.php.net/downloads))
- **Composer** >= 2.0 ([Download](https://getcomposer.org/download/))
- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **MySQL** >= 8.0 ([Download](https://dev.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))

**Optional but Recommended:**

- Laravel Herd (for local development server)
- Resend account (for email testing/delivery)
- Paystack account (for payment testing)

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/KabirMarzooq/HMS.git
cd HMS
```

#### 2️⃣ Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

#### 3️⃣ Configure Environment Variables

Edit `backend/.env` file:

```env
# Application
APP_NAME="A4 Medical Consortium"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://backend.test  # or http://localhost:8000

# Frontend URL (for password reset emails)
FRONTEND_URL=http://localhost:5173

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hms_db
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_from_artisan_command
JWT_TTL=60                    # Access token: 60 minutes
JWT_REFRESH_TTL=20160         # Refresh token: 14 days
JWT_BLACKLIST_ENABLED=true
JWT_BLACKLIST_GRACE_PERIOD=30

# Admin Secret (for admin registration)
ADMIN_SECRET=your_secure_admin_key_here

# Email Configuration (Resend — https://resend.com)
# Create an account under the hospital's own email, verify a sending
# domain, then paste the API key below. Leave MAIL_MAILER=log during local
# development if you don't want to burn real sends.
MAIL_MAILER=resend
MAIL_FROM_ADDRESS="notifications@yourhospitaldomain.com"
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Paystack (for payments)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

#### 4️⃣ Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE hms_db;
exit;

# Run migrations
php artisan migrate

# (Optional) Import sample data
mysql -u root -p hms_db < ../hms_db.sql
```

#### 5️⃣ Frontend Setup (React)

```bash
# Navigate to frontend directory
cd ../Frontend

# Install Node dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://backend.test/api" > .env
# OR for local PHP server:
# echo "VITE_API_URL=http://localhost:8000/api" > .env
```

### Running the Application

#### Development Mode

**Terminal 1 - Backend (Laravel):**

```bash
cd backend

# Option 1: Using Laravel Herd (Recommended)
# Just navigate to http://backend.test in browser
# Herd automatically serves your app

# Option 2: Using PHP built-in server
php artisan serve
# Backend will run on http://localhost:8000
```

**Terminal 2 - Frontend (React + Vite):**

```bash
cd Frontend
npm run dev
# Frontend will run on http://localhost:5173
```

**Access the application:**

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://backend.test/api](http://backend.test/api) or [http://localhost:8000/api](http://localhost:8000/api)

#### Production Build

```bash
# Build frontend for production
cd Frontend
npm run build

# The build output will be in Frontend/dist/
# Deploy this folder to your web server (Netlify, Vercel, etc.)

# For backend, configure your web server (Apache/Nginx)
# to point to backend/public directory
```

---

## 📁 Project Structure

```
HMS/
│
├── Frontend/                   # React SPA
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── assets/           # Images, fonts
│   │   ├── components/       # Reusable React components
│   │   │   ├── Dashboard.jsx        # Main dashboard layout
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   └── RoleHome.jsx         # Role-based home pages
│   │   ├── layouts/          # Page layouts
│   │   │   ├── MainLayout.jsx       # Public pages layout
│   │   │   ├── ThemeContext.jsx     # Dark mode provider
│   │   │   └── ScrollToTop.jsx      # Scroll behavior
│   │   ├── pages/            # Public & auth pages
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── About.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── LogIn.jsx            # Login page
│   │   │   ├── SignUp.jsx           # Registration
│   │   │   ├── ForgotPassword.jsx   # Password reset request
│   │   │   └── ResetPassword.jsx    # Password reset form
│   │   ├── sections/         # Dashboard sections (role-specific)
│   │   │   ├── Overview.jsx         # Doctor dashboard
│   │   │   ├── DoctorSchedule.jsx   # Doctor appointments
│   │   │   ├── MyAppointments.jsx   # Patient appointments
│   │   │   ├── BookAppointment.jsx  # Appointment booking
│   │   │   ├── Prescriptions.jsx    # Doctor prescriptions
│   │   │   ├── Pharmacy.jsx         # Patient prescriptions
│   │   │   ├── MedicalRecords.jsx   # Doctor medical records
│   │   │   ├── MedicalReports.jsx   # Patient reports
│   │   │   ├── Billings.jsx         # Patient billing
│   │   │   ├── BillsandReceipts.jsx # Reception billing
│   │   │   ├── Users.jsx            # Admin user management
│   │   │   ├── SystemLogs.jsx       # Admin logs
│   │   │   ├── Inventory.jsx        # Pharmacy inventory
│   │   │   ├── Settings.jsx         # User settings
│   │   │   ├── Profile.jsx          # User profile
│   │   │   └── Support.jsx          # Help & support
│   │   ├── services/         # API integration
│   │   │   └── api.js               # Axios instance + interceptors
│   │   ├── utils/            # Utility functions
│   │   │   └── tokenRefresh.js      # Auto token refresh
│   │   ├── App.jsx           # Root component + routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   └── tailwind.config.js    # TailwindCSS config
│
├── backend/                   # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php           # Auth endpoints
│   │   │   │   ├── AppointmentController.php    # Appointments
│   │   │   │   ├── BillingController.php        # Patient billing
│   │   │   │   ├── ReceptionBillingController.php # Reception billing
│   │   │   │   ├── PaystackController.php       # Payment gateway
│   │   │   │   ├── PrescriptionController.php   # Prescriptions
│   │   │   │   ├── MedicalRecordController.php  # Medical records
│   │   │   │   ├── DrugController.php           # Pharmacy inventory
│   │   │   │   ├── DashboardController.php      # Dashboard stats
│   │   │   │   ├── UserSettingsController.php   # User settings
│   │   │   │   └── Admin/
│   │   │   │       ├── AdminUserController.php  # User management
│   │   │   │       ├── AdminScheduleController.php
│   │   │   │       └── AdminSystemLogController.php
│   │   │   └── Middleware/
│   │   │       └── RoleMiddleware.php           # RBAC
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Appointment.php
│   │   │   ├── Invoice.php
│   │   │   ├── InvoiceItem.php
│   │   │   ├── Payment.php
│   │   │   ├── Receipt.php
│   │   │   ├── Prescription.php
│   │   │   ├── PrescriptionItem.php
│   │   │   ├── MedicalRecord.php
│   │   │   ├── Drug.php
│   │   │   ├── SystemLog.php
│   │   │   └── MedicalReportRequest.php
│   │   └── Mail/              # Email templates
│   ├── config/
│   │   ├── jwt.php           # JWT configuration
│   │   ├── cors.php          # CORS settings
│   │   └── database.php      # Database config
│   ├── database/
│   │   ├── migrations/       # Database schema
│   │   └── seeders/          # Sample data
│   ├── resources/
│   │   └── views/
│   │       └── emails/
│   │           └── password-reset.blade.php
│   ├── routes/
│   │   └── api.php           # API routes
│   ├── .env                  # Environment variables
│   ├── composer.json         # PHP dependencies
│   └── artisan               # Laravel CLI
│
├── hms_db.sql                # Sample database dump
└── README.md                 # This file
```

---

## 🧩 Core Modules

### 1. Authentication System

**JWT Token Flow:**

- **Access Token**: 60-minute lifespan for API requests
- **Refresh Token**: 14-day lifespan for automatic renewal
- **Auto-refresh**: Frontend refreshes token every 50 minutes
- **Blacklisting**: Logout invalidates tokens on backend

**Password Reset:**

1. User requests reset → Email sent with token
2. Token valid for 60 minutes
3. User sets new password → Token deleted
4. Automatic redirect to login

### 2. Appointment Workflow

```
Patient Books → Doctor Receives Notification → Doctor Accepts/Declines
                                                         │
                                                         ├─ Accept → Invoice Created
                                                         │            Patient Pays
                                                         │            Appointment Confirmed
                                                         │            Doctor Sees Patient
                                                         │            Marks Completed
                                                         │
                                                         └─ Decline → Cancellation Email
                                                                      Reason Recorded
```

### 3. Billing System

**Invoice Components:**

- **Consultation Fee**: Doctor-specific or default rate
- **Platform Fee**: 10% of consultation fee
- **Emergency Surcharge**: +50% for after-hours
- **Tax**: VAT where applicable

**Payment Flow:**

```
Appointment Accepted → Invoice Generated → Patient Notified
                                               │
                                               ├─ Pay Online → Paystack Gateway
                                               │                    │
                                               │                    ├─ Success → Receipt Generated
                                               │                    │            Appointment Confirmed
                                               │                    │
                                               │                    └─ Failed → Retry Option
                                               │
                                               └─ Pay Cash → Reception Records
                                                             Receipt Generated
                                                             Appointment Confirmed
```

### 4. Prescription Management

**Doctor Workflow:**

1. View patient during appointment
2. Create prescription with multiple drugs
3. System checks drug inventory
4. Prescription sent to pharmacy
5. Patient notified via email

**Pharmacy Workflow:**

1. View pending prescriptions
2. Dispense drugs (update inventory)
3. Mark prescription as fulfilled
4. Generate receipt

**Patient Workflow:**

1. View prescribed medications
2. Request refills
3. Track dispensing status
4. Download prescription PDFs

---

## 📡 API Documentation

### Base URL

```
Production: https://your-domain.com/api
Development: http://backend.test/api or http://localhost:8000/api
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {access_token}
```

### Core Endpoints

#### Authentication

| Method | Endpoint                | Description            | Auth Required   |
| ------ | ----------------------- | ---------------------- | --------------- |
| POST   | `/auth/register`        | Register new user      | No              |
| POST   | `/auth/login`           | Login user             | No              |
| POST   | `/auth/refresh`         | Refresh access token   | Yes (any token) |
| POST   | `/auth/logout`          | Logout user            | Yes             |
| GET    | `/auth/me`              | Get current user       | Yes             |
| POST   | `/auth/forgot-password` | Request password reset | No              |
| POST   | `/auth/reset-password`  | Reset password         | No              |

**Example Login Request:**

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "SecurePass123"
}
```

**Example Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

#### Appointments

| Method | Endpoint                        | Description             | Access  |
| ------ | ------------------------------- | ----------------------- | ------- |
| POST   | `/appointments`                 | Book appointment        | Patient |
| GET    | `/my-appointments`              | Get user's appointments | Patient |
| GET    | `/doctor/appointments`          | Get doctor's queue      | Doctor  |
| PATCH  | `/appointments/{id}/accept`     | Accept appointment      | Doctor  |
| PATCH  | `/appointments/{id}/decline`    | Decline appointment     | Doctor  |
| PATCH  | `/appointments/{id}/cancel`     | Cancel appointment      | Patient |
| PATCH  | `/appointments/{id}/reschedule` | Reschedule appointment  | Patient |

#### Billing

| Method | Endpoint                        | Description         | Access  |
| ------ | ------------------------------- | ------------------- | ------- |
| GET    | `/patient/bills`                | Get patient bills   | Patient |
| GET    | `/patient/bills/{id}`           | Get invoice details | Patient |
| GET    | `/patient/receipts/{id}`        | Get receipt         | Patient |
| POST   | `/patient/payment/initialize`   | Initialize payment  | Patient |
| GET    | `/patient/payment/verify/{ref}` | Verify payment      | Patient |
| POST   | `/webhook/paystack`             | Paystack webhook    | Public  |

#### Prescriptions

| Method | Endpoint                             | Description                 | Access                      |
| ------ | ------------------------------------ | --------------------------- | --------------------------- |
| POST   | `/doctor/prescriptions`              | Create prescription         | Doctor                      |
| GET    | `/doctor/prescriptions`              | Get doctor's prescriptions  | Doctor                      |
| GET    | `/patient/prescriptions`             | Get patient's prescriptions | Patient                     |
| POST   | `/patient/prescriptions/{id}/refill` | Request refill              | Patient                     |
| GET    | `/prescriptions`                     | Get all prescriptions       | Admin/Receptionist/Pharmacy |

### Error Responses

All errors follow this format:

```json
{
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Validation error for this field"]
  }
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Resource created
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `422` - Unprocessable entity
- `500` - Server error

---

## 👥 User Roles & Permissions

### Permission Matrix

| Feature                    | Patient | Doctor   | Receptionist | Pharmacy | Admin |
| -------------------------- | ------- | -------- | ------------ | -------- | ----- |
| **Appointments**           |
| Book appointment           | ✅      | ✅       | ✅           | ✅       | ✅    |
| View own appointments      | ✅      | ✅       | ✅           | ✅       | ✅    |
| View all appointments      | ❌      | ❌       | ✅           | ❌       | ✅    |
| Accept/Decline appointment | ❌      | ✅       | ❌           | ❌       | ❌    |
| **Billing**                |
| View own bills             | ✅      | ❌       | ❌           | ❌       | ❌    |
| Pay online                 | ✅      | ❌       | ❌           | ❌       | ❌    |
| Record cash payment        | ❌      | ❌       | ✅           | ❌       | ✅    |
| View all bills             | ❌      | ❌       | ✅           | ✅       | ✅    |
| **Prescriptions**          |
| View own prescriptions     | ✅      | ❌       | ❌           | ❌       | ❌    |
| Create prescription        | ❌      | ✅       | ❌           | ❌       | ❌    |
| Dispense medication        | ❌      | ❌       | ❌           | ✅       | ❌    |
| View all prescriptions     | ❌      | ❌       | ✅           | ✅       | ✅    |
| **Medical Records**        |
| View own records           | ✅      | ❌       | ❌           | ❌       | ❌    |
| Create/Edit records        | ❌      | ✅       | ❌           | ❌       | ❌    |
| View patient records       | ❌      | ✅       | ✅           | ❌       | ✅    |
| Request medical report     | ✅      | ❌       | ❌           | ❌       | ❌    |
| Approve report request     | ❌      | ❌       | ❌           | ❌       | ✅    |
| **Inventory**              |
| View drug inventory        | ❌      | ✅       | ❌           | ✅       | ✅    |
| Add/Edit drugs             | ❌      | ❌       | ❌           | ✅       | ✅    |
| Restock drugs              | ❌      | ❌       | ❌           | ✅       | ✅    |
| **User Management**        |
| Update own profile         | ✅      | ✅       | ✅           | ✅       | ✅    |
| View all users             | ❌      | ❌       | ❌           | ❌       | ✅    |
| Change user roles          | ❌      | ❌       | ❌           | ❌       | ✅    |
| Delete users               | ❌      | ❌       | ❌           | ❌       | ✅    |
| **System**                 |
| View system logs           | ❌      | ❌       | ❌           | ❌       | ✅    |
| View analytics             | ❌      | ✅       | ❌           | ❌       | ✅    |

### Role Registration

- **Patient, Doctor, Receptionist, Pharmacy**: Self-registration with email verification
- **Admin**: Requires `ADMIN_SECRET` key during registration

---

## 🔒 Security Features

### 1. Authentication Security

- **Password Hashing**: Bcrypt with cost factor 10
- **JWT Tokens**: RS256 algorithm with rotation
- **Token Blacklisting**: Logout invalidates tokens permanently
- **Refresh Token Strategy**: Separate short-lived access + long-lived refresh
- **Password Reset**: Time-limited tokens (60 minutes)

### 2. API Security

- **CORS Protection**: Whitelist-based origin validation
- **Rate Limiting**: 60 requests/minute per IP
- **SQL Injection Prevention**: Eloquent ORM parameterized queries
- **XSS Protection**: Input sanitization + output escaping
- **CSRF Protection**: Token-based for state-changing operations

### 3. Data Protection

- **Sensitive Data Encryption**: Medical records encrypted at rest
- **HTTPS Enforcement**: Production requires SSL/TLS
- **Database Encryption**: Password fields hashed, not encrypted
- **File Upload Validation**: Type, size, and content checking
- **Audit Logging**: All critical actions logged with user ID

### 4. Access Control

- **Role-Based Access Control (RBAC)**: Middleware-enforced permissions
- **Route Protection**: Frontend + backend guards
- **Principle of Least Privilege**: Users only access necessary resources
- **Session Management**: Automatic timeout after inactivity

---

## 💳 Payment Integration

### Paystack Setup

1. **Create Paystack Account**: [https://paystack.com/](https://paystack.com/)

2. **Get API Keys**:

   - Login to Paystack Dashboard
   - Navigate to Settings → API Keys & Webhooks
   - Copy **Secret Key** and **Public Key**

3. **Configure Backend**:

```env
# backend/.env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

4. **Set Webhook URL**:
   - Paystack Dashboard → Settings → Webhooks
   - Add: `https://your-domain.com/api/webhook/paystack`
   - Events: `charge.success`, `charge.failed`

### Payment Flow

```
Patient clicks "Pay Now" → Frontend initializes payment → Paystack returns URL
                                                                    │
                                                                    ▼
                                                      Patient redirected to Paystack
                                                                    │
                                    ┌───────────────────────────────┴───────────────────────────────┐
                                    │                                                               │
                                    ▼                                                               ▼
                        Payment Successful                                              Payment Failed
                                    │                                                               │
                                    ▼                                                               ▼
                    Webhook triggers backend                                     User redirected back
                    Backend verifies payment                                      "Payment Failed" toast
                    Updates invoice status
                    Generates receipt
                    Sends email
                                    │
                                    ▼
                    User redirected to success page
                    "Payment Successful" toast
                    Receipt available for download
```

---

## 🎭 Demo Accounts

Use these credentials to test different roles:

| Role             | Email                              | Password           |
| ---------------- | ----------------------------------- | ------------------ |
| **Patient**      | patient.demo@a4medicalconsortium.com     | ChangeMe123!  |
| **Doctor**       | doctor.demo@a4medicalconsortium.com      | ChangeMe123!  |
| **Admin**        | admin.demo@a4medicalconsortium.com       | ChangeMe123!  |
| **Receptionist** | reception.demo@a4medicalconsortium.com   | ChangeMe123!  |
| **Pharmacy**     | pharmacy.demo@a4medicalconsortium.com    | ChangeMe123!  |

**Note**: These are placeholder demo accounts for local testing only — no such accounts exist by default. Never seed a production database with real personal email addresses or shared passwords; create each staff account for real during admin approval instead.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Open an issue with detailed reproduction steps
- 💡 **Suggest Features**: Share your ideas for improvements
- 📝 **Improve Documentation**: Fix typos, add examples, clarify instructions
- 💻 **Submit Code**: Fork, code, and create pull requests

### Development Workflow

1. **Fork the Repository**

```bash
git clone https://github.com/KabirMarzooq/HMS.git
cd HMS
```

2. **Create a Feature Branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make Your Changes**

   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Your Changes**

```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit Message Convention:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

5. **Push to Your Fork**

```bash
git push origin feature/amazing-feature
```

6. **Create Pull Request**
   - Go to original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

### Code Style Guidelines

**PHP (Laravel):**

- Follow [PSR-12](https://www.php-fig.org/psr/psr-12/) coding standard
- Use type hints for method parameters and return types
- Write meaningful variable and method names

**JavaScript (React):**

- Use ES6+ syntax
- Functional components with hooks
- PropTypes for component props
- Consistent naming: `camelCase` for variables, `PascalCase` for components

**CSS (TailwindCSS):**

- Use utility classes first
- Extract repeating patterns into components
- Follow mobile-first responsive design

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 A4 Medical Consortium Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💬 Support

Need help? We're here for you!

### 📧 Contact

- **Email**: a4consortium@gmail.com
- **GitHub Issues**: [Report a bug](https://github.com/KabirMarzooq/HMS/issues)
- **Discussions**: [Ask questions](https://github.com/KabirMarzooq/HMS/discussions)

### 🐛 Found a Bug?

1. Check [existing issues](https://github.com/KabirMarzooq/HMS/issues)
2. If not found, [create a new issue](https://github.com/KabirMarzooq/HMS/issues/new)
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Browser/OS version

---

## 🙏 Acknowledgments

Special thanks to:

- **Laravel Team** - For the amazing PHP framework
- **React Team** - For the revolutionary UI library
- **TailwindCSS** - For making CSS enjoyable again
- **Paystack** - For reliable payment infrastructure

---

## 🗺️ Roadmap

### Version 2.0 (Planned)

- [ ] Mobile App (React Native)
- [ ] Telemedicine (Video Consultations)
- [ ] AI-Powered Diagnosis Suggestions
- [ ] Multi-Language Support
- [ ] Advanced Analytics Dashboard
- [ ] Insurance Integration
- [ ] Lab Integration (LIMS)
- [ ] Radiology Integration (PACS)
- [ ] Bed Management System
- [ ] Staff Attendance Tracking
- [ ] Patient Portal (Self-Service)
- [ ] Emergency Alerts System

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Made by Kabir Marzooq**

[⬆ Back to Top](#-a4medicalconsortium-hospital-management-system)

</div>
