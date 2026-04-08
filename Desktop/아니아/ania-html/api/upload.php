<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['file'])) {
    json_err('파일이 없습니다.');
}

$file     = $_FILES['file'];
$allowed  = ['image/jpeg','image/png','image/webp','image/gif'];
$mime     = mime_content_type($file['tmp_name']);

if (!in_array($mime, $allowed)) json_err('이미지 파일만 업로드 가능합니다.');
if ($file['size'] > 50 * 1024 * 1024) json_err('파일 크기는 50MB 이하여야 합니다.');

$ext   = match($mime) { 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', default => 'gif' };
$name  = bin2hex(random_bytes(16)) . '.' . $ext;
$dir   = __DIR__ . '/../assets/uploads/';

if (!is_dir($dir)) mkdir($dir, 0755, true);

if (!move_uploaded_file($file['tmp_name'], $dir . $name)) {
    json_err('파일 저장 실패', 500);
}

json_ok(['url' => '/assets/uploads/' . $name]);
