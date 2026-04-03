import Link from 'next/link';
import styles from './Nav.module.css';

interface NavProps {
  onHamburgerClick: () => void;
}

export default function Nav({ onHamburgerClick }: NavProps) {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navLeft}>
        <li><Link href="/shop">SHOP</Link></li>
        <li><Link href="/shop?category=tops">SS</Link></li>
        <li><Link href="#">HOUSE</Link></li>
        <li><Link href="#">COLLECTION</Link></li>
        <li><Link href="#">STOCKIST</Link></li>
        <li><Link href="#">SEARCH</Link></li>
      </ul>

      <div className={styles.navRight}>
        <Link href="/mypage">MYPAGE</Link>
        <Link href="#">BAG (0)</Link>
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
