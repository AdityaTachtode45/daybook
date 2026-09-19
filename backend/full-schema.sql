-- Complete MySQL Database Schema for Daybook Application (Aiven MySQL Compatible)

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    display_name VARCHAR(100) NULL,
    bio TEXT NULL,
    avatar_url VARCHAR(1000) NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    date_of_birth DATE NULL,
    location VARCHAR(100) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diary_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    entry_date DATE NOT NULL,
    title VARCHAR(255) NULL,
    content LONGTEXT NULL,
    mood VARCHAR(20) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_entry_date UNIQUE (user_id, entry_date)
);

CREATE TABLE IF NOT EXISTS media_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entry_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    public_id VARCHAR(500) NULL,
    resource_type VARCHAR(20) NULL,
    file_name VARCHAR(255) NULL,
    mime_type VARCHAR(100) NULL,
    size_bytes BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_entry FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NULL,
    CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_tag_name UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS entry_tags (
    entry_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (entry_id, tag_id),
    CONSTRAINT fk_et_entry FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_et_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bucket_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    category ENUM('TRAVEL', 'LEARN', 'CAREER', 'HEALTH', 'ADVENTURE', 'CREATIVE', 'RELATIONSHIPS', 'MONEY', 'OTHER') NOT NULL DEFAULT 'OTHER',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('DREAMING', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'DREAMING',
    target_date DATE NULL,
    location_name VARCHAR(200) NULL,
    cover_url VARCHAR(1000) NULL,
    cover_public_id VARCHAR(500) NULL,
    sort_order INT NULL,
    completed_date DATE NULL,
    completed_note TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bucket_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bucket_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    text VARCHAR(300) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bucket_steps_item FOREIGN KEY (item_id) REFERENCES bucket_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_bucket_steps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_bucket_items_user_status_sort ON bucket_items(user_id, status, sort_order);
CREATE INDEX idx_bucket_items_user_completed ON bucket_items(user_id, completed_date);
CREATE INDEX idx_bucket_steps_item_sort ON bucket_steps(item_id, sort_order);
CREATE INDEX idx_bucket_steps_user ON bucket_steps(user_id);
