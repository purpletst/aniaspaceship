// ─────────────────────────────────────────
// 아니아 — Site Config & API base
// ─────────────────────────────────────────
const API = '/api';

const SITE = {
  brand: '아니아',
  brand_en: 'ANIA',
  season: '26 F/W',
  // ✏️ 사업자 정보 — 푸터/개인정보방침/약관에 공통 사용
  info: {
    ceo:        '강민서',
    license:    '501-04-31493',
    online_reg: '',   // 통신판매업신고번호 — 신고 후 입력
    address:    '서울특별시 서대문구 가재울미래로 2, 281호/201호',
    email:      'jihwan1124@gmail.com',
    phone:      '02-0000-0000',
    instagram:  'https://www.instagram.com/ania_not_ani/',
  },
  nav: {
    bg: '#fff',
    // ✏️ 메뉴 항목 편집: label에 텍스트 또는 <img> 태그 모두 사용 가능
    // 아이콘 예시: { label: '<img src="/assets/icons/shop.svg" alt="SHOP" height="16">', href: '/shop.html' }
    links: [
      { label: 'SHOP',       href: '/shop.html' },
      { label: 'COLLECTION', href: '/collection.html' },
      { label: 'ABOUT',      href: '/about.html' },
    ],
    shopSubs: [
      { label: 'ALL',         href: '/shop.html' },
      { label: 'OUTERWEAR',   href: '/shop.html?category=outerwear' },
      { label: 'TOP',        href: '/shop.html?category=top' },
      { label: 'BOTTOM',     href: '/shop.html?category=bottom' },
      { label: 'DRESS',     href: '/shop.html?category=dress' },
      { label: 'ACCESSORIES', href: '/shop.html?category=accessories' },
    ],
  },
};

const _DEFAULT_PRODUCTS = [
  { id:1, name:'SATIN BLOUSE SET',    name_ko:'새틴 블라우스 세트', price:298000, images:['/assets/products/satin-blouse-set.jpeg'],  detail_images:[], sizes:['XS','S','M','L','XL'], category:'tops',        is_available:1, stock:10 },
  { id:2, name:'TRACK JACKET MINT',   name_ko:'트랙 재킷 민트',    price:198000, images:['/assets/products/track-jacket-mint.jpeg'],  detail_images:[], sizes:['XS','S','M','L','XL'], category:'outerwear',   is_available:1, stock:5  },
  { id:3, name:'LEATHER GLOVES GREEN',name_ko:'그린 레더 글러브',  price:89000,  images:['/assets/products/leather-gloves-green.jpeg'],detail_images:[], sizes:['FREE'],               category:'accessories', is_available:1, stock:20 },
  { id:4, name:'HAIR CLIP SET',        name_ko:'헤어 클립 세트',   price:45000,  images:['/assets/products/hair-clip-set.png'],        detail_images:[], sizes:['FREE'],               category:'accessories', is_available:1, stock:30 },
  { id:5, name:'EDITORIAL LOOK 01',   name_ko:'에디토리얼 룩 01', price:550000, images:['/assets/products/editorial-look-01.jpeg'],  detail_images:[], sizes:['XS','S','M','L','XL'], category:'etc',         is_available:1, stock:3  },
  { id:6, name:'GUIDE BOOK',           name_ko:'지구인 가이드',    price:0,      images:['/assets/products/guide-book.png'],           detail_images:[], sizes:null,                    category:'etc',         is_available:0, stock:0  },
];

// DB 없이 로컬 관리: admin-local.html이 localStorage의 'aniaLocalProducts'에 저장
// API 사용 불가 시 localStorage → 기본 시드 순으로 폴백
const SEED_PRODUCTS = (function () {
  try {
    const local = JSON.parse(localStorage.getItem('aniaLocalProducts') || '[]');
    return local.length ? local : _DEFAULT_PRODUCTS;
  } catch { return _DEFAULT_PRODUCTS; }
})();

// ── 시즌 아카이브 (컬렉션 페이지) ────────────────────────────
// admin-seasons.html이 localStorage 'aniaLocalSeasons'에 저장
// 병합 규칙: localStorage 시즌 데이터 우선 사용;
//            photos 배열이 비어있는 시즌은 _DEFAULT_SEASONS의 기본 사진으로 보충
const _DEFAULT_SEASONS = [
  {
    slug:     '26fw',
    label:    '26 F/W',
    title:    '지구인으로 살아남기 가이드',
    title_en: 'GUIDE TO SURVIVING AS AN EARTHLING',
    photos:   [
      { url: '/assets/hero-moodboard.png',  caption: '26 F/W — 지구인으로 살아남기 가이드' },
      { url: '/assets/character-base.png',  caption: '아니아 캐릭터 — 26 F/W' },
    ],
  },
];
const SEASONS = (function () {
  try {
    const local = JSON.parse(localStorage.getItem('aniaLocalSeasons') || '[]');
    if (!local.length) return _DEFAULT_SEASONS;
    // photos 없는 시즌에 한해 기본 사진 보충 (slug 매칭)
    return local.map(function (s) {
      if (s.photos && s.photos.length) return s;
      var def = _DEFAULT_SEASONS.find(function (d) { return d.slug === s.slug; });
      return (def && def.photos.length) ? Object.assign({}, s, { photos: def.photos }) : s;
    });
  } catch { return _DEFAULT_SEASONS; }
})();

// ── 이미지 업로드 유틸리티 ────────────────────────────────
// 사용: const result = await uploadImage(file);
// 반환: { ok, url, source: 'server'|'base64', warning? }
//   - 서버(/api/upload.php) 업로드 우선 시도
//   - admin 세션 없거나 서버 오류 시 → base64 DataURL로 자동 폴백
const _UPLOAD_ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const _UPLOAD_MAX     = 50 * 1024 * 1024;  // 50 MB
const _BASE64_WARN    = 800 * 1024;         // 800 KB: localStorage 압박 경고 기준

async function uploadImage(file) {
  if (!file) return { ok: false, error: '파일이 없습니다.' };
  if (!_UPLOAD_ALLOWED.includes(file.type)) {
    return { ok: false, error: 'JPEG / PNG / WEBP / GIF 이미지만 업로드 가능합니다.' };
  }
  if (file.size > _UPLOAD_MAX) {
    return { ok: false, error: `파일 크기는 10MB 이하여야 합니다. (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)` };
  }

  // 1차: 서버 업로드 시도 (/api/upload.php — admin 세션 필요)
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/upload.php`, { method: 'POST', credentials: 'same-origin', body: fd });
    if (res.ok) {
      const json = await res.json();
      if (json.ok) return { ok: true, url: json.data.url, source: 'server' };
    }
  } catch (_) { /* 네트워크 오류 → 폴백 */ }

  // 2차: base64 DataURL 폴백 (로컬/오프라인 상태, admin 미로그인)
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target.result;
      const warning = file.size > _BASE64_WARN
        ? `이미지가 브라우저 로컬에만 저장됩니다 (${(file.size / 1024).toFixed(0)}KB). 용량이 클수록 localStorage 한도를 초과할 위험이 있습니다.`
        : null;
      resolve({ ok: true, url, source: 'base64', warning });
    };
    reader.onerror = () => resolve({ ok: false, error: '파일 읽기에 실패했습니다.' });
    reader.readAsDataURL(file);
  });
}

function fmtPrice(n) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

function formatMobile(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
}

async function apiFetch(url, opts = {}) {
  try {
    const res = await fetch(url, { credentials: 'same-origin', ...opts });
    return await res.json();
  } catch {
    return { ok: false, error: '서버 연결 오류' };
  }
}

// ── Cart (localStorage 기반) ──────────────────────────────
function cartGet() {
  try { return JSON.parse(localStorage.getItem('aniaCart') || '[]'); } catch { return []; }
}
function cartSave(items) {
  localStorage.setItem('aniaCart', JSON.stringify(items));
  cartUpdateBadge();
}
function cartAdd(item) {
  const cart = cartGet();
  // 동일 상품+사이즈 있으면 수량 증가
  const existing = cart.find(c => c.id === item.id && c.size === item.size);
  if (existing) { existing.qty += 1; }
  else { cart.push({ ...item, qty: 1 }); }
  cartSave(cart);
}
function cartRemove(idx) {
  const cart = cartGet();
  cart.splice(idx, 1);
  cartSave(cart);
}
function cartTotal() {
  return cartGet().reduce((sum, c) => sum + c.price * c.qty, 0);
}
function cartCount() {
  return cartGet().reduce((sum, c) => sum + c.qty, 0);
}
function cartUpdateBadge() {
  const n = cartCount();
  document.querySelectorAll('.nav-cart-count').forEach(el => {
    el.textContent = n > 0 ? `(${n})` : '(0)';
  });
}
