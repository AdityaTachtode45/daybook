-- Daybook Tags & Search Schema Migration Script (MySQL 8)

-- 1. Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    created_at DATETIME NOT NULL,
    UNIQUE KEY uk_user_tag_name (user_id, name),
    CONSTRAINT fk_tag_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create entry_tags join table
CREATE TABLE IF NOT EXISTS entry_tags (
    entry_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (entry_id, tag_id),
    CONSTRAINT fk_entrytags_entry FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_entrytags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Add content_text column to diary_entries if not present
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS content_text LONGTEXT;

-- 4. Create FULLTEXT index for high performance text search
-- Note: MySQL 8 InnoDB supports FULLTEXT indexes
CREATE FULLTEXT INDEX idx_ft_entries_search ON diary_entries(title, content_text);

-- 5. Additional B-Tree indexes for fast multi-filter queries
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON diary_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_entries_user_mood ON diary_entries(user_id, mood);
