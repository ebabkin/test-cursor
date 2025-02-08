-- Up Migration
-- Create regions table
CREATE TABLE regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create channels table
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code CHAR(6) NOT NULL UNIQUE,
    region_id VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_private BOOLEAN NOT NULL DEFAULT false,
    state VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_preview VARCHAR(128),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT valid_state CHECK (state IN ('ACTIVE', 'DELETED'))
);

-- Create channel_members table
CREATE TABLE channel_members (
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT valid_role CHECK (role IN ('USER'))
);

-- Create message_previews table
CREATE TABLE message_previews (
    id UUID NOT NULL,
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content_preview VARCHAR(128) NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, created_at, id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT valid_kind CHECK (kind IN ('TEXT'))
) PARTITION BY RANGE (created_at);

-- Create messages table
CREATE TABLE messages (
    id UUID NOT NULL,
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, created_at, id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT valid_kind CHECK (kind IN ('TEXT'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions
CREATE TABLE message_previews_y2024m01 PARTITION OF message_previews
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE messages_y2024m01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Create indexes
CREATE INDEX idx_channels_code ON channels(code);
CREATE INDEX idx_channels_region ON channels(region_id);
CREATE INDEX idx_channels_owner ON channels(owner_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_message_previews_user ON message_previews(user_id);
CREATE INDEX idx_messages_user ON messages(user_id);

-- Insert default region
INSERT INTO regions (id, name) VALUES ('DEFAULT', 'Default Region');

-- Down Migration
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_previews CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS regions CASCADE; 