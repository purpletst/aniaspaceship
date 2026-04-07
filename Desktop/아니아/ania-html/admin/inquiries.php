<?php
session_start();
require_once __DIR__ . '/../api/db.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
    header('Location: /login.html');
    exit;
}

$pdo = db();
$adminId = (int) $_SESSION['user_id'];

// ── 답변 등록 처리 ────────────────────────────────────────
$replyMsg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['reply_body'])) {
    $inquiryId = (int) ($_POST['inquiry_id'] ?? 0);
    $body      = trim($_POST['reply_body'] ?? '');
    if ($inquiryId && $body !== '') {
        $stmt = $pdo->prepare("INSERT INTO inquiry_replies (inquiry_id, user_id, body) VALUES (?, ?, ?)");
        $stmt->execute([$inquiryId, $adminId, $body]);
        $replyMsg = '답변이 등록되었습니다.';
        header("Location: /admin/inquiries.php?view={$inquiryId}&msg=" . urlencode($replyMsg));
        exit;
    } else {
        $replyMsg = '내용을 입력해주세요.';
    }
}

// ── 상세 보기 ────────────────────────────────────────────
$viewId   = (int) ($_GET['view'] ?? 0);
$viewData = null;
$replies  = [];

if ($viewId) {
    $stmt = $pdo->prepare("
        SELECT i.*, u.name AS author_name, u.email AS author_email
        FROM inquiries i
        JOIN users u ON u.id = i.user_id
        WHERE i.id = ?
    ");
    $stmt->execute([$viewId]);
    $viewData = $stmt->fetch();

    if ($viewData) {
        $rStmt = $pdo->prepare("
            SELECT r.*, u.name AS admin_name
            FROM inquiry_replies r
            JOIN users u ON u.id = r.user_id
            WHERE r.inquiry_id = ?
            ORDER BY r.created_at ASC
        ");
        $rStmt->execute([$viewId]);
        $replies = $rStmt->fetchAll();
    }
}

// ── 목록 ─────────────────────────────────────────────────
$catFilter = $_GET['category'] ?? '';
$page      = max(1, (int) ($_GET['page'] ?? 1));
$limit     = 30;
$offset    = ($page - 1) * $limit;

$validCats = ['product', 'delivery', 'exchange', 'cancel', 'other'];
$where     = '';
$params    = [];
if ($catFilter && in_array($catFilter, $validCats, true)) {
    $where  = 'WHERE i.category = ?';
    $params = [$catFilter];
}

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM inquiries i $where");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

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
$inquiries = $stmt->fetchAll();

$catLabels = [
    'product' => '제품문의', 'delivery' => '배송문의',
    'exchange' => '교환/반품', 'cancel' => '취소문의', 'other' => '기타',
];

function esc_html($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

$msgParam = $_GET['msg'] ?? '';
?><!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>문의 관리 — 아니아 Admin</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Courier New', monospace; background: #f5f5f5; color: #111; }
.admin-header { background: #000; color: #fff; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
.admin-header h1 { font-size: 14px; letter-spacing: .1em; }
.admin-header nav a { color: #fff; text-decoration: none; font-size: 12px; margin-left: 24px; opacity: .7; }
.admin-header nav a:hover { opacity: 1; }
.admin-main { max-width: 960px; margin: 40px auto; padding: 0 24px 80px; }
h2 { font-size: 14px; letter-spacing: .08em; margin-bottom: 20px; }
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-btn { padding: 6px 14px; font-size: 11px; letter-spacing: .06em; border: 1px solid #ccc; background: #fff; cursor: pointer; font-family: inherit; }
.filter-btn.active { background: #000; color: #fff; border-color: #000; }
.inquiry-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.inquiry-table th, .inquiry-table td { border-bottom: 1px solid #e0e0e0; padding: 10px 12px; text-align: left; vertical-align: top; }
.inquiry-table th { font-size: 10px; letter-spacing: .06em; background: #fafafa; color: #666; }
.inquiry-table tr:hover td { background: #f8f8f8; }
.inquiry-table a { color: #000; text-decoration: none; }
.inquiry-table a:hover { text-decoration: underline; }
.badge-re  { display: inline-block; background: #555; color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 2px; margin-right: 4px; }
.badge-new { display: inline-block; background: #1565c0; color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 2px; }
.cat-badge { display: inline-block; background: #e8e8e8; font-size: 10px; padding: 2px 6px; border-radius: 2px; }
.pager { display: flex; gap: 8px; margin-top: 20px; }
.pager a { padding: 6px 12px; border: 1px solid #ccc; font-size: 12px; text-decoration: none; color: #000; }
.pager a.active { background: #000; color: #fff; border-color: #000; }
/* 상세 */
.detail-wrap { background: #fff; border: 1px solid #e0e0e0; padding: 28px; margin-bottom: 24px; }
.detail-back { font-size: 12px; color: #666; text-decoration: none; display: inline-block; margin-bottom: 20px; }
.detail-back:hover { color: #000; }
.detail-cat  { font-size: 10px; letter-spacing: .08em; color: #888; margin-bottom: 8px; }
.detail-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.detail-meta  { font-size: 11px; color: #888; margin-bottom: 20px; }
.detail-body  { font-size: 13px; line-height: 2; white-space: pre-wrap; border-top: 1px solid #e8e8e8; padding-top: 16px; }
.reply-list { margin-top: 24px; }
.reply-item { background: #f8f8f8; border-left: 3px solid #000; padding: 16px; margin-bottom: 12px; }
.reply-meta  { font-size: 10px; color: #888; margin-bottom: 6px; }
.reply-body  { font-size: 12px; line-height: 1.9; white-space: pre-wrap; }
.reply-form  { margin-top: 24px; }
.reply-form label { font-size: 11px; letter-spacing: .06em; display: block; margin-bottom: 6px; color: #555; }
.reply-form textarea { width: 100%; padding: 10px; font-size: 12px; border: 1px solid #ccc; font-family: inherit; height: 120px; resize: vertical; }
.reply-form button { margin-top: 10px; padding: 10px 24px; background: #000; color: #fff; font-size: 11px; letter-spacing: .08em; border: none; cursor: pointer; font-family: inherit; }
.reply-form button:hover { background: #333; }
.msg-ok  { background: #e8f5e9; color: #2e7d32; padding: 10px 14px; font-size: 12px; margin-bottom: 16px; }
.msg-err { background: #ffebee; color: #c62828; padding: 10px 14px; font-size: 12px; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="admin-header">
  <h1>아니아 ADMIN</h1>
  <nav>
    <a href="/admin/">대시보드</a>
    <a href="/admin/products.php">상품관리</a>
    <a href="/admin/members.php">회원관리</a>
    <a href="/admin/inquiries.php">문의관리</a>
    <a href="/index.html">사이트 보기</a>
    <a href="/api/auth.php?action=logout">로그아웃</a>
  </nav>
</div>
<div class="admin-main">

<?php if ($viewData): ?>
  <!-- ── 상세 보기 ── -->
  <a class="detail-back" href="/admin/inquiries.php">← 목록으로</a>

  <?php if ($msgParam): ?>
    <div class="msg-ok"><?= esc_html($msgParam) ?></div>
  <?php endif; ?>

  <div class="detail-wrap">
    <p class="detail-cat"><?= esc_html($catLabels[$viewData['category']] ?? $viewData['category']) ?></p>
    <h2 class="detail-title"><?= esc_html($viewData['title']) ?></h2>
    <p class="detail-meta">
      <?= esc_html($viewData['created_at']) ?> &nbsp;|&nbsp;
      <?= esc_html($viewData['author_name']) ?> (<?= esc_html($viewData['author_email']) ?>)
    </p>
    <div class="detail-body"><?= esc_html($viewData['body']) ?></div>

    <?php if ($replies): ?>
    <div class="reply-list">
      <p style="font-size:11px;letter-spacing:.06em;color:#555;margin-bottom:12px">관리자 답변 (<?= count($replies) ?>)</p>
      <?php foreach ($replies as $r): ?>
      <div class="reply-item">
        <p class="reply-meta"><?= esc_html($r['admin_name']) ?> &nbsp;|&nbsp; <?= esc_html($r['created_at']) ?></p>
        <div class="reply-body"><?= esc_html($r['body']) ?></div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <div class="reply-form">
      <form method="post" action="/admin/inquiries.php?view=<?= $viewId ?>">
        <input type="hidden" name="inquiry_id" value="<?= $viewId ?>">
        <label>답변 작성</label>
        <textarea name="reply_body" placeholder="답변 내용을 입력해주세요..."></textarea>
        <button type="submit">답변 등록</button>
      </form>
    </div>
  </div>

<?php else: ?>
  <!-- ── 목록 ── -->
  <h2>문의 관리 <span style="font-size:12px;font-weight:normal;color:#888">(총 <?= $total ?>건)</span></h2>

  <div class="filter-bar">
    <a href="/admin/inquiries.php" class="filter-btn <?= $catFilter === '' ? 'active' : '' ?>">전체</a>
    <?php foreach ($catLabels as $val => $lbl): ?>
    <a href="/admin/inquiries.php?category=<?= $val ?>" class="filter-btn <?= $catFilter === $val ? 'active' : '' ?>"><?= $lbl ?></a>
    <?php endforeach; ?>
  </div>

  <table class="inquiry-table">
    <thead>
      <tr>
        <th style="width:40px">No.</th>
        <th style="width:90px">분류</th>
        <th>제목</th>
        <th style="width:140px">작성자</th>
        <th style="width:100px">날짜</th>
      </tr>
    </thead>
    <tbody>
    <?php if ($inquiries): ?>
      <?php foreach ($inquiries as $inq): ?>
      <tr>
        <td><?= $inq['id'] ?></td>
        <td><span class="cat-badge"><?= esc_html($catLabels[$inq['category']] ?? $inq['category']) ?></span></td>
        <td>
          <?php if ($inq['has_reply']): ?><span class="badge-re">re</span><?php endif; ?>
          <a href="/admin/inquiries.php?view=<?= $inq['id'] ?>"><?= esc_html($inq['title']) ?></a>
          <?php $isNew = (strtotime($inq['created_at']) > time() - 86400); ?>
          <?php if ($isNew): ?><span class="badge-new">NEW</span><?php endif; ?>
        </td>
        <td><?= esc_html($inq['author_name']) ?></td>
        <td><?= substr($inq['created_at'], 0, 10) ?></td>
      </tr>
      <?php endforeach; ?>
    <?php else: ?>
      <tr><td colspan="5" style="text-align:center;padding:24px;color:#aaa">문의가 없습니다.</td></tr>
    <?php endif; ?>
    </tbody>
  </table>

  <?php if ($total > $limit): ?>
  <div class="pager">
    <?php $pages = ceil($total / $limit); ?>
    <?php for ($i = 1; $i <= $pages; $i++): ?>
      <a href="?category=<?= esc_html($catFilter) ?>&page=<?= $i ?>" class="<?= $i === $page ? 'active' : '' ?>"><?= $i ?></a>
    <?php endfor; ?>
  </div>
  <?php endif; ?>

<?php endif; ?>

</div>
</body>
</html>
