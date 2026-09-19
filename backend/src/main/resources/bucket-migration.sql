-- Migration script for Bucket List feature in Daybook app

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

CREATE INDEX idx_bucket_items_user_status_sort ON bucket_items(user_id, status, sort_order);
CREATE INDEX idx_bucket_items_user_completed ON bucket_items(user_id, completed_date);

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

CREATE INDEX idx_bucket_steps_item_sort ON bucket_steps(item_id, sort_order);
CREATE INDEX idx_bucket_steps_user ON bucket_steps(user_id);
