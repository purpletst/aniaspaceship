'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';
import styles from './Nav.module.css';

interface NavProps {
  onHamburgerClick: () => void;
  onSearchClick: () => void;
}

export default function Nav({ onHamburgerClick, onSearchClick }: NavProps) {
  const { nav } = siteConfig;

  return (
    <nav
      className={styles.nav}
      style={{ background: nav.background, color: nav.foreground, height: nav.height }}
    >
      <ul className={styles.navLeft}>
        {nav.links.map((link) => (
          <li key={link.label}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
        <li>
          <button className={styles.searchBtn} onClick={onSearchClick}>
            SEARCH
          </button>
        </li>
      </ul>

      <div className={styles.navRight}>
        {nav.rightLinks.map((link) => (
          <Link key={link.label} href={link.href}>{link.label}</Link>
        ))}
        <button
          className={styles.hamburger}
          onClick={onHamburgerClick}
          aria-label="메뉴 열기"
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
