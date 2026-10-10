-- ==============================================================
-- Medicine Reminder System Database Schema (MySQL)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `mediminder_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `mediminder_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `timezone` VARCHAR(64) NOT NULL DEFAULT 'UTC',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Medicines Table
CREATE TABLE IF NOT EXISTS `medicines` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `medicine_name` VARCHAR(150) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `instructions` TEXT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `frequency` ENUM('daily', 'specific_days') NOT NULL DEFAULT 'daily',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_medicines_user_id` (`user_id`),
  INDEX `idx_medicines_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Medicine Reminder Times Table
-- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
-- If frequency is 'daily', day_of_week can be NULL or 0-6.
CREATE TABLE IF NOT EXISTS `medicine_reminder_times` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `medicine_id` INT UNSIGNED NOT NULL,
  `reminder_time` TIME NOT NULL,
  `day_of_week` TINYINT NULL COMMENT '0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat. NULL for every day',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  INDEX `idx_reminder_times_medicine` (`medicine_id`),
  INDEX `idx_reminder_time_day` (`reminder_time`, `day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Reminders Log/Instances Table
-- Generated scheduled reminder slots
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `medicine_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `scheduled_at` DATETIME NOT NULL,
  `status` ENUM('scheduled', 'taken', 'skipped', 'missed') NOT NULL DEFAULT 'scheduled',
  `action_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_med_user_scheduled` (`user_id`, `medicine_id`, `scheduled_at`),
  INDEX `idx_reminders_user_status` (`user_id`, `status`),
  INDEX `idx_reminders_scheduled` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- Sample Data for Testing
-- Default test user password is 'Password123!' (bcrypt hashed)
-- ==============================================================

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password_hash`, `timezone`) VALUES
(1, 'Sarah Connor', 'sarah@example.com', '$2a$10$wT8KzWvEvyfMhF1YJj7yCe30wD3pW4HlU2K/u5s97rWlYy2VlmFje', 'UTC');

INSERT IGNORE INTO `medicines` (`id`, `user_id`, `medicine_name`, `dosage`, `instructions`, `start_date`, `end_date`, `frequency`) VALUES
(1, 1, 'Amoxicillin', '500mg', 'Take with full glass of water after food', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'daily'),
(2, 1, 'Vitamin D3', '2000 IU', 'Take in the morning with breakfast', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'daily'),
(3, 1, 'Lisinopril', '10mg', 'Blood pressure regulation. Do not skip.', CURDATE(), NULL, 'daily'),
(4, 1, 'Metformin', '850mg', 'Take with evening meal', CURDATE(), NULL, 'specific_days');

-- Insert reminder times for sample medicines
INSERT IGNORE INTO `medicine_reminder_times` (`id`, `medicine_id`, `reminder_time`, `day_of_week`) VALUES
(1, 1, '08:00:00', NULL),
(2, 1, '20:00:00', NULL),
(3, 2, '09:00:00', NULL),
(4, 3, '08:30:00', NULL),
(5, 4, '19:30:00', 1), -- Mon
(6, 4, '19:30:00', 3), -- Wed
(7, 4, '19:30:00', 5); -- Fri
