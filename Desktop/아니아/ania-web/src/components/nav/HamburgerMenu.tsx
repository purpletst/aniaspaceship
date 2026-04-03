'use client';

import { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchClick: () => void;
}

export default function HamburgerMenu({ isOpen, onClose, onSearchClick }: HamburgerMenuProps) {
  const [shopOpen, setShopOpen] = useState(true);
  const { hamburger } = siteConfig;

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
              {hamburger.shopSubs.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.subItem} onClick={onClose}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top-level items */}
        {hamburger.topItems.map((item) => (
          <Link key={item.label} href={item.href} className={styles.menuItem} onClick={onClose}>
            {item.label}
          </Link>
        ))}

        <hr className={styles.divider} />

        {hamburger.bottomItems.map((item) => (
          <Link key={item.label} href={item.href} className={styles.menuItem} onClick={onClose}>
            {item.label}
          </Link>
        ))}

        <hr className={styles.divider} />

        <Link href="/login"   className={styles.menuItem} onClick={onClose}>로그인</Link>
        <Link href="/signup"  className={styles.menuItem} onClick={onClose}>회원가입</Link>
        <Link href="/mypage"  className={styles.menuItem} onClick={onClose}>마이페이지</Link>

        <hr className={styles.divider} />

        <button
          className={styles.menuItem}
          onClick={() => { onClose(); onSearchClick(); }}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0 }}
        >
          SEARCH
        </button>
      </nav>
    </div>
  );
}
