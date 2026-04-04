// ─────────────────────────────────────────
// 아니아 — Site Config & API base
// ─────────────────────────────────────────
const API = '/api';

const SITE = {
  brand: '아니아',
  season: '26 F/W',
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
      { label: 'TOPS',        href: '/shop.html?category=tops' },
      { label: 'BOTTOMS',     href: '/shop.html?category=bottoms' },
      { label: 'DRESSES',     href: '/shop.html?category=dresses' },
      { label: 'ACCESSORIES', href: '/shop.html?category=accessories' },
    ],
  },
};

const _DEFAULT_PRODUCTS = [
  { id:1, name:'SATIN BLOUSE SET',    name_ko:'새틴 블라우스 세트', price:298000, images:['/assets/products/satin-blouse-set.jpeg'],  category:'tops',        is_available:1, stock:10 },
  { id:2, name:'TRACK JACKET MINT',   name_ko:'트랙 재킷 민트',    price:198000, images:['/assets/products/track-jacket-mint.jpeg'],  category:'outerwear',   is_available:1, stock:5  },
  { id:3, name:'LEATHER GLOVES GREEN',name_ko:'그린 레더 글러브',  price:89000,  images:['/assets/products/leather-gloves-green.jpeg'],category:'accessories', is_available:1, stock:20 },
  { id:4, name:'HAIR CLIP SET',        name_ko:'헤어 클립 세트',   price:45000,  images:['/assets/products/hair-clip-set.png'],        category:'accessories', is_available:1, stock:30 },
  { id:5, name:'EDITORIAL LOOK 01',   name_ko:'에디토리얼 룩 01', price:550000, images:['/assets/products/editorial-look-01.jpeg'],  category:'etc',         is_available:1, stock:3  },
  { id:6, name:'GUIDE BOOK',           name_ko:'지구인 가이드',    price:0,      images:['/assets/products/guide-book.png'],           category:'etc',         is_available:0, stock:0  },
];

// DB 없이 로컬 관리: admin-local.html이 localStorage의 'aniaLocalProducts'에 저장
// API 사용 불가 시 localStorage → 기본 시드 순으로 폴백
const SEED_PRODUCTS = (function () {
  try {
    const local = JSON.parse(localStorage.getItem('aniaLocalProducts') || '[]');
    return local.length ? local : _DEFAULT_PRODUCTS;
  } catch { return _DEFAULT_PRODUCTS; }
})();

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
