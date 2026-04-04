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
      { label: 'COLLECTION', href: '#' },
      { label: 'ABOUT',      href: '#' },
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

const SEED_PRODUCTS = [
  { id:1, name:'SATIN BLOUSE SET',    name_ko:'새틴 블라우스 세트', price:298000, images:['/assets/products/satin-blouse-set.jpeg'],  category:'tops',        is_available:1, stock:10 },
  { id:2, name:'TRACK JACKET MINT',   name_ko:'트랙 재킷 민트',    price:198000, images:['/assets/products/track-jacket-mint.jpeg'],  category:'outerwear',   is_available:1, stock:5  },
  { id:3, name:'LEATHER GLOVES GREEN',name_ko:'그린 레더 글러브',  price:89000,  images:['/assets/products/leather-gloves-green.jpeg'],category:'accessories', is_available:1, stock:20 },
  { id:4, name:'HAIR CLIP SET',        name_ko:'헤어 클립 세트',   price:45000,  images:['/assets/products/hair-clip-set.png'],        category:'accessories', is_available:1, stock:30 },
  { id:5, name:'EDITORIAL LOOK 01',   name_ko:'에디토리얼 룩 01', price:550000, images:['/assets/products/editorial-look-01.jpeg'],  category:'etc',         is_available:1, stock:3  },
  { id:6, name:'GUIDE BOOK',           name_ko:'지구인 가이드',    price:0,      images:['/assets/products/guide-book.png'],           category:'etc',         is_available:0, stock:0  },
];

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
