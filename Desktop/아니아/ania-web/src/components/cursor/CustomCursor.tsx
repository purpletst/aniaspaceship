'use client';

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

/** Clickable element selector — cursor changes shape on these */
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"]';

export default function CustomCursor() {
  const shipRef    = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ship     = shipRef.current;
    const follower = followerRef.current;
    if (!ship || !follower) return;

    let mx = -200, my = -200;     // mouse position
    let fx = -200, fy = -200;     // follower lerp position
    let raf: number;
    let visible = false;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;

      if (!visible) {
        visible = true;
        ship!.style.opacity     = '1';
        follower!.style.opacity = '1';
      }

      // Main ship: immediate tracking
      ship!.style.transform = `translate(${mx}px, ${my}px)`;

      // Detect interactive element → swap pointer class
      const isPointer = !!(e.target as HTMLElement).closest(INTERACTIVE);
      ship!.classList.toggle(styles.pointer, isPointer);
      follower!.classList.toggle(styles.pointerFollower, isPointer);
    }

    function onLeave() {
      visible = false;
      ship!.style.opacity     = '0';
      follower!.style.opacity = '0';
    }

    function tick() {
      // Lerp follower at 10% per frame (~160ms lag at 60fps)
      fx += (mx - fx) * 0.10;
      fy += (my - fy) * 0.10;
      follower!.style.transform = `translate(${fx}px, ${fy}px)`;
      raf = requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Main cursor — ania ship */}
      <div ref={shipRef} className={styles.ship} aria-hidden />

      {/* Follower — ania character, lags behind */}
      <div ref={followerRef} className={styles.follower} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/character-base.png"
          alt=""
          className={styles.followerImg}
          draggable={false}
        />
      </div>
    </>
  );
}
