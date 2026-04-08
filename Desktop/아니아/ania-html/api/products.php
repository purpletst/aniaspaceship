<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$action   = $_GET['action'] ?? 'list';
$method   = $_SERVER['REQUEST_METHOD'];

// ── List / Search ──────────────────────────
if ($action === 'list' || $action === 'search') {
    $where  = ['1=1'];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[]  = 'category = ?';
        $params[] = $_GET['category'];
    }
    if ($action === 'search' && !empty($_GET['q'])) {
        $q        = '%' . $_GET['q'] . '%';
        $where[]  = '(name LIKE ? OR name_ko LIKE ? OR description LIKE ?)';
        $params   = array_merge($params, [$q, $q, $q]);
    }
    if ($action === 'list') {
        $where[]  = 'is_available = 1';
    }

    $limit  = min((int)($_GET['limit'] ?? 100), 200);
    $sql    = 'SELECT * FROM products WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC LIMIT ' . $limit;

    try {
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        // Decode JSON columns
        foreach ($rows as &$r) {
            $r['images']        = $r['images']        ? json_decode($r['images'],        true) : [];
            $r['detail_images'] = $r['detail_images'] ? json_decode($r['detail_images'], true) : [];
            $r['sizes']         = $r['sizes']         ? json_decode($r['sizes'],         true) : null;
        }
        json_ok($rows);
    } catch (Exception $e) {
        json_err($e->getMessage(), 500);
    }
}

// ── Single ──────────────────────────────────
if ($action === 'single') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) json_err('id 필요');
    try {
        $stmt = db()->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_err('상품을 찾을 수 없습니다.', 404);
        $row['images']        = $row['images']        ? json_decode($row['images'],        true) : [];
        $row['detail_images'] = $row['detail_images'] ? json_decode($row['detail_images'], true) : [];
        $row['sizes']         = $row['sizes']         ? json_decode($row['sizes'],         true) : null;
        json_ok($row);
    } catch (Exception $e) {
        json_err($e->getMessage(), 500);
    }
}

// ── Create (admin) ─────────────────────────
if ($action === 'create' && $method === 'POST') {
    require_admin();
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    try {
        $sizes = $b['sizes'] ?? null;
        $stmt = db()->prepare(
            'INSERT INTO products (name,name_ko,price,description,images,detail_images,sizes,category,stock,is_available) VALUES (?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $b['name']         ?? '',
            $b['name_ko']      ?? null,
            (int)($b['price']  ?? 0),
            $b['description']  ?? null,
            json_encode($b['images']        ?? [], JSON_UNESCAPED_UNICODE),
            json_encode($b['detail_images'] ?? [], JSON_UNESCAPED_UNICODE),
            (is_array($sizes) && count($sizes)) ? json_encode($sizes, JSON_UNESCAPED_UNICODE) : null,
            $b['category']     ?? 'etc',
            (int)($b['stock']  ?? 100),
            (int)($b['is_available'] ?? 1),
        ]);
        $newId = (int)db()->lastInsertId();
        $row   = db()->query("SELECT * FROM products WHERE id = $newId")->fetch();
        $row['images']        = json_decode($row['images'],        true);
        $row['detail_images'] = $row['detail_images'] ? json_decode($row['detail_images'], true) : [];
        $row['sizes']         = $row['sizes']         ? json_decode($row['sizes'],         true) : null;
        json_ok($row);
    } catch (Exception $e) {
        json_err($e->getMessage(), 500);
    }
}

// ── Update (admin) ─────────────────────────
if ($action === 'update' && $method === 'POST') {
    require_admin();
    $b  = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($b['id'] ?? 0);
    if (!$id) json_err('id 필요');
    try {
        $sizes = $b['sizes'] ?? null;
        $stmt = db()->prepare(
            'UPDATE products SET name=?,name_ko=?,price=?,description=?,images=?,detail_images=?,sizes=?,category=?,stock=?,is_available=? WHERE id=?'
        );
        $stmt->execute([
            $b['name'], $b['name_ko'] ?? null, (int)$b['price'],
            $b['description'] ?? null,
            json_encode($b['images']        ?? [], JSON_UNESCAPED_UNICODE),
            json_encode($b['detail_images'] ?? [], JSON_UNESCAPED_UNICODE),
            (is_array($sizes) && count($sizes)) ? json_encode($sizes, JSON_UNESCAPED_UNICODE) : null,
            $b['category'] ?? 'etc', (int)$b['stock'], (int)$b['is_available'], $id,
        ]);
        json_ok(null);
    } catch (Exception $e) {
        json_err($e->getMessage(), 500);
    }
}

// ── Delete (admin) ─────────────────────────
if ($action === 'delete' && $method === 'POST') {
    require_admin();
    $b  = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($b['id'] ?? 0);
    if (!$id) json_err('id 필요');
    db()->prepare('DELETE FROM products WHERE id=?')->execute([$id]);
    json_ok(null);
}

json_err('잘못된 요청');
