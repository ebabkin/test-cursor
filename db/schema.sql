-- Database Schema Documentation
-- Last updated: 2024-03-21
-- Note: This is a documentation file only. Do not execute directly.

-- Users Table
-- Stores user account information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,                                    -- Unique identifier for each user
    nickname VARCHAR(50) NOT NULL UNIQUE,                   -- User's display name, must be unique
    email VARCHAR(255) NOT NULL UNIQUE,                     -- User's email address, must be unique
    password VARCHAR(255) NOT NULL,                         -- Hashed password
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When the user account was created
);

-- Indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);              -- Index for faster email lookups
CREATE INDEX IF NOT EXISTS users_nickname_idx ON users(nickname);         -- Index for faster nickname lookups

-- Messages Table
-- Stores chat messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,                                    -- Unique identifier for each message
    user_id UUID NOT NULL REFERENCES users(id),            -- Foreign key to users table
    content TEXT NOT NULL,                                 -- Message content
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When the message was sent
);

-- Indexes
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);    -- Index for faster user message lookups
CREATE INDEX IF NOT EXISTS messages_creation_date_idx ON messages(creation_date);  -- Index for message ordering

-- Constraints explained:
-- 1. Primary Key (id): Ensures each user has a unique identifier
-- 2. UNIQUE (email): Ensures no duplicate email addresses
-- 3. UNIQUE (nickname): Ensures no duplicate nicknames
-- 4. NOT NULL constraints: Ensures required fields are always provided
-- 5. DEFAULT on creation_date: Automatically sets when user is created
-- 6. REFERENCES users(id): Ensures message author exists

-- Dependencies:
-- - Requires UUID extension for gen_random_uuid() function
-- - Used by: Authentication system, User profile system, Chat system 