<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$user   = require_auth();

if ($method === 'GET') {
    $stmt = db()->prepare('SELECT id,email,name,mobile,postal_code,address,address_detail,created_at FROM users WHERE id=?');
    $stmt->execute([$user['id']]);
    json_ok($stmt->fetch() ?: null);
}

if ($method === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $fields  = [];
    $params  = [];
    $allowed = ['name','mobile','postal_code','address','address_detail'];
    foreach ($allowed as $f) {
        if (isset($b[$f])) { $fields[] = "$f = ?"; $params[] = $b[$f]; }
    }
    if (!$fields) json_err('변경할 항목이 없습니다.');
    $params[] = $user['id'];
    db()->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id=?')->execute($params);
    // Update session name if changed
    if (isset($b['name'])) $_SESSION['name'] = $b['name'];
    json_ok(null);
}

json_err('잘못된 요청');
