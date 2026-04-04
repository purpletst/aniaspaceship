<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ── Check session ──────────────────────────
if ($action === 'check') {
    if (empty($_SESSION['user_id'])) {
        json_ok(null);
    }
    json_ok([
        'id'       => $_SESSION['user_id'],
        'email'    => $_SESSION['email'],
        'name'     => $_SESSION['name'] ?? '',
        'is_admin' => (bool)($_SESSION['is_admin'] ?? false),
    ]);
}

// ── Login ──────────────────────────────────
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body  = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim($body['email'] ?? '');
    $pw    = $body['password'] ?? '';

    if (!$email || !$pw) json_err('이메일과 비밀번호를 입력해주세요.');

    try {
        $stmt = db()->prepare('SELECT id, email, password, name, is_admin FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    } catch (Exception $e) {
        json_err('DB 오류: ' . $e->getMessage(), 500);
    }

    if (!$user || !password_verify($pw, $user['password'])) {
        json_err('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    $_SESSION['user_id']  = $user['id'];
    $_SESSION['email']    = $user['email'];
    $_SESSION['name']     = $user['name'];
    $_SESSION['is_admin'] = $user['is_admin'];

    json_ok(['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name'], 'is_admin' => (bool)$user['is_admin']]);
}

// ── Logout ─────────────────────────────────
if ($action === 'logout') {
    session_destroy();
    json_ok(null);
}

json_err('잘못된 요청입니다.');
