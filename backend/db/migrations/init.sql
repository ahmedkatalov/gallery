CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    group_id TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'gates'
);
