import Link from 'next/link';
import Image from 'next/image';
import styles from './LogoBar.module.css';

export default function LogoBar() {
  return (
    <div className={styles.bar}>
      <Link href="/?nopopup=1">
        <Image
          src="/assets/logo-light-on.png"
          alt="아니아"
          height={176}
          width={448}
          priority
          className={styles.logo}
        />
      </Link>
    </div>
  );
}
