# PROJECT_SPECIFICATION.md
# Hair Harmony – Salon Booking Platform
## Migration: Django + MySQL → React.js (Vite) + Node.js (Express) + MySQL

---

## 1. Application Overview

**Hair Harmony** is a multi-role salon appointment booking platform that allows users to discover salons, book appointments, and manage their profiles. Salon owners can register and manage their salon, services, and appointments. An admin supervises all owner registrations, cities, areas, and services.

**App Name:** Hair Harmony  
**Original Stack:** Django 5.1 + MySQL  
**Target Stack:** React.js (Vite) + Node.js (Express.js) + MySQL  
**Email Service:** SMTP (Gmail) via Nodemailer (replaces Django's send_mail)

---

## 2. User Roles

| Role   | Login Credentials (Original)          | Access                          |
|--------|---------------------------------------|---------------------------------|
| Admin  | email: `admin@gmail.com`, pw: `Admin` | Full admin dashboard            |
| Owner  | Email + Password (Status = verified)  | Salon management dashboard      |
| User   | Email + Password                      | Browse salons, book appointments|

> **Business Rule:** Owners cannot log in until Admin sets their Status to `"verified"`.

---

## 3. Database Models (Django → MySQL Tables)

### 3.1 `CityMst`
| Field      | Type         | Notes             |
|------------|--------------|-------------------|
| id         | INT (PK, AI) |                   |
| CityName   | VARCHAR(30)  | Ordered by name   |

### 3.2 `AreaMst`
| Field    | Type         | Notes                         |
|----------|--------------|-------------------------------|
| id       | INT (PK, AI) |                               |
| AreaName | VARCHAR(40)  |                               |
| CityName | INT (FK)     | References CityMst.id (CASCADE)|

### 3.3 `ServiceMst`
| Field       | Type         | Notes |
|-------------|--------------|-------|
| id          | INT (PK, AI) |       |
| ServiceName | VARCHAR(30)  |       |

### 3.4 `UserMst`
| Field                | Type          | Notes                                |
|----------------------|---------------|--------------------------------------|
| id                   | INT (PK, AI)  |                                      |
| Name                 | VARCHAR(20)   |                                      |
| UserName             | VARCHAR(20)   |                                      |
| Email                | VARCHAR(50)   | Unique                               |
| PhoneNumber          | VARCHAR(10)   |                                      |
| Password             | VARCHAR(20)   | Stored plain text in original        |
| Usertype             | VARCHAR(10)   | `'Owner'` or `'User'`                |
| Status               | VARCHAR(10)   | `'verified'` or `'pending'`          |
| Img                  | VARCHAR(255)  | File path; default `'default.jpg'`   |
| password_reset_token | VARCHAR(255)  | Nullable; used for forgot-password   |

### 3.5 `SalonMst`
| Field         | Type         | Notes                                  |
|---------------|--------------|----------------------------------------|
| id            | INT (PK, AI) |                                        |
| Name          | VARCHAR(20)  |                                        |
| Location      | VARCHAR(20)  |                                        |
| Owner         | INT (FK)     | References UserMst.id (CASCADE)        |
| Img           | VARCHAR(255) | File path; default `'default.jpg'`     |
| Status        | VARCHAR(10)  |                                        |
| NumberOfSeats | INT          |                                        |
| Area          | INT (FK)     | References AreaMst.id (CASCADE)        |
| City          | INT (FK)     | References CityMst.id (CASCADE)        |
| OpenTime      | TIME         |                                        |
| CloseTime     | TIME         |                                        |
| Type          | VARCHAR(10)  | `'Male'`, `'Female'`, or `'Unisex'`   |

### 3.6 `SelectedServicemsMst`
| Field       | Type         | Notes                                        |
|-------------|--------------|----------------------------------------------|
| id          | INT (PK, AI) |                                              |
| ServiceName | INT (FK)     | References ServiceMst.id (CASCADE)           |
| SalonId     | INT (FK)     | References SalonMst.id (CASCADE)             |
| Price       | INT          |                                              |

### 3.7 `ImageMst`
| Field   | Type         | Notes                                   |
|---------|--------------|-----------------------------------------|
| id      | INT (PK, AI) |                                         |
| SalonId | INT (FK)     | References SalonMst.id (CASCADE)        |
| Img     | VARCHAR(255) | File path; default `'default.jpg'`      |

### 3.8 `SlotBookingMst`
| Field       | Type         | Notes                                           |
|-------------|--------------|-------------------------------------------------|
| id          | INT (PK, AI) |                                                 |
| BookingDate | DATE         |                                                 |
| TimeSlote   | VARCHAR(20)  | e.g. `"09:00 AM - 10:00 AM"`                   |
| ServiceId   | INT (FK)     | References SelectedServicemsMst.id (CASCADE)    |
| SalonId     | INT (FK)     | References SalonMst.id (CASCADE)                |
| UserId      | INT (FK)     | References UserMst.id (CASCADE)                 |
| BillAmount  | INT          |                                                 |
| Status      | VARCHAR(10)  | Default `'Pending'`; also `'Accepted'`,`'Rejected'`,`'Cancelled'`|

---

## 4. Pages & Features Inventory

### 4.1 Public Pages (No Login Required)
| Page         | Django Template   | Description                                    |
|--------------|-------------------|------------------------------------------------|
| Landing Page | `index.html`      | Hero carousel, salon listings (all salons with services), About Us, How It Works, Contact, Footer. Links to Login & Register. |
| Login        | `Login.html`      | Form with email, password, role selector (Admin/Owner/User). |
| Register     | `UserForm.html`   | New user registration (Name, Username, Email, Phone, Password, UserType=Owner or User, Profile Image). Sends welcome email on success. |
| Forgot Password | `ForgetEmailForm.html` | Enter email to receive password reset link via email. |
| Reset Password  | `Forgetpass.html` | Enter new password + confirm using token from email link. Sends confirmation email. |

### 4.2 User Pages (Logged-in as User)
| Page              | Django Template             | Description                                                    |
|-------------------|-----------------------------|----------------------------------------------------------------|
| User Profile      | `User/UserProfile.html`     | Sidebar layout. Shows all salons with filter by area. Links to Salon Details. |
| Salon Details     | `SalonDetails.html`         | Salon name, location, services+prices, gallery images. Button to Show Slots. |
| Slot Selection    | `SlotSelection.html` / `BookingForm.html` | Auto-generated hourly time slots between salon open/close time. Select service, date, time slot to book. |
| Booking History   | `User/BookingHistory.html`  | List of all non-cancelled bookings. Each shows date, time, service, salon, status, price. Cancel button (only for Pending; blocked if < 3 hrs). |
| Edit Profile      | `User/EditProfile.html`     | Edit Name, Username, Email, Phone, Profile Image.              |
| Change Password   | `User/ChangePassword.html`  | Enter email + old password + new password + confirm. Sends email on success. |

### 4.3 Owner Pages (Logged-in as Owner, Status = verified)
| Page                | Django Template               | Description                                                       |
|---------------------|-------------------------------|-------------------------------------------------------------------|
| Owner Profile       | `owner/OwnerProfile.html`     | Shows salon image, owner info, salon details. Date picker to filter bookings. List of bookings with Accept/Reject (with rejection reason textarea). Edit Salon Profile button. |
| Register Salon      | `owner/SalonForm.html`        | If owner has no salon yet, redirect here first. Form: Name, Location, Area, City, OpenTime, CloseTime, NumberOfSeats, Type, Img. |
| Select Services     | `owner/SelectServices.html`   | Add services (from ServiceMst dropdown) with price to their salon. Multiple submissions allowed. |
| Upload Images       | `owner/UploadImg.html`        | Upload up to 5 images for the salon (ImageMst). Shows existing images. |
| Edit Salon          | `owner/Editsalon.html`        | Edit all salon fields (Name, Location, Img, NumberOfSeats, Area, City, OpenTime, CloseTime, Type). |
| Salon Owner Dashboard | `owner/SalonOwnerDashboard.html` | Sidebar navigation for owner section.                          |

### 4.4 Admin Pages (Logged-in as Admin)
| Page             | Django Template              | Description                                                    |
|------------------|------------------------------|----------------------------------------------------------------|
| Admin Dashboard  | `admin/AdminDashboard.html`  | Stats cards (Total Salon Requests, Active Users, Bookings Today). Table of all Owners with Verify/Reject action (rejection requires reason). Sidebar: Dashboard, Manage Cities, Manage Areas, Manage Salon Services. |
| City Management  | `admin/CityForm.html`        | Add new city or edit existing (by id).                        |
| City List        | `admin/CityList.html`        | List all cities with edit links.                              |
| Area Management  | `admin/AreaForm.html`        | Add new area or edit existing (by id). City dropdown.        |
| Area List        | `admin/AreaList.html`        | List all areas with edit links.                              |
| Service Management | `admin/Service.html`       | Add new service or edit existing (by id).                    |
| Service List     | `admin/ServiceList.html`     | List all services with edit links.                           |

---

## 5. Business Logic

### 5.1 Authentication
- **Session-based** in Django; will become **JWT-based** in Node.js.
- Three session keys used: `admin`, `user`, `owner`.
- Admin is hardcoded: `admin@gmail.com` / `Admin` (no DB entry).
- User login: match Email + Password in UserMst with Usertype in context.
- Owner login: Email + Password match AND Status must be `"verified"`.
- Logout clears respective session key.

### 5.2 Slot Generation Logic
```
generate_slots(openTime, closeTime):
  slots = []
  current = openTime
  while current < closeTime:
    slot = f"{current:12hr} - {current+1hr:12hr}"
    slots.append(slot)
    current += 1 hour
  return slots
```
Input format: `HH:MM:SS` (24h). Output format: `"09:00 AM - 10:00 AM"`.

### 5.3 Appointment Cancellation Rule
- Users can only cancel appointments with Status = `"Pending"`.
- Cancellation is **blocked** if the appointment time is **less than 3 hours away** from the current time.
- Time slot format: `"09:00 AM - 10:00 AM"` → parse start time from first part.

### 5.4 Appointment Status Flow
```
Pending → Accepted (by Owner, sends confirmation email to user)
Pending → Rejected (by Owner, with reason, sends rejection email to user)
Pending → Cancelled (by User, subject to 3-hr rule)
```

### 5.5 Salon Owner Registration Flow
1. User registers with Usertype = `"Owner"`.
2. Registration appears in Admin Dashboard as a pending owner request.
3. Admin verifies or rejects:
   - Verify: Status = `"verified"`, sends approval email to owner.
   - Reject: Status = `"rejected"`, sends rejection email with reason.
4. Verified owner logs in → if no salon exists → redirect to `SalonTrans` (Register Salon).
5. Owner sets up services → selects from ServiceMst + assigns price.
6. Owner uploads images (up to 5).

### 5.6 Password Reset Flow
1. User submits email on Forgot Password page.
2. System generates a 50-char random token, stores in `UserMst.password_reset_token`.
3. Sends HTML email with reset link: `http://localhost:3000/reset_password/{token}`.
4. User clicks link → enters new password + confirm.
5. If match: update Password, clear token, send confirmation email.

### 5.7 Validations
- Phone: exactly 10 digits, numeric only.
- Password (registration): min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char (`@$!%?&`).
- NumberOfSeats: must be > 0.
- Booking date: future dates only (implied).
- Change Password: old password must match, new must equal confirm.

---

## 6. Email Notifications

| Trigger                     | Recipient | Subject / Content                        |
|-----------------------------|-----------|------------------------------------------|
| New user registration       | User      | Welcome to Hair Harmony                  |
| Password changed            | User      | Password changed confirmation            |
| Forgot password             | User      | HTML email with reset link               |
| Reset password complete     | User      | Password has been changed confirmation   |
| Salon owner approved        | Owner     | Salon Registration Approved              |
| Salon owner rejected        | Owner     | Salon Registration Declined + reason     |
| Appointment accepted        | User      | Appointment confirmation with bill       |
| Appointment rejected        | User      | Appointment declined with owner's reason |

---

## 7. File Uploads

| Context        | Field in Model | Storage Path (Django)       |
|----------------|----------------|-----------------------------|
| User profile   | UserMst.Img    | `Design/images/`            |
| Salon cover    | SalonMst.Img   | `Design/images/`            |
| Salon gallery  | ImageMst.Img   | `Design/images/`            |

In Node.js: use **Multer** for file upload middleware. Serve static files from `backend/uploads/`.

---

## 8. Migration Mapping

### 8.1 Django Templates → React Components/Pages

| Django Template                     | React Route & Component                        |
|-------------------------------------|------------------------------------------------|
| `index.html`                        | `/` → `<LandingPage />`                        |
| `Login.html`                        | `/login` → `<LoginPage />`                     |
| `UserForm.html`                     | `/register` → `<RegisterPage />`               |
| `ForgetEmailForm.html`              | `/forgot-password` → `<ForgotPasswordPage />`  |
| `Forgetpass.html`                   | `/reset-password/:token` → `<ResetPasswordPage />` |
| `User/UserProfile.html`             | `/user/profile` → `<UserProfilePage />`        |
| `SalonDetails.html`                 | `/salon/:id` → `<SalonDetailsPage />`          |
| `BookingForm.html`                  | `/salon/:id/book` → `<BookingPage />`          |
| `User/BookingHistory.html`          | `/user/bookings` → `<BookingHistoryPage />`    |
| `User/EditProfile.html`             | `/user/edit-profile` → `<EditProfilePage />`   |
| `User/ChangePassword.html`          | `/user/change-password` → `<ChangePasswordPage />` |
| `owner/OwnerProfile.html`           | `/owner/dashboard` → `<OwnerDashboardPage />`  |
| `owner/SalonForm.html`              | `/owner/register-salon` → `<RegisterSalonPage />` |
| `owner/SelectServices.html`         | `/owner/services` → `<SelectServicesPage />`   |
| `owner/UploadImg.html`              | `/owner/images` → `<UploadImagesPage />`       |
| `owner/Editsalon.html`              | `/owner/edit-salon/:id` → `<EditSalonPage />`  |
| `admin/AdminDashboard.html`         | `/admin/dashboard` → `<AdminDashboardPage />`  |
| `admin/CityForm.html`               | `/admin/cities/add`, `/admin/cities/edit/:id`  |
| `admin/CityList.html`               | `/admin/cities` → `<CityListPage />`           |
| `admin/AreaForm.html`               | `/admin/areas/add`, `/admin/areas/edit/:id`    |
| `admin/AreaList.html`               | `/admin/areas` → `<AreaListPage />`            |
| `admin/Service.html`                | `/admin/services/add`, `/admin/services/edit/:id` |
| `admin/ServiceList.html`            | `/admin/services` → `<ServiceListPage />`      |

### 8.2 Django Views/URLs → Node.js/Express API Endpoints

#### Auth
| Django URL                        | Method | Express Route                        | Description                     |
|-----------------------------------|--------|--------------------------------------|---------------------------------|
| `Login`                           | POST   | `POST /api/auth/login`               | Login for all roles             |
| `Logout`                          | GET    | `POST /api/auth/logout`              | Invalidate JWT                  |
| `UserTrans`                       | POST   | `POST /api/auth/register`            | Register new user/owner         |
| `ForgetPassword`                  | POST   | `POST /api/auth/forgot-password`     | Send reset link email           |
| `reset_password/<str:token>`      | GET/POST| `POST /api/auth/reset-password/:token` | Reset password with token    |
| `ChangePassword`                  | GET    | (frontend route only)                | Page render                     |
| `HandleChangePassword`            | POST   | `POST /api/auth/change-password`     | Change password                 |

#### Admin
| Django URL                       | Method | Express Route                            | Description                    |
|----------------------------------|--------|------------------------------------------|--------------------------------|
| `AdminDashboard`                 | GET    | `GET /api/admin/dashboard`               | Stats + owner requests         |
| `UpdateSalonStatus/<int:id>`     | POST   | `PATCH /api/admin/owners/:id/status`     | Verify or reject owner         |
| `CityTrans`                      | GET    | `GET /api/admin/cities/form`             | (data for city form)           |
| `CityTrans`                      | POST   | `POST /api/admin/cities`                 | Add new city                   |
| `CityTrans/<int:id>`             | GET    | `GET /api/admin/cities/:id`              | Get city for edit              |
| `CityTrans/<int:id>`             | POST   | `PUT /api/admin/cities/:id`              | Update city                    |
| `CityList`                       | GET    | `GET /api/admin/cities`                  | List all cities                |
| `AreaTrans`                      | POST   | `POST /api/admin/areas`                  | Add new area                   |
| `AreaTrans/<int:id>`             | POST   | `PUT /api/admin/areas/:id`               | Update area                    |
| `AreaList`                       | GET    | `GET /api/admin/areas`                   | List all areas                 |
| `ServiceTrans`                   | POST   | `POST /api/admin/services`               | Add new service                |
| `ServiceTrans/<int:id>`          | POST   | `PUT /api/admin/services/:id`            | Update service                 |
| `ServiceList`                    | GET    | `GET /api/admin/services`                | List all services              |

#### User
| Django URL                         | Method | Express Route                              | Description                     |
|------------------------------------|--------|--------------------------------------------|---------------------------------|
| `UserProfile`                      | GET    | `GET /api/user/profile`                    | User info + all salons          |
| `Editprofile`                      | GET/POST| `GET /api/user/profile` + `PUT /api/user/profile` | Edit user profile       |
| `BookingHistory`                   | GET    | `GET /api/user/bookings`                   | All user bookings               |
| `BookinTransaction/<int:id>`       | POST   | `POST /api/bookings`                       | Create new booking              |
| `BookingHistory/<int:id>` (cancel) | POST   | `PATCH /api/bookings/:id/cancel`           | Cancel appointment              |
| `SalonDetails/<int:id>`            | GET    | `GET /api/salons/:id`                      | Salon details + services + images|
| `ShowSlots/<int:id>`               | GET    | `GET /api/salons/:id/slots`                | Generated time slots            |

#### Owner
| Django URL                         | Method | Express Route                              | Description                     |
|------------------------------------|--------|--------------------------------------------|---------------------------------|
| `OwnerProfile`                     | GET/POST| `GET /api/owner/profile`                  | Owner info, salon, bookings     |
| `SalonTrans`                       | POST   | `POST /api/owner/salon`                    | Register salon                  |
| `SelectServices`                   | POST   | `POST /api/owner/services`                 | Add service to salon            |
| `upload_images`                    | GET/POST| `POST /api/owner/images`                  | Upload salon images             |
| `Editsalon/<int:salon_id>`         | GET/POST| `PUT /api/owner/salon/:id`                | Edit salon                      |
| `accept_appointment/<int:id>`      | POST   | `PATCH /api/bookings/:id/status`           | Accept/Reject appointment       |

#### Public
| Django URL         | Method | Express Route          | Description               |
|--------------------|--------|------------------------|---------------------------|
| `` (IndexView)     | GET    | `GET /api/salons`      | All salons with services  |
| `` (IndexView)     | POST   | `GET /api/salons?area=` | Filter salons by area    |
| AreaMst (for dropdown) | GET | `GET /api/areas`      | All areas                 |

### 8.3 Django Models → Node.js/MySQL

All 8 Django models map 1:1 to MySQL tables. In Node.js, use **mysql2** or **Sequelize** ORM.

| Django Model          | Node.js Model File          | MySQL Table               |
|-----------------------|-----------------------------|---------------------------|
| `CityMst`             | `models/City.js`            | `citymst`                 |
| `AreaMst`             | `models/Area.js`            | `areamst`                 |
| `ServiceMst`          | `models/Service.js`         | `servicemst`              |
| `UserMst`             | `models/User.js`            | `usermst`                 |
| `SalonMst`            | `models/Salon.js`           | `salonmst`                |
| `SelectedServicemsMst`| `models/SelectedService.js` | `selectedservicesmst`     |
| `ImageMst`            | `models/Image.js`           | `imagemst`                |
| `SlotBookingMst`      | `models/SlotBooking.js`     | `slotbookingmst`          |

### 8.4 Django Authentication → Node.js Authentication

| Django Mechanism         | Node.js Replacement                               |
|--------------------------|---------------------------------------------------|
| `request.session['admin']` | JWT token with `role: 'admin'` claim            |
| `request.session['user']`  | JWT token with `role: 'user'` claim             |
| `request.session['owner']` | JWT token with `role: 'owner'` claim            |
| `request.session.has_key()` | `authMiddleware` that verifies JWT             |
| `redirect('Login')`       | 401 response → React redirects to `/login`       |
| Admin hardcoded           | Hardcoded check in login route: `admin@gmail.com`|
| Django `send_mail`        | **Nodemailer** with SMTP/Gmail                    |
| Password reset token      | `crypto.randomBytes(25).toString('hex')` (50 chars)|

---

## 9. Project Directory Structure (Target)

```
wad-project/
├── PROJECT_SPECIFICATION.md       ← This file
├── frontend/                      ← React.js + Vite
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/            ← Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SalonCard.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── user/
│   │   │   │   ├── UserProfilePage.jsx
│   │   │   │   ├── BookingHistoryPage.jsx
│   │   │   │   ├── EditProfilePage.jsx
│   │   │   │   └── ChangePasswordPage.jsx
│   │   │   ├── salon/
│   │   │   │   ├── SalonDetailsPage.jsx
│   │   │   │   └── BookingPage.jsx
│   │   │   ├── owner/
│   │   │   │   ├── OwnerDashboardPage.jsx
│   │   │   │   ├── RegisterSalonPage.jsx
│   │   │   │   ├── SelectServicesPage.jsx
│   │   │   │   ├── UploadImagesPage.jsx
│   │   │   │   └── EditSalonPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboardPage.jsx
│   │   │       ├── CityFormPage.jsx
│   │   │       ├── CityListPage.jsx
│   │   │       ├── AreaFormPage.jsx
│   │   │       ├── AreaListPage.jsx
│   │   │       ├── ServiceFormPage.jsx
│   │   │       └── ServiceListPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← JWT storage, user state
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js             ← Axios instance + all API calls
│   │   ├── utils/
│   │   │   └── generateSlots.js   ← Slot generation logic (port from Django)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                       ← Node.js + Express.js
    ├── config/
    │   └── db.js                  ← MySQL connection (mysql2)
    ├── controllers/
    │   ├── authController.js
    │   ├── adminController.js
    │   ├── userController.js
    │   ├── ownerController.js
    │   ├── salonController.js
    │   └── bookingController.js
    ├── middleware/
    │   ├── authMiddleware.js      ← JWT verification + role check
    │   └── upload.js             ← Multer config for file uploads
    ├── models/
    │   ├── City.js
    │   ├── Area.js
    │   ├── Service.js
    │   ├── User.js
    │   ├── Salon.js
    │   ├── SelectedService.js
    │   ├── Image.js
    │   └── SlotBooking.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── adminRoutes.js
    │   ├── userRoutes.js
    │   ├── ownerRoutes.js
    │   └── salonRoutes.js
    ├── utils/
    │   ├── email.js              ← Nodemailer email templates
    │   └── generateSlots.js     ← Slot generation utility
    ├── uploads/                  ← Served as static; stores uploaded images
    ├── .env                      ← DB creds, JWT secret, email config
    ├── server.js                 ← Express app entry point
    └── package.json
```

---

## 10. Environment Variables (`.env` for backend)

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salondb
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

CLIENT_URL=http://localhost:5173
```

---

## 11. Key Implementation Notes

1. **JWT tokens** should be stored in `localStorage` (or `httpOnly` cookies for better security) and sent as `Authorization: Bearer <token>` headers.
2. **Role-based routing** in React: use `<ProtectedRoute>` components that check the decoded JWT role.
3. **Slot generation**: the `generateSlots(openTime, closeTime)` function must be replicated in both backend (for API response) and frontend (for display).
4. **File uploads**: Multer middleware saves files to `backend/uploads/`. The Express server should serve `/uploads` as static so React can display images.
5. **CORS**: Configure `cors` middleware on Express to allow requests from `http://localhost:5173` (Vite dev server).
6. **Password hashing**: The original stores passwords in plain text. For the new system, use **bcrypt** for hashing passwords, but ensure backward compatibility considerations if migrating existing data.
7. **Admin hardcoding**: Admin login (`admin@gmail.com` / `Admin`) should remain hardcoded in the auth controller.
8. **Booking cancellation**: The 3-hour rule requires the server to parse the time slot string and compare with `Date.now()`.
9. **Image default**: If no image is uploaded, serve `default.jpg` from the uploads folder.
10. **Axios base URL**: Set `baseURL: 'http://localhost:5000'` in the Axios instance (`frontend/src/services/api.js`).

---

## 12. Original Django Project Reference

The original Django project is located (unmodified) at:
```
C:\Users\HET VARIA\Downloads\SalonProject-main\SalonProject-main\
```
Do NOT modify any files in that directory. Use it only as a reference for business logic, models, templates, and views.
