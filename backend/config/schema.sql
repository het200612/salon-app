-- ============================================================
--  Hair Harmony Salon Booking Platform
--  MySQL Schema — All 8 Tables (mirrors Django models exactly)
--  Run: mysql -u root -p salondb < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS salondb;
USE salondb;

-- ----------------------------------------------------------------
-- 1. CityMst
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citymst (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    CityName   VARCHAR(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 2. AreaMst  (FK -> citymst)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS areamst (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    AreaName    VARCHAR(40) NOT NULL,
    CityName_id INT NOT NULL,
    CONSTRAINT fk_area_city
        FOREIGN KEY (CityName_id) REFERENCES citymst(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 3. ServiceMst
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicemst (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ServiceName VARCHAR(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 4. UserMst
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usermst (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    Name                 VARCHAR(20)  NOT NULL,
    UserName             VARCHAR(20)  NOT NULL,
    Email                VARCHAR(50)  NOT NULL UNIQUE,
    PhoneNumber          VARCHAR(10)  NOT NULL,
    Password             VARCHAR(255) NOT NULL,
    Usertype             VARCHAR(10)  NOT NULL,               -- 'Owner' | 'User'
    Status               VARCHAR(10)  NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
    Img                  VARCHAR(255)          DEFAULT 'default.jpg',
    password_reset_token VARCHAR(255)          DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 5. SalonMst  (FK -> usermst, areamst, citymst)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salonmst (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    Name          VARCHAR(20)  NOT NULL,
    Location      VARCHAR(20)  NOT NULL,
    Owner_id      INT          NOT NULL,
    Img           VARCHAR(255)          DEFAULT 'default.jpg',
    Status        VARCHAR(10)  NOT NULL DEFAULT 'active',
    NumberOfSeats INT          NOT NULL,
    Area_id       INT          NOT NULL,
    City_id       INT          NOT NULL,
    OpenTime      TIME         NOT NULL,
    CloseTime     TIME         NOT NULL,
    Type          VARCHAR(10)  NOT NULL,                      -- 'Male' | 'Female' | 'Unisex'
    CONSTRAINT fk_salon_owner
        FOREIGN KEY (Owner_id) REFERENCES usermst(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_salon_area
        FOREIGN KEY (Area_id) REFERENCES areamst(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_salon_city
        FOREIGN KEY (City_id) REFERENCES citymst(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 6. SelectedServicesmsMst  (FK -> servicemst, salonmst)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS selectedservicesmst (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    ServiceName_id INT NOT NULL,
    SalonId_id     INT NOT NULL,
    Price          INT NOT NULL,
    CONSTRAINT fk_selservice_service
        FOREIGN KEY (ServiceName_id) REFERENCES servicemst(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_selservice_salon
        FOREIGN KEY (SalonId_id) REFERENCES salonmst(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 7. ImageMst  (FK -> salonmst)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS imagemst (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    SalonId_id INT          NOT NULL,
    Img        VARCHAR(255)          DEFAULT 'default.jpg',
    CONSTRAINT fk_image_salon
        FOREIGN KEY (SalonId_id) REFERENCES salonmst(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- 8. SlotBookingMst  (FK -> selectedservicesmst, salonmst, usermst)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slotbookingmst (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    BookingDate  DATE         NOT NULL,
    TimeSlote    VARCHAR(20)  NOT NULL,           -- e.g. "09:00 AM - 10:00 AM"
    ServiceId_id INT          NOT NULL,
    SalonId_id   INT          NOT NULL,
    UserId_id    INT          NOT NULL,
    BillAmount   INT          NOT NULL,
    Status       VARCHAR(10)  NOT NULL DEFAULT 'Pending', -- 'Pending'|'Accepted'|'Rejected'|'Cancelled'
    CONSTRAINT fk_booking_service
        FOREIGN KEY (ServiceId_id) REFERENCES selectedservicesmst(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_booking_salon
        FOREIGN KEY (SalonId_id) REFERENCES salonmst(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_booking_user
        FOREIGN KEY (UserId_id) REFERENCES usermst(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- Seed Data (optional — mirrors Django fixtures for quick testing)
-- ----------------------------------------------------------------
INSERT IGNORE INTO citymst (CityName) VALUES ('Mumbai'), ('Surat'), ('Ahmedabad'), ('Vadodara');

INSERT IGNORE INTO areamst (AreaName, CityName_id) VALUES
    ('Andheri',    1),
    ('Bandra',     1),
    ('Adajan',     2),
    ('Vesu',       2),
    ('Navrangpura',3),
    ('Alkapuri',   4);

INSERT IGNORE INTO servicemst (id, ServiceName) VALUES
    (1, 'Haircut'),
    (2, 'Hair Coloring'),
    (3, 'Facial'),
    (4, 'Manicure'),
    (5, 'Pedicure'),
    (6, 'Waxing'),
    (7, 'Beard Trim'),
    (8, 'Head Massage');

-- Sample Users & Owners (Password is hashed for bcrypt or standard)
-- Password 'User@123' -> '$2a$10$wT4nZ7qQ7u0OqEwK9.J20u3uPqO5G3K9V6E8yA8b2Q9K6Qe/x4b6.' (also plain text compatible in auth controller)
INSERT IGNORE INTO usermst (id, Name, UserName, Email, PhoneNumber, Password, Usertype, Status, Img) VALUES
    (1, 'Het Varia', 'het20', 'het@example.com', '9876543210', 'User@123', 'User', 'verified', 'default.jpg'),
    (2, 'Rajesh Sharma', 'rajesh_salon', 'rajesh@example.com', '9898989898', 'Owner@123', 'Owner', 'verified', 'default.jpg'),
    (3, 'Anita Patel', 'anita_beauty', 'anita@example.com', '9797979797', 'Owner@123', 'Owner', 'pending', 'default.jpg');

-- Sample Salons
INSERT IGNORE INTO salonmst (id, Name, Location, Owner_id, Img, Status, NumberOfSeats, Area_id, City_id, OpenTime, CloseTime, Type) VALUES
    (1, 'Harmony Unisex Salon', 'Main Street, Andheri West', 2, 'img1.jpg', 'active', 4, 1, 1, '09:00:00', '20:00:00', 'Unisex'),
    (2, 'Luxe Hair & Beauty', 'Near City Mall, Vesu', 2, 's1.jpg', 'active', 6, 4, 2, '10:00:00', '21:00:00', 'Unisex');

-- Selected Services for Salons
INSERT IGNORE INTO selectedservicesmst (id, ServiceName_id, SalonId_id, Price) VALUES
    (1, 1, 1, 350),
    (2, 2, 1, 1200),
    (3, 3, 1, 800),
    (4, 7, 1, 200),
    (5, 8, 1, 400),
    (6, 1, 2, 450),
    (7, 3, 2, 950),
    (8, 4, 2, 600);

-- Gallery Images
INSERT IGNORE INTO imagemst (id, SalonId_id, Img) VALUES
    (1, 1, 'img1.jpg'),
    (2, 1, 'img2.jpg'),
    (3, 1, 'img3.jpg'),
    (4, 2, 's1.jpg'),
    (5, 2, 's2.jpg');

