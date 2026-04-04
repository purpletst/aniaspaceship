<?php
session_start();
require_once __DIR__ . '/../api/db.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
    header('Location: /login.html');
    exit;
}

$pdo = db();
$msg = '';

// POST 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'delete') {
        $id = (int)$_POST['id'];
        $pdo->prepare('DELETE FROM products WHERE id=?')->execute([$id]);
        $msg = '삭제되었습니다.';
    }

    if ($action === 'save') {
        $id          = (int)($_POST['id'] ?? 0);
        $name        = trim($_POST['name'] ?? '');
        $name_ko     = trim($_POST['name_ko'] ?? '');
        $price       = (int)preg_replace('/\D/', '', $_POST['price'] ?? '0');
        $description = trim($_POST['description'] ?? '');
        $category    = $_POST['category'] ?? 'etc';
        $stock       = (int)($_POST['stock'] ?? 100);
        $is_available = isset($_POST['is_available']) ? 1 : 0;
        $images_raw  = trim($_POST['images'] ?? '[]');

        // 이미지 URL 파싱 (줄바꿈 or 쉼표 구분)
        $lines = preg_split('/[\r\n,]+/', $images_raw);
        $images = array_values(array_filter(array_map('trim', $lines)));
        $images_json = json_encode($images, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (!$name) {
            $msg = '상품명은 필수입니다.';
        } elseif ($id) {
            $pdo->prepare('UPDATE products SET name=?, name_ko=?, price=?, description=?, category=?, stock=?, is_available=?, images=? WHERE id=?')
                ->execute([$name, $name_ko, $price, $description, $category, $stock, $is_available, $images_json, $id]);
            $msg = '수정되었습니다.';
        } else {
            $pdo->prepare('INSERT INTO products (name, name_ko, price, description, category, stock, is_available, images) VALUES (?,?,?,?,?,?,?,?)')
                ->execute([$name, $name_ko, $price, $description, $category, $stock, $is_available, $images_json]);
            $msg = '등록되었습니다.';
        }
    }
}

$products = $pdo->query('SELECT * FROM products ORDER BY id DESC')->fetchAll();

$CATS = ['outerwear','tops','bottoms','dresses','accessories','etc'];

// 편집 대상 (쿼리스트링 ?edit=id)
$editProduct = null;
if (isset($_GET['edit'])) {
    $ep = $pdo->prepare('SELECT * FROM products WHERE id=?');
    $ep->execute([(int)$_GET['edit']]);
    $editProduct = $ep->fetch();
}
?><!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>상품 관리 — 아니아 어드민</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Courier New', monospace; background: #f5f5f5; color: #111; }
.admin-header { background: #000; color: #fff; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
.admin-header h1 { font-size: 14px; letter-spacing: .1em; }
.admin-header nav a { color: #fff; text-decoration: none; font-size: 12px; margin-left: 24px; opacity: .7; }
.admin-header nav a:hover { opacity: 1; }
.admin-main { max-width: 1100px; margin: 32px auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 360px; gap: 32px; }
h2 { font-size: 13px; letter-spacing: .08em; margin-bottom: 16px; }
.msg { background: #e8f5e9; border: 1px solid #a5d6a7; padding: 10px 14px; font-size: 12px; margin-bottom: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; }
th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; }
th { background: #f9f9f9; font-weight: 600; }
tr:hover td { background: #fafafa; }
.btn { display: inline-block; padding: 5px 12px; font-size: 11px; border: none; cursor: pointer; font-family: inherit; text-decoration: none; }
.btn-edit { background: #000; color: #fff; }
.btn-del { background: #c00; color: #fff; }
.btn-del:hover { background: #900; }
.form-box { background: #fff; border: 1px solid #e0e0e0; padding: 24px; position: sticky; top: 24px; }
.form-field { margin-bottom: 14px; }
.form-field label { display: block; font-size: 11px; color: #888; margin-bottom: 4px; letter-spacing: .06em; }
.form-field input, .form-field select, .form-field textarea {
    width: 100%; padding: 8px 10px; border: 1px solid #ccc; font-family: inherit; font-size: 12px;
}
.form-field textarea { height: 80px; resize: vertical; }
.check-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.submit-btn { width: 100%; padding: 10px; background: #000; color: #fff; border: none; font-family: inherit; font-size: 12px; cursor: pointer; letter-spacing: .06em; }
.submit-btn:hover { background: #333; }
.new-btn { display: inline-block; padding: 8px 16px; background: #fff; border: 1px solid #000; font-size: 11px; text-decoration: none; margin-bottom: 16px; }
.new-btn:hover { background: #000; color: #fff; }
.img-preview { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.img-preview img { width: 60px; height: 60px; object-fit: cover; border: 1px solid #ddd; }
</style>
</head>
<body>
<div class="admin-header">
  <h1>아니아 ADMIN — 상품 관리</h1>
  <nav>
    <a href="/admin/">대시보드</a>
    <a href="/admin/products.php">상품관리</a>
    <a href="/admin/members.php">회원관리</a>
    <a href="/index.html">사이트 보기</a>
    <a href="/api/auth.php?action=logout">로그아웃</a>
  </nav>
</div>
<div class="admin-main">
  <div>
    <h2>상품 목록</h2>
    <?php if ($msg): ?><div class="msg"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
    <a href="/admin/products.php" class="new-btn">+ 새 상품 등록</a>
    <table>
      <thead><tr><th>ID</th><th>상품명</th><th>카테고리</th><th>가격</th><th>재고</th><th>판매</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($products as $p): ?>
        <tr>
          <td><?= $p['id'] ?></td>
          <td><?= htmlspecialchars($p['name']) ?><br><small style="color:#888"><?= htmlspecialchars($p['name_ko'] ?? '') ?></small></td>
          <td><?= htmlspecialchars($p['category']) ?></td>
          <td><?= number_format($p['price']) ?>원</td>
          <td><?= $p['stock'] ?></td>
          <td><?= $p['is_available'] ? '✓' : '✗' ?></td>
          <td>
            <a href="/admin/products.php?edit=<?= $p['id'] ?>" class="btn btn-edit">수정</a>
            <form method="post" style="display:inline" onsubmit="return confirm('삭제하시겠습니까?')">
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="id" value="<?= $p['id'] ?>">
              <button type="submit" class="btn btn-del">삭제</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- 등록/수정 폼 -->
  <div>
    <h2><?= $editProduct ? '상품 수정' : '새 상품 등록' ?></h2>
    <div class="form-box">
      <form method="post" enctype="multipart/form-data">
        <input type="hidden" name="action" value="save">
        <?php if ($editProduct): ?>
          <input type="hidden" name="id" value="<?= $editProduct['id'] ?>">
        <?php endif; ?>

        <div class="form-field">
          <label>상품명 (영문) *</label>
          <input type="text" name="name" value="<?= htmlspecialchars($editProduct['name'] ?? '') ?>" required>
        </div>
        <div class="form-field">
          <label>상품명 (한글)</label>
          <input type="text" name="name_ko" value="<?= htmlspecialchars($editProduct['name_ko'] ?? '') ?>">
        </div>
        <div class="form-field">
          <label>가격 (원)</label>
          <input type="number" name="price" value="<?= $editProduct['price'] ?? 0 ?>" min="0" step="100">
        </div>
        <div class="form-field">
          <label>카테고리</label>
          <select name="category">
            <?php foreach ($CATS as $c): ?>
              <option value="<?= $c ?>" <?= ($editProduct['category'] ?? 'etc') === $c ? 'selected' : '' ?>><?= strtoupper($c) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="form-field">
          <label>재고</label>
          <input type="number" name="stock" value="<?= $editProduct['stock'] ?? 100 ?>" min="0">
        </div>
        <div class="form-field">
          <div class="check-row">
            <input type="checkbox" name="is_available" id="avail" <?= ($editProduct['is_available'] ?? 1) ? 'checked' : '' ?>>
            <label for="avail" style="color:#111;font-size:12px;">판매 중</label>
          </div>
        </div>
        <div class="form-field">
          <label>설명</label>
          <textarea name="description"><?= htmlspecialchars($editProduct['description'] ?? '') ?></textarea>
        </div>
        <div class="form-field">
          <label>이미지 URL (줄바꿈으로 구분)</label>
          <?php
            $imgs = [];
            if (!empty($editProduct['images'])) {
                $imgs = json_decode($editProduct['images'], true) ?: [];
            }
          ?>
          <textarea name="images" id="images-ta"><?= htmlspecialchars(implode("\n", $imgs)) ?></textarea>
          <div class="img-preview" id="img-preview">
            <?php foreach ($imgs as $img): ?>
              <img src="<?= htmlspecialchars($img) ?>" onerror="this.style.display='none'">
            <?php endforeach; ?>
          </div>
        </div>

        <!-- 이미지 업로드 -->
        <div class="form-field">
          <label>이미지 파일 업로드</label>
          <input type="file" name="upload_file" accept="image/*" id="upload-file">
          <button type="button" class="btn btn-edit" style="margin-top:6px;width:100%" onclick="uploadImage()">업로드</button>
          <p id="upload-msg" style="font-size:11px;color:#888;margin-top:4px"></p>
        </div>

        <button type="submit" class="submit-btn"><?= $editProduct ? '수정 저장' : '등록하기' ?></button>
      </form>
    </div>
  </div>
</div>

<script>
async function uploadImage() {
  const file = document.getElementById('upload-file').files[0];
  if (!file) { alert('파일을 선택해주세요.'); return; }
  const fd = new FormData();
  fd.append('file', file);
  const msg = document.getElementById('upload-msg');
  msg.textContent = '업로드 중...';
  const res = await fetch('/api/upload.php', { method: 'POST', body: fd, credentials: 'same-origin' });
  const json = await res.json();
  if (json.ok) {
    const ta = document.getElementById('images-ta');
    ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + json.data.url;
    msg.textContent = '업로드 완료: ' + json.data.url;
    // 미리보기 추가
    const preview = document.getElementById('img-preview');
    const img = document.createElement('img');
    img.src = json.data.url;
    img.style.cssText = 'width:60px;height:60px;object-fit:cover;border:1px solid #ddd';
    img.onerror = () => img.style.display = 'none';
    preview.appendChild(img);
  } else {
    msg.textContent = '오류: ' + (json.error || '업로드 실패');
  }
}
</script>
</body>
</html>
