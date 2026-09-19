# IMPLEMENTATION_PLAN.md
# Hair Harmony — Phase-Wise Implementation Plan
### Migration: Django + MySQL → React.js (Vite) + Node.js (Express) + MySQL

---

## Overview

| Phase | Name | Focus | Est. Effort |
|-------|------|-------|-------------|
| 1 | Project Setup & Database | Scaffold, DB schema, env config | ~1 day |
| 2 | Backend – Auth & Core APIs | Express server, auth, user/admin APIs | ~2 days |
| 3 | Backend – Owner & Booking APIs | Salon, services, images, bookings | ~2 days |
| 4 | Frontend – Public Pages | Landing, Login, Register, Forgot Password | ~2 days |
| 5 | Frontend – User Dashboard | Profile, Salon Details, Booking, History | ~2 days |
| 6 | Frontend – Owner Dashboard | Salon mgmt, services, images, bookings | ~1.5 days |
| 7 | Frontend – Admin Dashboard | Owner approval, city/area/service CRUD | ~1.5 days |
| 8 | Email & File Upload Integration | Nodemailer, Multer, static serving | ~1 day |
| 9 | Polish, Validation & Testing | Error handling, validations, edge cases | ~1 day |
| 10 | Final Review & Deployment Prep | Env, build, README, smoke test | ~0.5 days |

**Total Estimated Effort:** ~14.5 days

---

## Phase 1 — Project Setup & Database

> [!IMPORTANT]
> Complete this phase fully before writing any application code. A clean scaffold avoids restructuring later.

### 1.1 Initialize Workspace
- [x] Create root directory structure:
  ```
  wad-project/
  ├── frontend/
  ├── backend/
  └── PROJECT_SPECIFICATION.md  ✅ (already created)
  ```
- [x] Initialize Git repository: `git init`
- [x] Create root `.gitignore` (ignore `node_modules/`, `.env`, `backend/uploads/`, `dist/`)

### 1.2 Backend Scaffold (Node.js + Express)
- [x] Inside `backend/`: run `npm init -y`
- [x] Install dependencies:
  ```bash
  npm install express mysql2 bcryptjs jsonwebtoken dotenv cors multer nodemailer
  npm install --save-dev nodemon
  ```
- [x] Create folder structure:
  ```
  backend/
  ├── config/db.js
  ├── controllers/
  ├── middleware/
  ├── models/
  ├── routes/
  ├── utils/
  ├── uploads/          ← add .gitkeep
  ├── .env
  └── server.js
  ```
- [x] Add `start` and `dev` scripts to `package.json`

### 1.3 Frontend Scaffold (React + Vite)
- [x] Inside `frontend/`: run `npm create vite@latest . -- --template react`
- [x] Install dependencies:
  ```bash
  npm install axios react-router-dom
  ```
- [x] Create folder structure:
  ```
  frontend/src/
  ├── assets/
  ├── components/
  ├── pages/
  │   ├── user/
  │   ├── owner/
  │   ├── admin/
  │   └── salon/
  ├── context/
  ├── hooks/
  ├── services/api.js
  └── utils/generateSlots.js
  ```
- [x] Configure Vite proxy in `vite.config.js`:
  ```js
  server: { proxy: { '/api': 'http://localhost:5000' } }
  ```

### 1.4 MySQL Database Setup
- [x] Create database: `CREATE DATABASE salondb;`
- [x] Write and run `backend/config/schema.sql` with all 8 tables:

```sql
-- CityMst
CREATE TABLE citymst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  CityName VARCHAR(30) NOT NULL
);

-- AreaMst
CREATE TABLE areamst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  AreaName VARCHAR(40) NOT NULL,
  CityName_id INT NOT NULL,
  FOREIGN KEY (CityName_id) REFERENCES citymst(id) ON DELETE CASCADE
);

-- ServiceMst
CREATE TABLE servicemst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ServiceName VARCHAR(30) NOT NULL
);

-- UserMst
CREATE TABLE usermst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(20) NOT NULL,
  UserName VARCHAR(20) NOT NULL,
  Email VARCHAR(50) NOT NULL UNIQUE,
  PhoneNumber VARCHAR(10) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Usertype VARCHAR(10) NOT NULL,
  Status VARCHAR(10) NOT NULL DEFAULT 'pending',
  Img VARCHAR(255) DEFAULT 'default.jpg',
  password_reset_token VARCHAR(255) DEFAULT NULL
);

-- SalonMst
CREATE TABLE salonmst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(20) NOT NULL,
  Location VARCHAR(20) NOT NULL,
  Owner_id INT NOT NULL,
  Img VARCHAR(255) DEFAULT 'default.jpg',
  Status VARCHAR(10) NOT NULL DEFAULT 'active',
  NumberOfSeats INT NOT NULL,
  Area_id INT NOT NULL,
  City_id INT NOT NULL,
  OpenTime TIME NOT NULL,
  CloseTime TIME NOT NULL,
  Type VARCHAR(10) NOT NULL,
  FOREIGN KEY (Owner_id) REFERENCES usermst(id) ON DELETE CASCADE,
  FOREIGN KEY (Area_id) REFERENCES areamst(id) ON DELETE CASCADE,
  FOREIGN KEY (City_id) REFERENCES citymst(id) ON DELETE CASCADE
);

-- SelectedServicesmsMst
CREATE TABLE selectedservicesmst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ServiceName_id INT NOT NULL,
  SalonId_id INT NOT NULL,
  Price INT NOT NULL,
  FOREIGN KEY (ServiceName_id) REFERENCES servicemst(id) ON DELETE CASCADE,
  FOREIGN KEY (SalonId_id) REFERENCES salonmst(id) ON DELETE CASCADE
);

-- ImageMst
CREATE TABLE imagemst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  SalonId_id INT NOT NULL,
  Img VARCHAR(255) DEFAULT 'default.jpg',
  FOREIGN KEY (SalonId_id) REFERENCES salonmst(id) ON DELETE CASCADE
);

-- SlotBookingMst
CREATE TABLE slotbookingmst (
  id INT AUTO_INCREMENT PRIMARY KEY,
  BookingDate DATE NOT NULL,
  TimeSlote VARCHAR(20) NOT NULL,
  ServiceId_id INT NOT NULL,
  SalonId_id INT NOT NULL,
  UserId_id INT NOT NULL,
  BillAmount INT NOT NULL,
  Status VARCHAR(10) NOT NULL DEFAULT 'Pending',
  FOREIGN KEY (ServiceId_id) REFERENCES selectedservicesmst(id) ON DELETE CASCADE,
  FOREIGN KEY (SalonId_id) REFERENCES salonmst(id) ON DELETE CASCADE,
  FOREIGN KEY (UserId_id) REFERENCES usermst(id) ON DELETE CASCADE
);
```

### 1.5 Backend DB Connection
- [x] Configure `backend/config/db.js` using `mysql2` connection pool
- [x] Set all values from `.env`
- [x] Test connection with a simple `SELECT 1` query on server start

### ✅ Phase 1 Deliverables
- Working project scaffold (frontend + backend)
- MySQL database with all 8 tables
- DB connection verified
- Env file configured

---

## Phase 2 — Backend: Auth & Core APIs

> [!NOTE]
> Build all auth and admin endpoints here. Admin dashboard data depends on these routes.

### 2.1 Express Server Entry Point (`server.js`)
- [ ] Setup Express with:
  - `cors({ origin: 'http://localhost:5173', credentials: true })`
  - `express.json()`
  - `/uploads` static file serving
  - Route mounts: `/api/auth`, `/api/admin`, `/api/user`, `/api/owner`, `/api/salons`
- [ ] Global error handler middleware

### 2.2 Auth Middleware (`middleware/authMiddleware.js`)
- [ ] `verifyToken(req, res, next)` — verifies JWT from `Authorization` header
- [ ] `requireAdmin(req, res, next)` — checks `role === 'admin'`
- [ ] `requireUser(req, res, next)` — checks `role === 'user'`
- [ ] `requireOwner(req, res, next)` — checks `role === 'owner'`

### 2.3 Auth Controller (`controllers/authController.js`)

#### `POST /api/auth/login`
- [ ] Check if admin (hardcoded: `admin@gmail.com` / `Admin`) → return `{ token, role: 'admin' }`
- [ ] Check User: email + password match in `usermst` → return `{ token, role: 'user', user }`
- [ ] Check Owner: email + password match AND `Status = 'verified'` → return `{ token, role: 'owner', user }`
- [ ] Else: return `401 { message: 'Invalid credentials' }`
- [ ] Use `bcrypt.compare()` for password check

#### `POST /api/auth/register`
- [ ] Validate: phone = 10 digits, password pattern (uppercase + lowercase + digit + special char + min 8)
- [ ] Check for existing email → return 400 if duplicate
- [ ] Hash password with `bcrypt.hash(password, 10)`
- [ ] Save to `usermst` with `Status = 'pending'`
- [ ] Send welcome registration email (via util)
- [ ] Return success message

#### `POST /api/auth/forgot-password`
- [ ] Find user by email in `usermst`
- [ ] Generate 50-char token: `crypto.randomBytes(25).toString('hex')`
- [ ] Save token to `password_reset_token` column
- [ ] Send reset link email: `${CLIENT_URL}/reset-password/${token}`
- [ ] Return success (even if email not found — don't leak info)

#### `POST /api/auth/reset-password/:token`
- [ ] Find user by `password_reset_token = token`
- [ ] Validate `newPassword === confirmPassword`
- [ ] Hash and save new password, clear `password_reset_token`
- [ ] Send password-changed confirmation email
- [ ] Return success

#### `POST /api/auth/change-password`
- [ ] Protected (`verifyToken`)
- [ ] Verify old password with `bcrypt.compare()`
- [ ] Validate `newPassword === confirmPassword`
- [ ] Hash and save new password
- [ ] Send change-password email
- [ ] Return success

### 2.4 Admin Controller (`controllers/adminController.js`)

#### `GET /api/admin/dashboard`
- [ ] Protected (`requireAdmin`)
- [ ] Query: all `usermst` where `Usertype = 'owner'` (owner requests)
- [ ] Query: count of all `usermst` rows (total users)
- [ ] Query: `slotbookingmst` where `BookingDate = today` (today's bookings)
- [ ] Return all three in response

#### `PATCH /api/admin/owners/:id/status`
- [ ] Protected (`requireAdmin`)
- [ ] Update `usermst.Status` to `verified` or `rejected`
- [ ] If verified → call `sendSalonApprovalEmail(email, name)`
- [ ] If rejected → call `sendSalonRejectionEmail(email, name, reason)`

#### City CRUD (`GET /api/admin/cities`, `POST`, `GET /:id`, `PUT /:id`)
- [ ] GET all: `SELECT * FROM citymst ORDER BY CityName`
- [ ] GET one: `SELECT * FROM citymst WHERE id = ?`
- [ ] POST: `INSERT INTO citymst (CityName) VALUES (?)`
- [ ] PUT: `UPDATE citymst SET CityName = ? WHERE id = ?`

#### Area CRUD (`GET /api/admin/areas`, `POST`, `GET /:id`, `PUT /:id`)
- [ ] GET all: join with `citymst` to include city name
- [ ] POST: `INSERT INTO areamst (AreaName, CityName_id) VALUES (?, ?)`
- [ ] PUT: `UPDATE areamst SET AreaName = ?, CityName_id = ? WHERE id = ?`

#### Service CRUD (`GET /api/admin/services`, `POST`, `GET /:id`, `PUT /:id`)
- [ ] Same pattern as City CRUD

### ✅ Phase 2 Deliverables
- All auth endpoints working and tested (use Postman / Thunder Client)
- JWT generation and verification working
- Admin dashboard data endpoint returning correct stats
- Full City, Area, Service CRUD APIs

---

## Phase 3 — Backend: Owner & Booking APIs

### 3.1 Salon Controller (`controllers/salonController.js`)

#### `GET /api/salons`
- [ ] Public. Fetch all salons with:
  - Joined owner phone (`usermst.PhoneNumber`)
  - Joined area name (`areamst.AreaName`)
  - Joined city name (`citymst.CityName`)
  - All selected services (`selectedservicesmst` + `servicemst`)
- [ ] Optional `?area=id` query param to filter by area

#### `GET /api/salons/:id`
- [ ] Public. Fetch single salon with services list and gallery images

#### `GET /api/salons/:id/slots`
- [ ] Public. Fetch salon's `OpenTime` and `CloseTime`
- [ ] Generate hourly slots using `utils/generateSlots.js`
- [ ] Return `{ slots: [...], salon, services }`

#### `generateSlots` utility (`utils/generateSlots.js`)
```js
function generateSlots(openTime, closeTime) {
  // Parse "HH:MM:SS" strings
  // Generate 1-hour slots in "09:00 AM - 10:00 AM" format
  // Return array of slot strings
}
```

### 3.2 Owner Controller (`controllers/ownerController.js`)

#### `GET /api/owner/profile`
- [ ] Protected (`requireOwner`)
- [ ] Get owner user from DB using `id` from JWT
- [ ] Get salon owned by this user
- [ ] If no salon → return `{ needsSalon: true }`
- [ ] Get bookings for today (default) or by date from query param `?date=YYYY-MM-DD`
- [ ] Return `{ owner, salon, bookings }`

#### `POST /api/owner/salon`
- [ ] Protected (`requireOwner`) + Multer (single image)
- [ ] Save salon with `Owner_id` from JWT
- [ ] Redirect-equivalent: return salon ID

#### `PUT /api/owner/salon/:id`
- [ ] Protected (`requireOwner`) + Multer (single image)
- [ ] Validate `NumberOfSeats > 0`
- [ ] Update salon fields

#### `POST /api/owner/services`
- [ ] Protected (`requireOwner`)
- [ ] Get salon by owner's user ID
- [ ] Insert into `selectedservicesmst` with `SalonId_id = salon.id`

#### `POST /api/owner/images`
- [ ] Protected (`requireOwner`) + Multer (up to 5 images `array('images', 5)`)
- [ ] Get salon by owner's user ID
- [ ] Insert each uploaded file into `imagemst`

#### `GET /api/owner/services`
- [ ] Protected (`requireOwner`)
- [ ] Return all services from `servicemst` (for dropdown) + all `selectedservicesmst` for this salon

### 3.3 Booking Controller (`controllers/bookingController.js`)

#### `POST /api/bookings`
- [ ] Protected (`requireUser`)
- [ ] Extract: `salonId`, `serviceId`, `date`, `timeSlot` from body
- [ ] Get service price from `selectedservicesmst`
- [ ] Insert into `slotbookingmst` with `Status = 'Pending'`
- [ ] Return success message: _"Your appointment is booked. Waiting for owner confirmation."_

#### `GET /api/user/bookings`
- [ ] Protected (`requireUser`)
- [ ] Get all bookings for `UserId_id = userId` from JWT
- [ ] Join with `selectedservicesmst`, `servicemst`, `salonmst`
- [ ] Return bookings array

#### `PATCH /api/bookings/:id/cancel`
- [ ] Protected (`requireUser`)
- [ ] Fetch booking by id
- [ ] Check `Status === 'Pending'`
- [ ] Parse `TimeSlote` → extract start time → combine with `BookingDate`
- [ ] Check: `appointmentDateTime - now >= 3 hours` → else return error
- [ ] Update `Status = 'Cancelled'`
- [ ] Return success/failure message

#### `PATCH /api/bookings/:id/status`
- [ ] Protected (`requireOwner`)
- [ ] Get `status` and optional `reason` from body
- [ ] Update `slotbookingmst.Status` to `'Accepted'` or `'Rejected'`
- [ ] If Accepted: send appointment confirmation email to user
- [ ] If Rejected: send appointment rejection email with reason to user

### 3.4 User Controller (`controllers/userController.js`)

#### `GET /api/user/profile`
- [ ] Protected (`requireUser`)
- [ ] Return user from `usermst` by id from JWT

#### `PUT /api/user/profile`
- [ ] Protected (`requireUser`) + Multer (single image)
- [ ] Validate phone (10 digits)
- [ ] Update `usermst` fields: Name, UserName, Email, PhoneNumber, Img

### ✅ Phase 3 Deliverables
- All salon, owner, booking, user endpoints working
- Slot generation utility tested
- 3-hour cancellation rule working
- File upload with Multer saving to `backend/uploads/`
- All API routes tested via Postman

---

## Phase 4 — Frontend: Public Pages

> [!NOTE]
> Set up routing, auth context, and axios instance before building any page components.

### 4.1 Foundation Setup

#### Auth Context (`context/AuthContext.jsx`)
- [ ] State: `{ user, token, role }`
- [ ] On mount: read from `localStorage`
- [ ] `login(data)` → save to localStorage + state
- [ ] `logout()` → clear localStorage + state
- [ ] Export `useAuth()` custom hook

#### Axios Instance (`services/api.js`)
- [ ] `baseURL: '/api'` (uses Vite proxy)
- [ ] Request interceptor: attach `Authorization: Bearer <token>` from localStorage
- [ ] Response interceptor: on `401` → redirect to `/login`

#### App Router (`App.jsx`)
- [ ] Setup `react-router-dom` v6 routes for all pages
- [ ] `<ProtectedRoute role="user" />`, `<ProtectedRoute role="owner" />`, `<ProtectedRoute role="admin" />`

### 4.2 Landing Page (`pages/LandingPage.jsx`)
- [ ] **Navbar**: Hair Harmony brand, links to Home / About / Contact / Login / Register
- [ ] **Hero Section**: Bootstrap carousel with 3 Unsplash salon images, headline text
- [ ] **Salon Listings**: Fetch `GET /api/salons` on mount, display `<SalonCard />` grid
  - Each card: salon image, name, owner phone, services badges, "Book Appointment" button (→ `/login` if not logged in, → `/salon/:id` if logged in as user)
- [ ] **About Us Section**: static content with stats (500+ Salons, 10k+ Users, 4.8 Rating)
- [ ] **How It Works**: Search → Book → Relax steps
- [ ] **Contact Section**: static contact form (UI only)
- [ ] **Footer**: links + copyright

#### `SalonCard` Component (`components/SalonCard.jsx`)
- [ ] Props: `salon` object
- [ ] Show: image, name, phone, services badges, Book button

### 4.3 Login Page (`pages/LoginPage.jsx`)
- [ ] Form: Email, Password, Role selector (Admin / Owner / User)
- [ ] On submit: `POST /api/auth/login`
- [ ] On success: call `login(data)`, redirect based on role:
  - `admin` → `/admin/dashboard`
  - `owner` → `/owner/dashboard`
  - `user` → `/user/profile`
- [ ] Show error message from API on failure
- [ ] Link to `/register` and `/forgot-password`

### 4.4 Register Page (`pages/RegisterPage.jsx`)
- [ ] Form: Name, Username, Email, Phone, Password, UserType (Owner/User), Profile Image
- [ ] Client-side validation:
  - Phone: exactly 10 numeric digits
  - Password: min 8 chars, 1 upper, 1 lower, 1 digit, 1 special (`@$!%?&`)
- [ ] On submit: `POST /api/auth/register` with `multipart/form-data`
- [ ] On success: show "Registered successfully" message

### 4.5 Forgot Password Page (`pages/ForgotPasswordPage.jsx`)
- [ ] Form: Email input
- [ ] On submit: `POST /api/auth/forgot-password`
- [ ] Show: "If your email is registered, a reset link has been sent."

### 4.6 Reset Password Page (`pages/ResetPasswordPage.jsx`)
- [ ] Read `token` from URL param (`/reset-password/:token`)
- [ ] Form: New Password, Confirm Password
- [ ] On submit: `POST /api/auth/reset-password/:token`
- [ ] On success: redirect to `/login`

### ✅ Phase 4 Deliverables
- Landing page with live salon data from API
- Login working for all 3 roles with correct redirects
- Register form with full validation
- Forgot/reset password flow working end-to-end

---

## Phase 5 — Frontend: User Dashboard

### 5.1 User Profile Page (`pages/user/UserProfilePage.jsx`)
- [ ] Protected route (role: user)
- [ ] **Sidebar**: user avatar, name, email; links to Profile, Booking History, Change Password, Edit Profile, Logout
- [ ] **Main area**: area filter dropdown + salon grid (same `<SalonCard />`)
  - Fetch `GET /api/areas` for dropdown
  - Fetch `GET /api/salons?area=id` on filter change
  - Default: all salons

### 5.2 Salon Details Page (`pages/salon/SalonDetailsPage.jsx`)
- [ ] Protected route (role: user)
- [ ] Fetch `GET /api/salons/:id`
- [ ] Display: salon image, name, location, area, city, open/close times, type, seat count
- [ ] Services table: service name + price
- [ ] Gallery: grid of uploaded images
- [ ] **"Book Appointment"** button → navigate to `/salon/:id/book`

### 5.3 Booking Page (`pages/salon/BookingPage.jsx`)
- [ ] Protected route (role: user)
- [ ] Fetch `GET /api/salons/:id/slots` to get available time slots + services
- [ ] Form:
  - Date picker (type=date)
  - Time slot dropdown (auto-generated from API)
  - Service dropdown (from `selectedservicesmst` of this salon)
- [ ] On submit: `POST /api/bookings`
- [ ] On success: redirect to `/user/profile` with success toast

### 5.4 Booking History Page (`pages/user/BookingHistoryPage.jsx`)
- [ ] Protected route (role: user)
- [ ] Fetch `GET /api/user/bookings`
- [ ] Filter out `Status === 'Cancelled'` bookings from display (per original behavior)
- [ ] Each booking card shows: date, time slot, service, salon name, status badge, price
- [ ] **Cancel button** (only for `Status === 'Pending'`):
  - On click: `PATCH /api/bookings/:id/cancel`
  - Show success or error message (3-hour rule violation) from API

### 5.5 Edit Profile Page (`pages/user/EditProfilePage.jsx`)
- [ ] Protected route (role: user)
- [ ] Pre-fill form with current user data from `GET /api/user/profile`
- [ ] Fields: Name, Username, Email, Phone, Profile Image
- [ ] On submit: `PUT /api/user/profile` with `multipart/form-data`
- [ ] On success: redirect to `/user/profile`

### 5.6 Change Password Page (`pages/user/ChangePasswordPage.jsx`)
- [ ] Protected route (role: user)
- [ ] Form: Email, Old Password, New Password, Confirm Password
- [ ] On submit: `POST /api/auth/change-password`
- [ ] Show success or error message

### ✅ Phase 5 Deliverables
- Full user dashboard with sidebar navigation
- Salon browsing and filtering by area
- Booking creation with time slot selection
- Booking history with cancel functionality
- Profile editing working with image upload

---

## Phase 6 — Frontend: Owner Dashboard

### 6.1 Owner Dashboard Page (`pages/owner/OwnerDashboardPage.jsx`)
- [ ] Protected route (role: owner)
- [ ] On mount: fetch `GET /api/owner/profile`
  - If `needsSalon: true` → redirect to `/owner/register-salon`
- [ ] **Sidebar**: Hair Harmony logo, links to Dashboard, Services, Images, Edit Salon, Logout
- [ ] **Profile Card**: salon image, owner name, location, star rating (static 4.5)
- [ ] **Personal Info card**: email, phone
- [ ] **Salon Details card**: salon name, address (Location + AreaName), business hours
- [ ] **Bookings section**:
  - Date picker + Search button → fetches `GET /api/owner/profile?date=YYYY-MM-DD`
  - Each booking card: customer name, date, service name, price, time slot, status badge
  - Accept/Reject radio buttons + conditional reason textarea (show when "Reject" selected)
  - Submit → `PATCH /api/bookings/:id/status`
- [ ] Edit Salon Profile button → `/owner/edit-salon/:id`

### 6.2 Register Salon Page (`pages/owner/RegisterSalonPage.jsx`)
- [ ] Protected route (role: owner)
- [ ] Form: Name, Location, Area dropdown, City dropdown, Open Time, Close Time, Number of Seats, Type (Male/Female/Unisex), Salon Image
- [ ] Fetch areas and cities for dropdowns: `GET /api/admin/areas`, `GET /api/admin/cities`
- [ ] On submit: `POST /api/owner/salon` with `multipart/form-data`
- [ ] On success: redirect to `/owner/dashboard`

### 6.3 Select Services Page (`pages/owner/SelectServicesPage.jsx`)
- [ ] Protected route (role: owner)
- [ ] Fetch all services from `GET /api/admin/services` for dropdown
- [ ] Form: Service dropdown + Price input
- [ ] On submit: `POST /api/owner/services`
- [ ] Show success message; allow multiple submissions (stay on page)

### 6.4 Upload Images Page (`pages/owner/UploadImagesPage.jsx`)
- [ ] Protected route (role: owner)
- [ ] Show existing salon images from `GET /api/owner/profile`
- [ ] Multi-file input (up to 5 files)
- [ ] On submit: `POST /api/owner/images` with `multipart/form-data`
- [ ] On success: redirect to `/owner/dashboard`

### 6.5 Edit Salon Page (`pages/owner/EditSalonPage.jsx`)
- [ ] Protected route (role: owner)
- [ ] Pre-fill with current salon data
- [ ] Same form fields as Register Salon
- [ ] Validate `NumberOfSeats > 0`
- [ ] On submit: `PUT /api/owner/salon/:id`
- [ ] On success: redirect to `/owner/dashboard`

### ✅ Phase 6 Deliverables
- Owner redirected to register-salon if no salon exists
- Full owner dashboard with booking management
- Accept/Reject appointments working
- Conditional reason textarea shown only on Reject selection
- Services + images management working

---

## Phase 7 — Frontend: Admin Dashboard

### 7.1 Admin Dashboard Page (`pages/admin/AdminDashboardPage.jsx`)
- [ ] Protected route (role: admin)
- [ ] Fetch `GET /api/admin/dashboard`
- [ ] **Sidebar**: HairHarmony logo, links to Dashboard, Manage Cities, Manage Areas, Manage Services, Logout
- [ ] **Stats cards**:
  - Total Salon Requests (count of owners)
  - Active Users (total users)
  - Bookings Today
- [ ] **Salon Requests table**: Owner Name, Username, Email, Phone, Status badge
- [ ] Each row (if not verified): Verify / Reject radio buttons + reason textarea
- [ ] Submit → `PATCH /api/admin/owners/:id/status`
- [ ] Conditional reason textarea (show only when "Reject" is selected)

### 7.2 City Management (`pages/admin/CityFormPage.jsx`, `CityListPage.jsx`)
- [ ] **CityListPage**: Fetch `GET /api/admin/cities`, show table with Edit link
- [ ] **CityFormPage**:
  - Add mode (`/admin/cities/add`): empty form
  - Edit mode (`/admin/cities/edit/:id`): pre-fill from `GET /api/admin/cities/:id`
  - On submit: POST (add) or PUT (edit)
  - On success: redirect to `/admin/cities`
- [ ] Use same layout with Admin Sidebar

### 7.3 Area Management (`pages/admin/AreaFormPage.jsx`, `AreaListPage.jsx`)
- [ ] Same pattern as City Management
- [ ] Area form includes City dropdown (fetched from `GET /api/admin/cities`)

### 7.4 Service Management (`pages/admin/ServiceFormPage.jsx`, `ServiceListPage.jsx`)
- [ ] Same pattern as City Management
- [ ] No foreign keys — simple name field

### 7.5 Admin Sidebar Component (`components/AdminSidebar.jsx`)
- [ ] Reusable sidebar with dark theme (`#1a1a1a` background, gold `#d4af37` accent)
- [ ] Active state highlighting
- [ ] Responsive: hides on mobile with toggle button

### ✅ Phase 7 Deliverables
- Admin dashboard with live stats
- Owner approval/rejection with email notification trigger
- Full CRUD for Cities, Areas, Services
- Admin sidebar working responsively

---

## Phase 8 — Email & File Upload Integration

> [!IMPORTANT]
> This phase wires together Nodemailer and Multer, which are used across multiple phases.

### 8.1 Email Utility (`utils/email.js`)
Configure Nodemailer with SMTP from `.env`. Implement all 8 email functions:

| Function | Trigger |
|----------|---------|
| `sendWelcomeEmail(email, name)` | User registration |
| `sendPasswordChangedEmail(user)` | Change / reset password confirmed |
| `sendPasswordResetEmail(user, token)` | Forgot password |
| `sendSalonApprovalEmail(email, name)` | Admin approves owner |
| `sendSalonRejectionEmail(email, name, reason)` | Admin rejects owner |
| `sendAppointmentConfirmationEmail(...)` | Owner accepts booking |
| `sendAppointmentRejectionEmail(...)` | Owner rejects booking |
| `sendPasswordChangeConfirmationEmail(user)` | After reset-password completes |

- [ ] Each function uses a template string matching the original Django email content
- [ ] Test each function using actual SMTP (Gmail App Password)

### 8.2 File Upload Middleware (`middleware/upload.js`)
- [ ] Configure Multer with `diskStorage`:
  - `destination`: `backend/uploads/`
  - `filename`: `Date.now() + '-' + originalname`
- [ ] Export:
  - `uploadSingle` — for user profile image, salon cover image
  - `uploadMultiple` — for salon gallery (up to 5)
- [ ] Ensure `backend/uploads/default.jpg` exists as the fallback image

### 8.3 Static File Serving
- [ ] In `server.js`: `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`
- [ ] In React: image URLs → `http://localhost:5000/uploads/{filename}`
- [ ] Create `frontend/src/utils/imageUrl.js` helper: `getImageUrl(filename)` → full URL

### ✅ Phase 8 Deliverables
- All 8 email types sending correctly via Gmail SMTP
- Profile images uploading and displaying correctly
- Salon images (cover + gallery) uploading and displaying correctly
- Default image fallback working

---

## Phase 9 — Polish, Validation & Testing

### 9.1 Frontend Validations
- [ ] **Register**: phone (10 numeric), password pattern, duplicate check feedback
- [ ] **Salon Form**: seats > 0, time validation (OpenTime < CloseTime)
- [ ] **Booking**: date must not be in the past
- [ ] **Change Password**: old ≠ new check, new = confirm check
- [ ] Show inline error messages (not just alerts)

### 9.2 Backend Error Handling
- [ ] All controllers wrapped in try/catch
- [ ] Return consistent error format: `{ message: '...' }`
- [ ] 400 for bad input, 401 for unauthorized, 403 for forbidden, 404 for not found, 500 for server errors
- [ ] Database errors logged but not exposed to client

### 9.3 Edge Cases to Handle
- [ ] Owner tries to access dashboard without verified status → clear error
- [ ] Booking cancellation < 3 hours → user-friendly error message
- [ ] Reset password with invalid/expired token → redirect to forgot-password page
- [ ] Owner with no salon → redirect to register-salon (not crash)
- [ ] Empty booking list → "No bookings found" message
- [ ] File type validation on upload (only images: jpg, png, webp)

### 9.4 UX Improvements
- [ ] Loading spinners on all async API calls
- [ ] Toast notifications for success/error (instead of `alert()`)
- [ ] Responsive layout check: mobile sidebar toggle for user and owner dashboards
- [ ] Active link highlighting in all sidebars
- [ ] Confirm dialog before cancelling appointment

### 9.5 Testing Checklist

#### Auth Flow
- [ ] Register as User → login → access user dashboard
- [ ] Register as Owner → cannot login (pending) → admin verifies → can login
- [ ] Admin login with hardcoded credentials
- [ ] Forgot password → email received → reset link works → can login with new password

#### User Flow
- [ ] Browse salons on landing page
- [ ] Filter by area (user dashboard)
- [ ] View salon details and gallery
- [ ] Book appointment → appears in booking history
- [ ] Cancel appointment (>3h) → success
- [ ] Try cancel (<3h) → error message

#### Owner Flow
- [ ] Login → redirected to register salon (first time)
- [ ] Register salon → redirected to dashboard
- [ ] Add services + upload images
- [ ] View bookings by date
- [ ] Accept/Reject appointment → email sent to user

#### Admin Flow
- [ ] View dashboard stats
- [ ] Approve owner → email sent → owner can login
- [ ] Reject owner with reason → email sent
- [ ] Add/Edit cities, areas, services

### ✅ Phase 9 Deliverables
- All edge cases handled gracefully
- Consistent error messages throughout
- Full manual test pass for all 3 user roles

---

## Phase 10 — Final Review & Deployment Prep

### 10.1 Code Cleanup
- [ ] Remove all `console.log` debug statements from backend
- [ ] Remove unused imports and components
- [ ] Consistent code formatting (Prettier / ESLint)

### 10.2 Environment Configuration
- [ ] Backend `.env` has all required variables (see spec Section 10)
- [ ] Frontend `vite.config.js` proxy configured correctly
- [ ] `backend/uploads/` has `.gitkeep` and `default.jpg`
- [ ] Add both `.env` files to `.gitignore`

### 10.3 README.md
- [ ] Write `README.md` at project root with:
  - Project description
  - Tech stack
  - Prerequisites (Node.js, MySQL, npm)
  - Setup instructions (clone, install, env, DB, run)
  - Default admin credentials
  - Folder structure overview

### 10.4 Final Smoke Test
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open `http://localhost:5173` — landing page loads with salons
- [ ] Login as admin, user, owner — all redirect correctly
- [ ] One complete booking flow from end to end

### ✅ Phase 10 Deliverables
- Clean, production-ready codebase
- README with setup instructions
- All three roles tested in one final pass
- Original Django project untouched at reference location

---

## Summary Checklist

```
Phase 1  [x] Project Setup & Database
Phase 2  [ ] Backend: Auth & Core APIs
Phase 3  [ ] Backend: Owner & Booking APIs
Phase 4  [ ] Frontend: Public Pages
Phase 5  [ ] Frontend: User Dashboard
Phase 6  [ ] Frontend: Owner Dashboard
Phase 7  [ ] Frontend: Admin Dashboard
Phase 8  [ ] Email & File Upload Integration
Phase 9  [ ] Polish, Validation & Testing
Phase 10 [ ] Final Review & Deployment Prep
```

---

## Dependencies Reference

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5",
    "mysql2": "^3.0.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

---

> [!NOTE]
> The original Django project at `C:\Users\HET VARIA\Downloads\SalonProject-main\SalonProject-main\` must remain **untouched** throughout all phases. Refer to it only for business logic verification.
