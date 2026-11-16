-- Eseguito solo alla prima creazione del volume mariadb_data.
-- Per riapplicarlo: docker compose down -v (cancella i dati!)

CREATE TABLE IF NOT EXISTS scores (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(20)  NOT NULL,
    score       INT UNSIGNED NOT NULL,
    lines_cleared INT UNSIGNED NOT NULL DEFAULT 0,
    level       SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_score (score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
