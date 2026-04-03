'use client';

import Image from 'next/image';
import { useDraggable } from '@/hooks/useDraggable';
import styles from './XpPopup.module.css';

interface XpPopupProps {
  onClose: () => void;
}

export default function XpPopup({ onClose }: XpPopupProps) {
  const { containerRef, handleRef } = useDraggable();

  return (
    <div className={styles.overlay}>
      <div ref={containerRef} className={styles.window}>

        {/* Title bar — drag handle */}
        <div ref={handleRef} className={styles.titlebar}>
          <div className={styles.titleLabel}>
            <span className={styles.titleIcon}>👾</span>
            아니아.exe — 경고 / Warning
          </div>
          <div className={styles.chromeBtns} data-no-drag>
            <button className={`${styles.chromeBtn} ${styles.min}`} aria-label="최소화">
              &#x2212;
            </button>
            <button className={`${styles.chromeBtn} ${styles.max}`} aria-label="최대화">
              &#9633;
            </button>
            <button
              className={`${styles.chromeBtn} ${styles.close}`}
              onClick={onClose}
              aria-label="닫기"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <Image
            src="/assets/character-base.png"
            alt="아니아 캐릭터"
            width={115}
            height={144}
            className={styles.character}
            priority
          />
          <div className={styles.dialogContent}>
            <div className={styles.speechBubble}>
              <span className={styles.lineWarn}>⚠ 시스템 알림 / SYSTEM ALERT</span>
              <span className={styles.lineMain}>
                절대 바이러스 아닙니다.<br />
                제발 믿어주세요...<br />
                전 아니아입니다.
              </span>
              <span className={styles.lineSub}>
                👽 지구인으로 살아남기 가이드<br />
                GUIDE TO SURVIVING AS AN EARTHLING<br />
                <br />
                지구가 어려운 당신. 제가 필요합니다.<br />
                안내를 원할 시 설치하기를 눌러주세요.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={onClose}>
            설치하기 &#9654;
          </button>
        </div>

      </div>
    </div>
  );
}
