import Image from 'next/image';
import styles from './HeroPanel.module.css';

export default function HeroPanel() {
  return (
    <section className={styles.panel}>
      <Image
        src="/assets/hero-moodboard.png"
        alt=""
        fill
        className={styles.bgImg}
        aria-hidden
      />

      <div className={styles.inner}>
        <div className={styles.seasonTag}>26 F/W COLLECTION</div>

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
