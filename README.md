# Hair Harmony — Salon & Spa Slot Booking Platform

A full-stack, enterprise-grade salon discovery and appointment scheduling web application migrated from Django to a modern, decoupled architecture powered by **React + Vite** and **Node.js + Express + MySQL**.

---

## 📌 Project Overview

**Hair Harmony** connects customers with local salons, enabling real-time slot bookings, transparent pricing, and instant appointment updates. Salon owners can register their business, manage service catalogs, upload gallery photos, and accept/reject customer appointments. Platform administrators have a centralized control dashboard to verify salon owners, monitor platform metrics, and manage cities, areas, and services.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, React Router v6, Axios, Vanilla CSS (Design Tokens, Dark Theme) |
| **Backend** | Node.js, Express.js (REST API), MySQL2 (Connection Pool), JWT (Authentication), Multer (File Uploads), Nodemailer (Emails), bcryptjs |
| **Database** | MySQL 8.0+ (`salondb`) |
| **Styling** | Custom Dark Luxury Theme (`#121212`, `#1a1a1a`, `#d4af37` gold accents) |

---

## 🚀 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL Server**: v8.0 or higher

---

## ⚙️ Installation & Setup

### 1. Database Configuration
1. Start your local MySQL service.
2. Open your MySQL client (MySQL Workbench, phpMyAdmin, or CLI) and run:
   ```sql
   CREATE DATABASE salondb;
   USE salondb;
   ```
3. Import the initial schema and seed data from `backend/database/schema.sql`:
   ```bash
   mysql -u root -p salondb < backend/database/schema.sql
   ```

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
3. Update the credentials in `backend/.env` according to your environment:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=salondb
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=hair_harmony_super_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=true
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_gmail_app_password
   CLIENT_URL=http://localhost:5173
   ```
   > **Note:** If SMTP credentials are left blank or invalid, the backend automatically logs emails to the console in **Simulation Mode** without interrupting the application flow.

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run at `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## 🔐 Default Access Credentials

| Role | Username / Email | Password | Access / Dashboard |
|---|---|---|---|
| **Administrator** | `admin@gmail.com` | `Admin` | `/admin/dashboard` |
| **Salon Owner (Verified)** | `rajesh@example.com` | `Owner@123` | `/owner/dashboard` |
| **Registered Customer** | `john@example.com` | `User@123` | `/user/profile` |

---

## 🌟 Key Features & Business Rules

### 1. Dynamic City-Based Cascading & Filtering
- Selecting a city immediately restricts area options and salon listings across:
  - **Landing Page & User Dashboard**: Discover salons filtered strictly by city and area.
  - **Admin Area Management (`/admin/areas`)**: View and filter areas belonging specifically to the selected city.
  - **Owner Salon Registration & Editing**: Area dropdown auto-populates only with areas belonging to the chosen city.

### 2. Appointment Booking & 3-Hour Cancellation Rule
- Bookings are generated in 1-hour slots matching salon operating hours (`OpenTime` to `CloseTime`).
- Users can view real-time booking history and cancel pending appointments.
- **Rule**: Cancellations requested less than 3 hours before the scheduled appointment slot are automatically rejected with a clear notification.

### 3. Owner Verification Workflow
- Newly registered salon owners are placed in `pending` status.
- Unverified owners cannot access owner dashboards until reviewed.
- Admin reviews, approves, or rejects owner applications with automated email alerts.

### 4. Salon Profile & Catalog Management
- Salon owners can register and update salon info, upload cover photos and gallery showcases (up to 5 photos).
- Time validation enforces `Closing time > Opening time` and `Number of Seats >= 1`.
- Dynamic service pricing customization per salon.

---

## 📁 Repository Structure

```text
wad-project/
├── backend/
│   ├── config/             # Database connection pool (mysql2)
│   ├── controllers/        # Business logic for auth, admin, owner, user, booking
│   ├── database/           # schema.sql and seed definitions
│   ├── middleware/         # Auth verification (JWT) & file uploads (Multer)
│   ├── routes/             # Express API routes
│   ├── scripts/            # Automated test suites for all phases
│   ├── uploads/            # Static image storage (.gitkeep, default.jpg)
│   ├── utils/              # Email notification triggers (Nodemailer)
│   ├── .env.example        # Environment variable template
│   └── server.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── assets/         # Branding images and icons
│   │   ├── components/     # Reusable components (Navbar, Footer, Layouts, Sidebars)
│   │   ├── pages/
│   │   │   ├── admin/      # Admin dashboard, cities, areas, services, bookings
│   │   │   ├── owner/      # Owner dashboard, register/edit salon, services, gallery
│   │   │   ├── salon/      # Public salon details and booking workflow
│   │   │   ├── user/       # User dashboard, booking history, change password
│   │   │   └── ...         # Landing, Login, Register, Forgot Password
│   │   ├── services/       # Axios API client with automatic token attachment
│   │   └── utils/          # Image URL formatting helper
│   ├── index.html          # HTML entry point with Google Fonts (Poppins & Playfair)
│   └── vite.config.js      # Vite dev server and proxy configuration
├── IMPLEMENTATION_PLAN.md  # Detailed phase-by-phase development checklist
├── TODAY_CHANGES.md        # Comprehensive changelog of today's implementation
└── README.md               # Project documentation
```

---

## 🧪 Automated Testing

Automated verification test suites are located in `backend/scripts/`:

```bash
# Run Phase 9 & 10 validation and environment verification
node backend/scripts/testPhase9_10.js

# Run Phase 8 Email and upload verification
node backend/scripts/testPhase8.js

# Run Phase 6 Owner dashboard and workflows test
node backend/scripts/testPhase6.js

# Run Phase 5 User dashboard and booking flow test
node backend/scripts/testPhase5.js
```

---

## 📦 Production Build

To produce an optimized production bundle of the React frontend:

```bash
cd frontend
npm run build
```
Vite will compile all assets into `frontend/dist/` with zero lint or bundling errors.
