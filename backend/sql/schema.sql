CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS children (
  id SERIAL PRIMARY KEY,
  clinician_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (clinician_id, child_code)
);
CREATE TABLE IF NOT EXISTS sessions (
  id_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS minimal_pairs (
  id SERIAL PRIMARY KEY,
  sound_type VARCHAR(100) NOT NULL,
  sound_pair VARCHAR(100) NOT NULL,
  position_in_word VARCHAR(20) NOT NULL
);
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  variant VARCHAR(100),
  image_url TEXT,
  male_audio_url TEXT,
  female_audio_url TEXT
);
CREATE TABLE IF NOT EXISTS minimal_pair_words (
  minimal_pair_id INTEGER NOT NULL REFERENCES minimal_pairs(id),
  word_id INTEGER NOT NULL REFERENCES words(id),
  sound VARCHAR(20) NOT NULL,
  position INTEGER NOT NULL CHECK (position IN (1, 2)),
  PRIMARY KEY (minimal_pair_id, position)
);
