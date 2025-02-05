-- Database Schema Documentation
-- Last updated: 2024-03-21
-- Note: This is a documentation file only. Do not execute directly.

-- Users Table
-- Stores user account information
CREATE TABLE users (
    id UUID PRIMARY KEY,                                    -- Unique identifier for each user
    nickname VARCHAR(50) NOT NULL,                          -- User's display name
    email VARCHAR(255) NOT NULL UNIQUE,                     -- User's email address, must be unique
    password VARCHAR(255) NOT NULL,                         -- Hashed password
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When the user account was created
);

-- Indexes
CREATE INDEX users_email_idx ON users(email);              -- Index for faster email lookups

-- Constraints explained:
-- 1. Primary Key (id): Ensures each user has a unique identifier
-- 2. UNIQUE (email): Ensures no duplicate email addresses
-- 3. NOT NULL constraints: Ensures required fields are always provided
-- 4. DEFAULT on creation_date: Automatically sets when user is created

-- Dependencies:
-- - Requires UUID extension for gen_random_uuid() function
-- - Used by: Authentication system, User profile system 