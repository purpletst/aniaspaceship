<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$user   = require_auth();

// ── Get orders ─────────────────────────────
if ($method === 'GET') {
    try {
        $stmt = db()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$user['id']]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['items']            = json_decode($r['items'],            true);
            $r['shipping_address'] = json_decode($r['shipping_address'], true);
        }
        json_ok($rows);
    } catch (Exception $e) {
        json_err($e->getMessage(), 500);
    }
}

// ── Create order ───────────────────────────
if ($method === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($b['items'])) json_err('items 필요');

    $total = array_sum(array_map(fn($i) => ($i['unit_price'] ?? 0) * ($i['quantity'] ?? 1), $b['items']));

    try {
        $stmt = db()->prepare(
            'INSERT INTO orders (user_id, items, total_price, status, shipping_address) VALUES (?,?,?,?,?)'
        );
        $stmt->execute([
            $user['id'],
            json_encode($b['items'],            JSON_UNESCAPED_UNICODE),
            $total,
            'pending',
            isset($b['shipping_address']) ? json_encode($b['shipping_address'], JSON_UNESCAPED_UNICODE) : null,
        ]);
        json_ok(['id' => (int)db()->lastInsertId()]);
    } catch (Exception $e) {
        json_err($e->getMessage(), 500);
    }
}

json_err('잘못된 요청');
