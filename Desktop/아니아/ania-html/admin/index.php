<?php
session_start();
require_once __DIR__ . '/../api/db.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
    header('Location: /login.html');
    exit;
}

$pdo = db();
$userCount    = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$productCount = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
$orderCount   = $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
$pendingCount = $pdo->query("SELECT COUNT(*) FROM orders WHERE status='pending'")->fetchColumn();
?><!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>어드민 — 아니아</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Courier New', monospace; background: #f5f5f5; color: #111; }
.admin-header { background: #000; color: #fff; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
.admin-header h1 { font-size: 14px; letter-spacing: .1em; }
.admin-header nav a { color: #fff; text-decoration: none; font-size: 12px; margin-left: 24px; opacity: .7; }
.admin-header nav a:hover { opacity: 1; }
.admin-main { max-width: 960px; margin: 40px auto; padding: 0 24px; }
.admin-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
.card { background: #fff; border: 1px solid #e0e0e0; padding: 24px; }
.card-num { font-size: 36px; font-weight: 700; margin-bottom: 4px; }
.card-label { font-size: 11px; color: #888; letter-spacing: .08em; }
.admin-links { display: flex; gap: 12px; }
.admin-link { display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; font-size: 12px; letter-spacing: .05em; }
.admin-link:hover { background: #333; }
</style>
</head>
<body>
<div class="admin-header">
  <h1>아니아 ADMIN</h1>
  <nav>
    <a href="/admin/">대시보드</a>
    <a href="/admin/products.php">상품관리</a>
    <a href="/admin/members.php">회원관리</a>
    <a href="/index.html">사이트 보기</a>
    <a href="/api/auth.php?action=logout">로그아웃</a>
  </nav>
</div>
<div class="admin-main">
  <div class="admin-cards">
    <div class="card"><div class="card-num"><?= $userCount ?></div><div class="card-label">전체 회원</div></div>
    <div class="card"><div class="card-num"><?= $productCount ?></div><div class="card-label">전체 상품</div></div>
    <div class="card"><div class="card-num"><?= $orderCount ?></div><div class="card-label">전체 주문</div></div>
    <div class="card"><div class="card-num"><?= $pendingCount ?></div><div class="card-label">입금 대기</div></div>
  </div>
  <div class="admin-links">
    <a href="/admin/products.php" class="admin-link">상품 관리</a>
    <a href="/admin/members.php" class="admin-link">회원 관리</a>
  </div>
</div>
</body>
</html>
