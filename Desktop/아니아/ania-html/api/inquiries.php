<?php
/**
 * 아니아 — 1:1 문의 API
 * actions: list | get | verify | create | reply
 */
require_once __DIR__ . '/db.php';
session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];

// ── 현재 세션 사용자 (비로그인 시 null) ──────────────────
function current_user(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    return [
        'id'       => (int) $_SESSION['user_id'],
        'email'    => $_SESSION['email'] ?? '',
        'is_admin' => (int) ($_SESSION['is_admin'] ?? 0),
    ];
}

// ── 이름 마스킹 (홍**) ───────────────────────────────────
function mask_name(string $name): string {
    $len = mb_strlen($name, 'UTF-8');
    if ($len <= 1) return $name . '*';
    return mb_substr($name, 0, 1, 'UTF-8') . str_repeat('*', min($len - 1, 3));
}

// ── 카테고리 유효값 ─────────────────────────────────────
const VALID_CATEGORIES = ['product', 'delivery', 'exchange', 'cancel', 'other'];

// ────────────────────────────────────────────────────────
// action=list  GET  공개 (body, password 미반환)
// ────────────────────────────────────────────────────────
if ($action === 'list' && $method === 'GET') {
    $cat   = $_GET['category'] ?? '';
    $page  = max(1, (int) ($_GET['page'] ?? 1));
    $limit = 20;
    $offset = ($page - 1) * $limit;

    try {
        $pdo = db();
        if ($cat && in_array($cat, VALID_CATEGORIES, true)) {
            $where = 'WHERE i.category = ?';
            $params = [$cat];
        } else {
            $where = '';
            $params = [];
        }

        $total = (int) $pdo->prepare("SELECT COUNT(*) FROM inquiries i $where")
                            ->execute($params) ? $pdo->prepare("SELECT COUNT(*) FROM inquiries i $where") : 0;
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM inquiries i $where");
        $stmt->execute($params);
        $total = (int) $stmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT i.id, i.category, i.title, i.created_at,
                   u.name AS author_name,
                   EXISTS(SELECT 1 FROM inquiry_replies r WHERE r.inquiry_id = i.id) AS has_reply
            FROM inquiries i
            JOIN users u ON u.id = i.user_id
            $where
            ORDER BY i.created_at DESC
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['author'] = mask_name($row['author_name']);
            unset($row['author_name']);
            $row['has_reply'] = (bool) $row['has_reply'];
            // NEW: 24시간 이내 작성
            $row['is_new'] = (strtotime($row['created_at']) > time() - 86400);
        }
        unset($row);

        json_ok(['items' => $rows, 'total' => $total, 'page' => $page, 'limit' => $limit]);
    } catch (Throwable $e) {
        json_err('서버 오류', 500);
    }
}

// ────────────────────────────────────────────────────────
// action=get  GET  로그인 필요
// ────────────────────────────────────────────────────────
if ($action === 'get' && $method === 'GET') {
    $user = current_user();
    if (!$user) json_err('로그인이 필요합니다.', 401);

    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) json_err('id가 필요합니다.');

    try {
        $pdo = db();
        $stmt = $pdo->prepare("
            SELECT i.id, i.user_id, i.category, i.title, i.body, i.created_at,
                   u.name AS author_name
            FROM inquiries i
            JOIN users u ON u.id = i.user_id
            WHERE i.id = ?
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_err('문의를 찾을 수 없습니다.', 404);

        // 본인 또는 admin → 바로 반환
        $is_owner = ($user['id'] === (int) $row['user_id']);
        $is_admin = (bool) $user['is_admin'];

        if (!$is_owner && !$is_admin) {
            // 비밀번호 필요 신호만 반환 (body 포함 안 함)
            json_ok([
                'id'             => (int) $row['id'],
                'category'       => $row['category'],
                'title'          => $row['title'],
                'created_at'     => $row['created_at'],
                'author'         => mask_name($row['author_name']),
                'needs_password' => true,
            ]);
        }

        // 답변 조회
        $rStmt = $pdo->prepare("
            SELECT r.body, r.created_at, u.name AS admin_name
            FROM inquiry_replies r
            JOIN users u ON u.id = r.user_id
            WHERE r.inquiry_id = ?
            ORDER BY r.created_at ASC
        ");
        $rStmt->execute([$id]);
        $replies = $rStmt->fetchAll();

        json_ok([
            'id'         => (int) $row['id'],
            'category'   => $row['category'],
            'title'      => $row['title'],
            'body'       => $row['body'],
            'created_at' => $row['created_at'],
            'author'     => mask_name($row['author_name']),
            'replies'    => $replies,
        ]);
    } catch (Throwable $e) {
        json_err('서버 오류', 500);
    }
}

// ────────────────────────────────────────────────────────
// action=verify  POST  로그인 필요 (타인이 비밀번호로 열람)
// ────────────────────────────────────────────────────────
if ($action === 'verify' && $method === 'POST') {
    $user = current_user();
    if (!$user) json_err('로그인이 필요합니다.', 401);

    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $id   = (int) ($body['id'] ?? 0);
    $pw   = trim($body['password'] ?? '');

    if (!$id || $pw === '') json_err('id와 password가 필요합니다.');

    try {
        $pdo = db();
        $stmt = $pdo->prepare("SELECT id, user_id, category, title, body, password, created_at FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_err('문의를 찾을 수 없습니다.', 404);

        if (!password_verify($pw, $row['password'])) {
            json_err('비밀번호가 올바르지 않습니다.', 403);
        }

        // 답변 조회
        $rStmt = $pdo->prepare("
            SELECT r.body, r.created_at, u.name AS admin_name
            FROM inquiry_replies r
            JOIN users u ON u.id = r.user_id
            WHERE r.inquiry_id = ?
            ORDER BY r.created_at ASC
        ");
        $rStmt->execute([$id]);
        $replies = $rStmt->fetchAll();

        // 본인 이름 조회
        $uStmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
        $uStmt->execute([$row['user_id']]);
        $author = $uStmt->fetchColumn() ?: '익명';

        json_ok([
            'id'         => (int) $row['id'],
            'category'   => $row['category'],
            'title'      => $row['title'],
            'body'       => $row['body'],
            'created_at' => $row['created_at'],
            'author'     => mask_name($author),
            'replies'    => $replies,
        ]);
    } catch (Throwable $e) {
        json_err('서버 오류', 500);
    }
}

// ────────────────────────────────────────────────────────
// action=create  POST  로그인 필요
// ────────────────────────────────────────────────────────
if ($action === 'create' && $method === 'POST') {
    $user = current_user();
    if (!$user) json_err('로그인이 필요합니다.', 401);

    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $cat   = trim($body['category'] ?? '');
    $title = trim($body['title']    ?? '');
    $text  = trim($body['body']     ?? '');
    $pw    = trim($body['password'] ?? '');

    if (!in_array($cat, VALID_CATEGORIES, true)) json_err('카테고리가 올바르지 않습니다.');
    if ($title === '')  json_err('제목을 입력해주세요.');
    if ($text  === '')  json_err('내용을 입력해주세요.');
    if (mb_strlen($pw) < 4) json_err('비밀번호는 4자 이상이어야 합니다.');
    if (mb_strlen($title) > 200) json_err('제목은 200자 이하로 입력해주세요.');

    $pwHash = password_hash($pw, PASSWORD_BCRYPT);

    try {
        $pdo = db();
        $stmt = $pdo->prepare("
            INSERT INTO inquiries (user_id, category, title, body, password)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user['id'], $cat, $title, $text, $pwHash]);
        json_ok(['id' => (int) $pdo->lastInsertId()]);
    } catch (Throwable $e) {
        json_err('서버 오류', 500);
    }
}

// ────────────────────────────────────────────────────────
// action=reply  POST  admin 전용
// ────────────────────────────────────────────────────────
if ($action === 'reply' && $method === 'POST') {
    $user = current_user();
    if (!$user) json_err('로그인이 필요합니다.', 401);
    if (!$user['is_admin']) json_err('권한이 없습니다.', 403);

    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $inquiryId = (int) ($body['inquiry_id'] ?? 0);
    $text      = trim($body['body'] ?? '');

    if (!$inquiryId) json_err('inquiry_id가 필요합니다.');
    if ($text === '') json_err('답변 내용을 입력해주세요.');

    try {
        $pdo = db();
        // 문의 존재 확인
        $check = $pdo->prepare("SELECT id FROM inquiries WHERE id = ?");
        $check->execute([$inquiryId]);
        if (!$check->fetch()) json_err('문의를 찾을 수 없습니다.', 404);

        $stmt = $pdo->prepare("INSERT INTO inquiry_replies (inquiry_id, user_id, body) VALUES (?, ?, ?)");
        $stmt->execute([$inquiryId, $user['id'], $text]);
        json_ok(['id' => (int) $pdo->lastInsertId()]);
    } catch (Throwable $e) {
        json_err('서버 오류', 500);
    }
}

json_err('잘못된 요청입니다.');
