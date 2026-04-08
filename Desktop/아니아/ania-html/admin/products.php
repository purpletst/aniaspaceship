<?php
session_start();
require_once __DIR__ . '/../api/db.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['is_admin'])) {
    header('Location: /login.html');
    exit;
}

$pdo = db();
$msg = '';
$ALL_SIZES = ['XS','S','M','L','XL','FREE'];

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

        // 대표 이미지
        $lines  = preg_split('/[\r\n,]+/', trim($_POST['images'] ?? ''));
        $images = array_values(array_filter(array_map('trim', $lines)));
        $images_json = json_encode($images, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // 상세 이미지
        $dlines  = preg_split('/[\r\n,]+/', trim($_POST['detail_images'] ?? ''));
        $detail_images = array_values(array_filter(array_map('trim', $dlines)));
        $detail_images_json = json_encode($detail_images, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // 사이즈
        $sizes_raw  = array_intersect($_POST['sizes'] ?? [], $ALL_SIZES);
        $sizes_json = count($sizes_raw)
            ? json_encode(array_values($sizes_raw), JSON_UNESCAPED_UNICODE)
            : 'null';

        if (!$name) {
            $msg = '상품명은 필수입니다.';
        } elseif ($id) {
            $pdo->prepare('UPDATE products SET name=?,name_ko=?,price=?,description=?,category=?,stock=?,is_available=?,images=?,detail_images=?,sizes=? WHERE id=?')
                ->execute([$name, $name_ko, $price, $description, $category, $stock, $is_available, $images_json, $detail_images_json, $sizes_json, $id]);
            $msg = '수정되었습니다.';
        } else {
            $pdo->prepare('INSERT INTO products (name,name_ko,price,description,category,stock,is_available,images,detail_images,sizes) VALUES (?,?,?,?,?,?,?,?,?,?)')
                ->execute([$name, $name_ko, $price, $description, $category, $stock, $is_available, $images_json, $detail_images_json, $sizes_json]);
            $msg = '등록되었습니다.';
        }
    }
}

$products = $pdo->query('SELECT * FROM products ORDER BY id DESC')->fetchAll();

$CATS = ['outerwear','tops','bottoms','dresses','accessories','etc'];

// 편집 대상
$editProduct = null;
$thumbnailImgs  = [];
$detailImgs     = [];
$savedSizes     = [];
if (isset($_GET['edit'])) {
    $ep = $pdo->prepare('SELECT * FROM products WHERE id=?');
    $ep->execute([(int)$_GET['edit']]);
    $editProduct = $ep->fetch();
    if ($editProduct) {
        $thumbnailImgs = json_decode($editProduct['images']        ?? '[]', true) ?: [];
        $detailImgs    = json_decode($editProduct['detail_images'] ?? '[]', true) ?: [];
        $savedSizes    = json_decode($editProduct['sizes']         ?? 'null', true) ?: [];
    }
}
function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
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
.admin-main { max-width: 1200px; margin: 32px auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
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
.form-box { background: #fff; border: 1px solid #e0e0e0; padding: 24px; position: sticky; top: 24px; max-height: calc(100vh - 60px); overflow-y: auto; }
.form-field { margin-bottom: 14px; }
.form-field > label { display: block; font-size: 11px; color: #888; margin-bottom: 4px; letter-spacing: .06em; }
.form-field input[type=text],
.form-field input[type=number],
.form-field select,
.form-field textarea {
    width: 100%; padding: 8px 10px; border: 1px solid #ccc; font-family: inherit; font-size: 12px;
}
.form-field textarea { height: 80px; resize: vertical; }
.check-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.submit-btn { width: 100%; padding: 10px; background: #000; color: #fff; border: none; font-family: inherit; font-size: 12px; cursor: pointer; letter-spacing: .06em; margin-top: 4px; }
.submit-btn:hover { background: #333; }
.new-btn { display: inline-block; padding: 8px 16px; background: #fff; border: 1px solid #000; font-size: 11px; text-decoration: none; margin-bottom: 16px; }
.new-btn:hover { background: #000; color: #fff; }
/* 이미지 그리드 */
.img-section-label { font-size: 11px; color: #888; letter-spacing: .06em; margin-bottom: 6px; display: block; }
.img-section-desc  { font-size: 10px; color: #aaa; margin-bottom: 8px; }
.prod-img-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; min-height: 20px; }
.prod-thumb-wrap { position: relative; }
.prod-thumb-wrap img { width: 64px; height: 64px; object-fit: cover; border: 1px solid #ddd; }
.prod-thumb-wrap button { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; background: #c00; color: #fff; border: none; border-radius: 50%; font-size: 10px; cursor: pointer; line-height: 18px; text-align: center; padding: 0; }
.img-add-btn { padding: 5px 12px; font-size: 10px; letter-spacing: .06em; border: 1px dashed #999; background: #fff; cursor: pointer; font-family: inherit; }
.img-add-btn:hover { border-color: #222; background: #f5f5f5; }
.upload-msg { font-size: 10px; color: #888; margin-top: 4px; display: block; min-height: 14px; }
.img-section-divider { border: none; border-top: 1px solid #f0f0f0; margin: 16px 0; }
/* 사이즈 체크박스 */
.size-checks { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.size-check-label { display: flex; align-items: center; gap: 4px; font-size: 11px; cursor: pointer; padding: 4px 8px; border: 1px solid #ccc; }
.size-check-label input { margin: 0; }
.size-check-label:has(input:checked) { border-color: #000; background: #000; color: #fff; }
</style>
</head>
<body>
<div class="admin-header">
  <h1>아니아 ADMIN — 상품 관리</h1>
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
  <div>
    <h2>상품 목록</h2>
    <?php if ($msg): ?><div class="msg"><?= esc($msg) ?></div><?php endif; ?>
    <a href="/admin/products.php" class="new-btn">+ 새 상품 등록</a>
    <table>
      <thead>
        <tr><th>ID</th><th>썸네일</th><th>상품명</th><th>카테고리</th><th>가격</th><th>사이즈</th><th>재고</th><th>판매</th><th></th></tr>
      </thead>
      <tbody>
      <?php foreach ($products as $p):
        $pImgs  = json_decode($p['images'] ?? '[]', true) ?: [];
        $pSizes = json_decode($p['sizes'] ?? 'null', true);
        $thumb  = $pImgs[0] ?? '';
      ?>
        <tr>
          <td><?= $p['id'] ?></td>
          <td><?= $thumb ? '<img src="' . esc($thumb) . '" style="width:40px;height:40px;object-fit:cover;border:1px solid #e0e0e0" onerror="this.style.display=\'none\'">' : '—' ?></td>
          <td><?= esc($p['name']) ?><br><small style="color:#888"><?= esc($p['name_ko'] ?? '') ?></small></td>
          <td><?= esc($p['category']) ?></td>
          <td><?= number_format($p['price']) ?>원</td>
          <td style="font-size:10px"><?= $pSizes ? implode(' ', $pSizes) : '—' ?></td>
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
      <form method="post">
        <input type="hidden" name="action" value="save">
        <?php if ($editProduct): ?>
          <input type="hidden" name="id" value="<?= $editProduct['id'] ?>">
        <?php endif; ?>

        <div class="form-field">
          <label>상품명 (영문) *</label>
          <input type="text" name="name" value="<?= esc($editProduct['name'] ?? '') ?>" required>
        </div>
        <div class="form-field">
          <label>상품명 (한글)</label>
          <input type="text" name="name_ko" value="<?= esc($editProduct['name_ko'] ?? '') ?>">
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
          <textarea name="description"><?= esc($editProduct['description'] ?? '') ?></textarea>
        </div>

        <!-- 사이즈 선택 -->
        <div class="form-field">
          <label>판매 사이즈</label>
          <p class="img-section-desc">선택 안 함 = 전체 사이즈 표시</p>
          <div class="size-checks">
            <?php foreach ($ALL_SIZES as $sz): ?>
              <label class="size-check-label">
                <input type="checkbox" name="sizes[]" value="<?= $sz ?>"
                  <?= in_array($sz, $savedSizes) ? 'checked' : '' ?>>
                <?= $sz ?>
              </label>
            <?php endforeach; ?>
          </div>
        </div>

        <hr class="img-section-divider">

        <!-- 대표 이미지 -->
        <div class="form-field">
          <span class="img-section-label">대표 이미지</span>
          <p class="img-section-desc">쇼핑몰 목록 + 상품 페이지 상단에 표시</p>
          <div id="thumb-grid" class="prod-img-grid"></div>
          <input type="file" id="thumb-file" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none">
          <button type="button" class="img-add-btn" onclick="document.getElementById('thumb-file').click()">+ 이미지 추가</button>
          <span class="upload-msg" id="thumb-msg"></span>
          <textarea name="images" id="images-ta" style="display:none"></textarea>
        </div>

        <!-- 상세 이미지 -->
        <div class="form-field">
          <span class="img-section-label">상세 이미지</span>
          <p class="img-section-desc">상품 페이지 하단 스크롤 시 표시 (에디토리얼)</p>
          <div id="detail-grid" class="prod-img-grid"></div>
          <input type="file" id="detail-file" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none">
          <button type="button" class="img-add-btn" onclick="document.getElementById('detail-file').click()">+ 이미지 추가</button>
          <span class="upload-msg" id="detail-msg"></span>
          <textarea name="detail_images" id="detail-images-ta" style="display:none"></textarea>
        </div>

        <button type="submit" class="submit-btn"><?= $editProduct ? '수정 저장' : '등록하기' ?></button>
      </form>
    </div>
  </div>
</div>

<script>
let thumbImages  = <?= json_encode($thumbnailImgs, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
let detailImages = <?= json_encode($detailImgs,    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;

// 공통 렌더 함수
function renderGrid(gridId, arr, taId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = arr.map((url, i) => `
    <div class="prod-thumb-wrap">
      <img src="${url}" onerror="this.style.display='none'">
      <button type="button" onclick="removeImg('${gridId}',${i})">✕</button>
    </div>`).join('') || '';
  document.getElementById(taId).value = arr.join('\n');
}

function removeImg(gridId, i) {
  const arr = gridId === 'thumb-grid' ? thumbImages : detailImages;
  arr.splice(i, 1);
  const taId = gridId === 'thumb-grid' ? 'images-ta' : 'detail-images-ta';
  renderGrid(gridId, arr, taId);
}

// 파일 업로드 공통 핸들러
async function handleUpload(file, gridId, arr, taId, msgId) {
  const msg = document.getElementById(msgId);
  msg.textContent = '업로드 중...';
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res  = await fetch('/api/upload.php', { method: 'POST', body: fd, credentials: 'same-origin' });
    const json = await res.json();
    if (json.ok) {
      arr.push(json.data.url);
      renderGrid(gridId, arr, taId);
      msg.textContent = '완료';
      return;
    }
    msg.textContent = json.error || '업로드 실패';
  } catch (_) {
    msg.textContent = '업로드 실패 — 관리자 로그인 상태인지 확인하세요.';
  }
}

document.getElementById('thumb-file').addEventListener('change', function() {
  if (!this.files[0]) return;
  handleUpload(this.files[0], 'thumb-grid', thumbImages, 'images-ta', 'thumb-msg');
  this.value = '';
});

document.getElementById('detail-file').addEventListener('change', function() {
  if (!this.files[0]) return;
  handleUpload(this.files[0], 'detail-grid', detailImages, 'detail-images-ta', 'detail-msg');
  this.value = '';
});

// 초기 렌더
renderGrid('thumb-grid',  thumbImages,  'images-ta');
renderGrid('detail-grid', detailImages, 'detail-images-ta');
</script>
</body>
</html>
