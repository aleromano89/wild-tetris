<?php

declare(strict_types=1);

require __DIR__ . '/../../src/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $version = db()->query('SELECT VERSION() AS v')->fetch()['v'];
    echo json_encode(['status' => 'ok', 'php' => PHP_VERSION, 'mariadb' => $version]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Connessione DB fallita']);
}
