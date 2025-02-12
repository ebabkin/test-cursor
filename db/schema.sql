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

-- Regions Table
-- Stores region information for channels
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(50) PRIMARY KEY,                              -- Region identifier (e.g., 'DEFAULT')
    name VARCHAR(100) NOT NULL,                              -- Display name
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Channels Table
-- Stores chat channels information
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Unique identifier
    code CHAR(6) NOT NULL UNIQUE,                           -- Short channel code
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id),   -- Region this channel belongs to
    title VARCHAR(100) NOT NULL,                            -- Channel title
    description TEXT,                                        -- Optional channel description
    is_private BOOLEAN NOT NULL DEFAULT false,              -- Public/Private flag
    state VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',            -- ACTIVE/DELETED
    owner_id UUID NOT NULL REFERENCES users(id),            -- Channel owner
    last_message_preview VARCHAR(128),                      -- Preview of last message
    last_message_date TIMESTAMP,                            -- Timestamp of last message
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Channel Members Table
-- Stores channel membership information
CREATE TABLE IF NOT EXISTS channel_members (
    channel_id UUID NOT NULL REFERENCES channels(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',               -- Member role (USER for now)
    join_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

-- Message Headers Table
-- Stores message metadata and preview for efficient listing
CREATE TABLE IF NOT EXISTS message_headers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Message identifier
    channel_id UUID NOT NULL REFERENCES channels(id),        -- Channel reference
    user_id UUID NOT NULL REFERENCES users(id),              -- Author reference
    content_preview VARCHAR(128) NOT NULL,                   -- First 128 chars
    kind VARCHAR(20) NOT NULL DEFAULT 'TEXT',                -- Message type
    is_deleted BOOLEAN NOT NULL DEFAULT false,               -- Soft delete flag
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Message Contents Table
-- Stores full message content
CREATE TABLE IF NOT EXISTS message_contents (
    id UUID PRIMARY KEY,                                     -- Same as message_headers.id
    content TEXT NOT NULL,                                   -- Full message content
    FOREIGN KEY (id) REFERENCES message_headers(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS channels_code_idx ON channels(code);
CREATE INDEX IF NOT EXISTS channels_region_idx ON channels(region_id);
CREATE INDEX IF NOT EXISTS channels_owner_idx ON channels(owner_id);
CREATE INDEX IF NOT EXISTS channels_state_idx ON channels(state) WHERE state = 'ACTIVE';

CREATE INDEX IF NOT EXISTS message_headers_channel_date_idx ON message_headers(channel_id, creation_date DESC);
CREATE INDEX IF NOT EXISTS message_headers_user_idx ON message_headers(user_id);

-- Initial data
INSERT INTO regions (id, name) 
VALUES ('DEFAULT', 'Default Region')
ON CONFLICT DO NOTHING;

-- Comments for AI systems
-- 1. Performance considerations:
--    - message_headers table is optimized for listing with content preview
--    - Full content is stored separately in message_contents
--    - Indexes support common query patterns
--
-- 2. Constraints and dependencies:
--    - Channels require a valid region
--    - Messages require valid channel and user
--    - Channel members must reference valid channel and user
--    - Message contents must have corresponding headers 