-- Daybook Database Schema Reference (MySQL 8)

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(1000),
    timezone VARCHAR(100) DEFAULT 'UTC',
    date_of_birth DATE,
    location VARCHAR(255),
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS diary_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    entry_date DATE NOT NULL,
    title VARCHAR(200),
    content LONGTEXT,
    mood VARCHAR(20),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uk_user_entry_date (user_id, entry_date),
    KEY idx_user_entry_date (user_id, entry_date),
    CONSTRAINT fk_entry_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entry_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    public_id VARCHAR(500),
    resource_type VARCHAR(20),
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_media_entry FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
