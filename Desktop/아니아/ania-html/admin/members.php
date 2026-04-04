<?php
session_start();
require_once __DIR__ . '/../api/db.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
    header('Location: /login.html');
    exit;
}

$pdo = db();
$msg = '';

// 관리자 권한 토글
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $uid = (int)($_POST['uid'] ?? 0);
    if ($action === 'toggle_admin' && $uid && $uid !== (int)$_SESSION['user_id']) {
        $cur = $pdo->prepare('SELECT is_admin FROM users WHERE id=?');
        $cur->execute([$uid]);
        $row = $cur->fetch();
        if ($row) {
            $newVal = $row['is_admin'] ? 0 : 1;
            $pdo->prepare('UPDATE users SET is_admin=? WHERE id=?')->execute([$newVal, $uid]);
            $msg = "회원 #{$uid} 관리자 권한 " . ($newVal ? '부여' : '해제') . '됨';
        }
    }
    if ($action === 'delete' && $uid && $uid !== (int)$_SESSION['user_id']) {
        $pdo->prepare('DELETE FROM users WHERE id=?')->execute([$uid]);
        $msg = "회원 #{$uid} 삭제됨";
    }
}

// 검색
$search = trim($_GET['q'] ?? '');
if ($search) {
    $stmt = $pdo->prepare('SELECT u.*, (SELECT COUNT(*) FROM orders o WHERE o.user_id=u.id) as order_count FROM users u WHERE u.email LIKE ? OR u.name LIKE ? ORDER BY u.id DESC');
    $like = '%' . $search . '%';
    $stmt->execute([$like, $like]);
} else {
    $stmt = $pdo->query('SELECT u.*, (SELECT COUNT(*) FROM orders o WHERE o.user_id=u.id) as order_count FROM users u ORDER BY u.id DESC');
}
$members = $stmt->fetchAll();
?><!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>회원 관리 — 아니아 어드민</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Courier New', monospace; background: #f5f5f5; color: #111; }
.admin-header { background: #000; color: #fff; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
.admin-header h1 { font-size: 14px; letter-spacing: .1em; }
.admin-header nav a { color: #fff; text-decoration: none; font-size: 12px; margin-left: 24px; opacity: .7; }
.admin-header nav a:hover { opacity: 1; }
.admin-main { max-width: 1100px; margin: 32px auto; padding: 0 24px; }
h2 { font-size: 13px; letter-spacing: .08em; margin-bottom: 16px; }
.msg { background: #e8f5e9; border: 1px solid #a5d6a7; padding: 10px 14px; font-size: 12px; margin-bottom: 16px; }
.search-bar { display: flex; gap: 8px; margin-bottom: 20px; }
.search-bar input { flex: 1; padding: 8px 12px; border: 1px solid #ccc; font-family: inherit; font-size: 12px; }
.search-bar button { padding: 8px 16px; background: #000; color: #fff; border: none; font-family: inherit; font-size: 12px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; }
th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; }
th { background: #f9f9f9; font-weight: 600; }
tr:hover td { background: #fafafa; }
.badge-admin { background: #000; color: #fff; font-size: 10px; padding: 2px 6px; }
.btn { display: inline-block; padding: 4px 10px; font-size: 11px; border: none; cursor: pointer; font-family: inherit; }
.btn-admin { background: #333; color: #fff; }
.btn-del { background: #c00; color: #fff; }
.count-total { font-size: 12px; color: #666; margin-bottom: 12px; }
</style>
</head>
<body>
<div class="admin-header">
  <h1>아니아 ADMIN — 회원 관리</h1>
  <nav>
    <a href="/admin/">대시보드</a>
    <a href="/admin/products.php">상품관리</a>
    <a href="/admin/members.php">회원관리</a>
    <a href="/index.html">사이트 보기</a>
    <a href="/api/auth.php?action=logout">로그아웃</a>
  </nav>
</div>
<div class="admin-main">
  <h2>회원 목록</h2>
  <?php if ($msg): ?><div class="msg"><?= htmlspecialchars($msg) ?></div><?php endif; ?>

  <form class="search-bar" method="get">
    <input type="text" name="q" value="<?= htmlspecialchars($search) ?>" placeholder="이메일 또는 이름 검색">
    <button type="submit">검색</button>
    <?php if ($search): ?><a href="/admin/members.php" style="padding:8px 12px;font-size:12px;text-decoration:none;border:1px solid #ccc;background:#fff">초기화</a><?php endif; ?>
  </form>

  <p class="count-total">전체 <?= count($members) ?>명</p>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>이메일</th>
        <th>이름</th>
        <th>휴대전화</th>
        <th>주문수</th>
        <th>권한</th>
        <th>가입일</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($members as $m): ?>
      <tr>
        <td><?= $m['id'] ?></td>
        <td><?= htmlspecialchars($m['email']) ?></td>
        <td><?= htmlspecialchars($m['name'] ?? '') ?></td>
        <td><?= htmlspecialchars($m['mobile'] ?? '') ?></td>
        <td><?= $m['order_count'] ?></td>
        <td><?= $m['is_admin'] ? '<span class="badge-admin">ADMIN</span>' : '일반' ?></td>
        <td><?= date('Y-m-d', strtotime($m['created_at'])) ?></td>
        <td>
          <?php if ($m['id'] !== (int)$_SESSION['user_id']): ?>
          <form method="post" style="display:inline">
            <input type="hidden" name="action" value="toggle_admin">
            <input type="hidden" name="uid" value="<?= $m['id'] ?>">
            <button type="submit" class="btn btn-admin"><?= $m['is_admin'] ? '권한해제' : '관리자' ?></button>
          </form>
          <form method="post" style="display:inline" onsubmit="return confirm('회원을 삭제하시겠습니까?')">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="uid" value="<?= $m['id'] ?>">
            <button type="submit" class="btn btn-del">삭제</button>
          </form>
          <?php else: ?>
          <span style="font-size:11px;color:#888">(본인)</span>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
</body>
</html>
