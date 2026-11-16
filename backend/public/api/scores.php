<?php

declare(strict_types=1);

require __DIR__ . '/../../src/db.php';
require __DIR__ . '/../../src/http.php';
require __DIR__ . '/../../src/scores.php';

// GET  → top 10 per punteggio
// POST → salva un punteggio {player_name, score, lines_cleared, level}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            json_response(200, top_scores(db()));

        case 'POST':
            try {
                $input = json_decode((string) file_get_contents('php://input'), false, 8, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                json_error(400, 'Body JSON non valido');
            }
            if (!$input instanceof stdClass) {
                json_error(400, 'Il body deve essere un oggetto JSON');
            }

            [$data, $errors] = validate_score((array) $input);
            if ($errors) {
                json_error(422, 'Dati non validi', $errors);
            }
            json_response(201, insert_score(db(), $data));

        default:
            json_error(405, 'Metodo non consentito', [], ['Allow' => 'GET, POST']);
    }
} catch (PDOException $e) {
    error_log('scores.php: ' . $e->getMessage());
    json_error(500, 'Errore del database');
}
