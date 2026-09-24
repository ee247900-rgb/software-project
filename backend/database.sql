-- Staff Scheduling & Shift Management System Database Schema
-- Database: staff_schedule_db

CREATE DATABASE IF NOT EXISTS staff_schedule_db;
USE staff_schedule_db;

-- 1. ADMIN TABLE
CREATE TABLE IF NOT EXISTS ADMIN (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STAFF TABLE
CREATE TABLE IF NOT EXISTS STAFF (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL DEFAULT '$2a$10$wQ9n.X7d16H0L4kF7jTzduuW5y4qO5V4P5.F5t.L5X5.P5.P5.P5.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SHIFT TABLE
CREATE TABLE IF NOT EXISTS SHIFT (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    shift_type VARCHAR(50) NOT NULL, -- Morning, Afternoon, Evening, Night
    start_time TIME NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. STAFF_SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS STAFF_SCHEDULE (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    shift_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Assigned', -- Assigned, Completed, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES SHIFT(shift_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_shift_date (staff_id, date)
);

-- 5. LEAVE_REQUEST TABLE
CREATE TABLE IF NOT EXISTS LEAVE_REQUEST (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE
);

-- 6. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS ATTENDANCE (
    attend_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_attendance_date (staff_id, date)
);
