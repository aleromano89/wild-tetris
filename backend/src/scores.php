<?php

declare(strict_types=1);

const PLAYER_NAME_MAX = 20;
const SCORE_MAX = 4294967295;   // INT UNSIGNED
const LEVEL_MAX = 65535;        // SMALLINT UNSIGNED
const TOP_LIMIT = 10;

/**
 * Valida il body di POST /api/scores.php.
 * Restituisce [dati normalizzati, errori per campo]; errori vuoti = dati validi.
 *
 * @return array{0: array<string, mixed>, 1: array<string, string>}
 */
function validate_score(array $input): array
{
    $errors = [];
    $data = [];

    $name = $input['player_name'] ?? null;
    if (!is_string($name)) {
        $errors['player_name'] = 'Il nome è obbligatorio';
    } else {
        $name = trim($name);
        if ($name === '') {
            $errors['player_name'] = 'Il nome è obbligatorio';
        } elseif (!mb_check_encoding($name, 'UTF-8') || preg_match('/[\p{Cc}]/u', $name)) {
            $errors['player_name'] = 'Il nome contiene caratteri non validi';
        } elseif (mb_strlen($name) > PLAYER_NAME_MAX) {
            $errors['player_name'] = 'Il nome può avere al massimo ' . PLAYER_NAME_MAX . ' caratteri';
        } else {
            $data['player_name'] = $name;
        }
    }

    $ints = [
        'score' => [0, SCORE_MAX, 'Il punteggio'],
        'lines_cleared' => [0, SCORE_MAX, 'Le righe'],
        'level' => [1, LEVEL_MAX, 'Il livello'],
    ];
    foreach ($ints as $field => [$min, $max, $label]) {
        $value = $input[$field] ?? null;
        // is_int esclude stringhe, decimali e booleani; json_decode converte in float gli interi oltre PHP_INT_MAX
        if (!is_int($value) || $value < $min || $value > $max) {
            $errors[$field] = "$label deve essere un intero tra $min e $max";
        } else {
            $data[$field] = $value;
        }
    }

    return [$data, $errors];
}

/** Top N per punteggio; a parità vince chi l'ha ottenuto prima. */
function top_scores(PDO $pdo, int $limit = TOP_LIMIT): array
{
    $stmt = $pdo->prepare(
        'SELECT player_name, score, lines_cleared, level, created_at
           FROM scores
          ORDER BY score DESC, created_at ASC, id ASC
          LIMIT :limit'
    );
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll();
}

/** Inserisce un punteggio già validato e restituisce il record salvato. */
function insert_score(PDO $pdo, array $data): array
{
    $stmt = $pdo->prepare(
        'INSERT INTO scores (player_name, score, lines_cleared, level)
         VALUES (:player_name, :score, :lines_cleared, :level)'
    );
    $stmt->execute([
        ':player_name' => $data['player_name'],
        ':score' => $data['score'],
        ':lines_cleared' => $data['lines_cleared'],
        ':level' => $data['level'],
    ]);

    $stmt = $pdo->prepare(
        'SELECT player_name, score, lines_cleared, level, created_at FROM scores WHERE id = :id'
    );
    $stmt->execute([':id' => (int) $pdo->lastInsertId()]);

    return $stmt->fetch();
}
