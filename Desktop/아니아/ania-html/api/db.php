<?php
/**
 * 아니아 — DB 연결
 * 카페24 배포 시: $host, $name, $user, $pass 를 실제 값으로 변경
 *
 * ── [마이그레이션] v2 — 사이즈 + 상세이미지 컬럼 추가 ──────────────
 * 카페24 phpMyAdmin에서 아래 SQL을 한 번 실행하세요:
 *
 * ALTER TABLE products
 *   ADD COLUMN detail_images TEXT DEFAULT NULL COMMENT '상세 이미지 JSON 배열' AFTER images,
 *   ADD COLUMN sizes VARCHAR(200) DEFAULT NULL COMMENT '판매 가능 사이즈 JSON 배열 (NULL=전체)' AFTER detail_images;
 * ─────────────────────────────────────────────────────────────────────
 */
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'ania_db');
define('DB_USER', getenv('DB_USER') ?: 'ania_user');
define('DB_PASS', getenv('DB_PASS') ?: 'CHANGE_ME');
define('DB_CHARSET', 'utf8mb4');

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

function json_ok($data = null): void {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_err(string $msg, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function require_auth(): array {
    session_start();
    if (empty($_SESSION['user_id'])) json_err('로그인이 필요합니다.', 401);
    return ['id' => $_SESSION['user_id'], 'email' => $_SESSION['email'], 'is_admin' => $_SESSION['is_admin'] ?? 0];
}

function require_admin(): void {
    $u = require_auth();
    if (!$u['is_admin']) json_err('권한이 없습니다.', 403);
}
