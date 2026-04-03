'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHOP_SUB = ['ALL', 'OUTERWEAR', 'TOPS', 'BOTTOMS', 'DRESSES', 'ACCESSORIES'] as const;

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const [shopOpen, setShopOpen] = useState(true);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      aria-hidden={!isOpen}
    >
      <button className={styles.closeBtn} onClick={onClose} aria-label="메뉴 닫기">
        ✕
      </button>

      <nav className={styles.menu}>
        {/* SHOP (expandable) */}
        <div className={styles.group}>
          <button
            className={styles.menuItem}
            onClick={() => setShopOpen((v) => !v)}
          >
            SHOP
            <span className={styles.toggle}>{shopOpen ? '—' : '+'}</span>
          </button>
          {shopOpen && (
            <ul className={styles.subList}>
              {SHOP_SUB.map((cat) => (
                <li key={cat}>
                  <Link
                    href={cat === 'ALL' ? '/shop' : `/shop?category=${cat.toLowerCase()}`}
                    className={styles.subItem}
                    onClick={onClose}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Other top-level items */}
        {(['SS', 'HOUSE', 'COLLECTION', 'STOCKIST'] as const).map((item) => (
          <Link key={item} href="#" className={styles.menuItem} onClick={onClose}>
            {item}
          </Link>
        ))}

        <hr className={styles.divider} />

        <Link href="#" className={styles.menuItem} onClick={onClose}>CONTACT</Link>
        <Link href="#" className={styles.menuItem} onClick={onClose}>INSTAGRAM</Link>

        <hr className={styles.divider} />

        <Link href="/login" className={styles.menuItem} onClick={onClose}>로그인</Link>
        <Link href="/signup" className={styles.menuItem} onClick={onClose}>회원가입</Link>
        <Link href="/mypage" className={styles.menuItem} onClick={onClose}>마이페이지</Link>

        <hr className={styles.divider} />

        <Link href="#" className={styles.menuItem} onClick={onClose}>SEARCH</Link>
      </nav>
    </div>
  );
}
