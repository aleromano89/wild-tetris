<?php

declare(strict_types=1);

/** Invia una risposta JSON con lo status HTTP indicato e termina. */
function json_response(int $status, mixed $data, array $headers = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    foreach ($headers as $name => $value) {
        header("$name: $value");
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

/** Errore JSON uniforme: {"error": "...", "errors": {...}?}. */
function json_error(int $status, string $message, array $errors = [], array $headers = []): never
{
    $body = ['error' => $message];
    if ($errors) {
        $body['errors'] = $errors;
    }
    json_response($status, $body, $headers);
}
