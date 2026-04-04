<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('POST only.');

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$email    = trim($body['email']    ?? '');
$password = $body['password']      ?? '';
$name     = trim($body['name']     ?? '');
$mobile   = trim($body['mobile']   ?? '');
$postal   = trim($body['postal_code']    ?? '');
$address  = trim($body['address']        ?? '');
$addr_d   = trim($body['address_detail'] ?? '');

if (!$email || !$password) json_err('이메일과 비밀번호는 필수입니다.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_err('이메일 형식이 올바르지 않습니다.');
if (strlen($password) < 8) json_err('비밀번호는 8자 이상이어야 합니다.');

try {
    // Duplicate check
    $chk = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $chk->execute([$email]);
    if ($chk->fetch()) json_err('이미 사용 중인 이메일입니다.');

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $ins  = db()->prepare(
        'INSERT INTO users (email, password, name, mobile, postal_code, address, address_detail) VALUES (?,?,?,?,?,?,?)'
    );
    $ins->execute([$email, $hash, $name, $mobile, $postal, $address, $addr_d]);
    $uid = (int)db()->lastInsertId();

    $_SESSION['user_id']  = $uid;
    $_SESSION['email']    = $email;
    $_SESSION['name']     = $name;
    $_SESSION['is_admin'] = 0;

    json_ok(['id' => $uid, 'email' => $email]);
} catch (Exception $e) {
    json_err('회원가입 오류: ' . $e->getMessage(), 500);
}
