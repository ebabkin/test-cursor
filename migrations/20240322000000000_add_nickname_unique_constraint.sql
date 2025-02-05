-- Up Migration
ALTER TABLE users ADD CONSTRAINT users_nickname_unique UNIQUE (nickname);
CREATE INDEX users_nickname_idx ON users(nickname);

-- Down Migration
DROP INDEX IF EXISTS users_nickname_idx;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_nickname_unique; 