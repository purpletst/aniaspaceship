import Image from 'next/image';
import { siteConfig } from '@/lib/siteConfig';
import styles from './HeroPanel.module.css';

export default function HeroPanel() {
  const { hero } = siteConfig;

  return (
    <section className={styles.panel}>
      {/* ── Background: video if heroSrc set, otherwise image ── */}
      {hero.videoSrc ? (
        <video
          className={styles.bgVideo}
          src={hero.videoSrc}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
      ) : (
        <Image
          src={hero.imageSrc}
          alt=""
          fill
          className={styles.bgImg}
          aria-hidden
        />
      )}

      {/* Circuit-board grid overlay (::before pseudo) */}

      <div className={styles.inner}>
        <div className={styles.seasonTag}>{hero.seasonTag}</div>

        <Image
          src="/assets/character-base.png"
          alt="아니아 캐릭터"
          width={175}
          height={219}
          className={styles.character}
          priority
        />

        <p className={styles.headline}>
          지구인으로 살아남기 가이드<br />
          <em>GUIDE TO SURVIVING</em><br />
          <em>AS AN EARTHLING</em>
        </p>

        <p className={styles.sub}>&#8594; SCROLL TO EXPLORE &#8594;</p>
      </div>
    </section>
  );
}
