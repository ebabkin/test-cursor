-- Database Schema Documentation
-- Last updated: 2024-03-21
-- Note: This is a documentation file only. Do not execute directly.

-- Users Table
-- Stores user account information
CREATE TABLE users (
    id UUID PRIMARY KEY,                                    -- Unique identifier for each user
    nickname VARCHAR(50) NOT NULL UNIQUE,                   -- User's display name, must be unique
    email VARCHAR(255) NOT NULL UNIQUE,                     -- User's email address, must be unique
    password VARCHAR(255) NOT NULL,                         -- Hashed password
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When the user account was created
);

-- Indexes
CREATE INDEX users_email_idx ON users(email);              -- Index for faster email lookups
CREATE INDEX users_nickname_idx ON users(nickname);         -- Index for faster nickname lookups

-- Constraints explained:
-- 1. Primary Key (id): Ensures each user has a unique identifier
-- 2. UNIQUE (email): Ensures no duplicate email addresses
-- 3. UNIQUE (nickname): Ensures no duplicate nicknames
-- 4. NOT NULL constraints: Ensures required fields are always provided
-- 5. DEFAULT on creation_date: Automatically sets when user is created

-- Dependencies:
-- - Requires UUID extension for gen_random_uuid() function
-- - Used by: Authentication system, User profile system 

-- Regions table (for future extensibility)
CREATE TABLE regions (
    id VARCHAR(50) PRIMARY KEY,                              -- Region identifier
    name VARCHAR(100) NOT NULL,                             -- Region name
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- When region was created
);

-- Channels table
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Unique identifier
    code CHAR(6) NOT NULL UNIQUE,                           -- Short channel code
    region_id VARCHAR(50) NOT NULL,                         -- Region reference
    title VARCHAR(100) NOT NULL,                            -- Channel title
    description TEXT,                                       -- Optional description
    is_private BOOLEAN NOT NULL DEFAULT false,              -- Public/Private flag
    state VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',            -- ACTIVE/DELETED
    owner_id UUID NOT NULL,                                 -- Reference to users.id
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Creation timestamp
    last_message_preview VARCHAR(128),                      -- Preview of last message
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT valid_state CHECK (state IN ('ACTIVE', 'DELETED'))
);

-- Channel members table
CREATE TABLE channel_members (
    channel_id UUID NOT NULL,                               -- Reference to channels.id
    user_id UUID NOT NULL,                                  -- Reference to users.id
    role VARCHAR(20) NOT NULL DEFAULT 'USER',               -- Member role
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- When user joined
    PRIMARY KEY (channel_id, user_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT valid_role CHECK (role IN ('USER'))
);

-- Messages preview table (for efficient listing)
CREATE TABLE message_previews (
    id UUID NOT NULL,                                       -- Same as messages.id
    channel_id UUID NOT NULL,                               -- Reference to channels.id
    user_id UUID NOT NULL,                                  -- Reference to users.id
    content_preview VARCHAR(128) NOT NULL,                  -- First 128 chars
    kind VARCHAR(20) NOT NULL DEFAULT 'TEXT',               -- Message type
    is_deleted BOOLEAN NOT NULL DEFAULT false,              -- Soft delete flag
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Creation timestamp
    PRIMARY KEY (channel_id, created_at, id),              -- Partitioned by channel and date
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT valid_kind CHECK (kind IN ('TEXT'))
) PARTITION BY RANGE (created_at);

-- Messages table (full content)
CREATE TABLE messages (
    id UUID NOT NULL,                                       -- Same as in preview
    channel_id UUID NOT NULL,                               -- Reference to channels.id
    user_id UUID NOT NULL,                                  -- Reference to users.id
    content TEXT NOT NULL,                                  -- Full message content
    kind VARCHAR(20) NOT NULL DEFAULT 'TEXT',               -- Message type
    is_deleted BOOLEAN NOT NULL DEFAULT false,              -- Soft delete flag
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Creation timestamp
    PRIMARY KEY (channel_id, created_at, id),              -- Partitioned by channel and date
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT valid_kind CHECK (kind IN ('TEXT'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions for messages (by month for current year)
CREATE TABLE message_previews_y2024m01 PARTITION OF message_previews
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- Add more partitions as needed

CREATE TABLE messages_y2024m01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- Add more partitions as needed

-- Indexes
CREATE INDEX idx_channels_code ON channels(code);
CREATE INDEX idx_channels_region ON channels(region_id);
CREATE INDEX idx_channels_owner ON channels(owner_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_message_previews_user ON message_previews(user_id);
CREATE INDEX idx_messages_user ON messages(user_id);

-- Insert default region
INSERT INTO regions (id, name) VALUES ('DEFAULT', 'Default Region'); 