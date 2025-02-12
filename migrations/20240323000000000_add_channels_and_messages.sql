-- Up Migration
-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code CHAR(6) NOT NULL UNIQUE,
    region_id VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_private BOOLEAN NOT NULL DEFAULT false,
    state VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    owner_id UUID NOT NULL,
    last_message_preview VARCHAR(128),
    last_message_date TIMESTAMP,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Create channel members table
CREATE TABLE IF NOT EXISTS channel_members (
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    join_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create message headers table
CREATE TABLE IF NOT EXISTS message_headers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content_preview VARCHAR(128) NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create message contents table
CREATE TABLE IF NOT EXISTS message_contents (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES message_headers(id)
);

-- Create indexes
CREATE INDEX channels_code_idx ON channels(code);
CREATE INDEX channels_region_idx ON channels(region_id);
CREATE INDEX channels_owner_idx ON channels(owner_id);
CREATE INDEX channels_state_idx ON channels(state) WHERE state = 'ACTIVE';

CREATE INDEX message_headers_channel_date_idx ON message_headers(channel_id, creation_date DESC);
CREATE INDEX message_headers_user_idx ON message_headers(user_id);

-- Insert default region
INSERT INTO regions (id, name) 
VALUES ('DEFAULT', 'Default Region')
ON CONFLICT DO NOTHING;

-- Down Migration
DROP TABLE IF EXISTS message_contents;
DROP TABLE IF EXISTS message_headers;
DROP TABLE IF EXISTS channel_members;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS regions; 