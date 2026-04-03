/**
 * siteConfig — 아니아 사이트 공통 설정
 *
 * 여기서 색상, 메뉴 이름, 경로를 한 곳에서 관리합니다.
 */

export const siteConfig = {
  brand: '아니아',
  season: '26 F/W',

  /** 상단 내비게이션 바 */
  nav: {
    background: '#000',   // ← 배경색 변경
    foreground: '#fff',   // ← 글씨색 변경
    height: '38px',

    /** 좌측 링크 */
    links: [
      { label: 'SHOP',       href: '/shop' },
      { label: 'SS',         href: '/shop?category=tops' },
      { label: 'HOUSE',      href: '#' },
      { label: 'COLLECTION', href: '#' },
      { label: 'STOCKIST',   href: '#' },
    ],

    /** 우측 링크 (검색 버튼 제외) */
    rightLinks: [
      { label: 'MYPAGE', href: '/mypage' },
      { label: 'BAG (0)', href: '#' },
    ],
  },

  /** 햄버거 메뉴 */
  hamburger: {
    shopSubs: [
      { label: 'ALL',         href: '/shop' },
      { label: 'OUTERWEAR',   href: '/shop?category=outerwear' },
      { label: 'TOPS',        href: '/shop?category=tops' },
      { label: 'BOTTOMS',     href: '/shop?category=bottoms' },
      { label: 'DRESSES',     href: '/shop?category=dresses' },
      { label: 'ACCESSORIES', href: '/shop?category=accessories' },
    ],
    topItems: [
      { label: 'SS',         href: '#' },
      { label: 'HOUSE',      href: '#' },
      { label: 'COLLECTION', href: '#' },
      { label: 'STOCKIST',   href: '#' },
    ],
    bottomItems: [
      { label: 'CONTACT',   href: '#' },
      { label: 'INSTAGRAM', href: '#' },
    ],
  },

  /** 메인 히어로 배너 */
  hero: {
    /** 영상 사용 시 '/assets/hero-video.mp4' 로 변경; 빈 문자열이면 이미지 사용 */
    videoSrc: '',
    imageSrc: '/assets/hero-moodboard.png',
    seasonTag: '26 F/W COLLECTION',
  },
} as const;
