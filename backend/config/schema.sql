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

INSERT IGNORE INTO servicemst (ServiceName) VALUES
    ('Haircut'),
    ('Hair Coloring'),
    ('Facial'),
    ('Manicure'),
    ('Pedicure'),
    ('Waxing'),
    ('Beard Trim'),
    ('Head Massage');
