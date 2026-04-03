'use client';

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"]';

export default function CustomCursor() {
  const shipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ship = shipRef.current;
    if (!ship) return;

    let visible = false;

    function onMove(e: MouseEvent) {
      if (!visible) {
        visible = true;
        ship!.style.opacity = '1';
      }
      ship!.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

      const isPointer = !!(e.target as HTMLElement).closest(INTERACTIVE);
      ship!.classList.toggle(styles.pointer, isPointer);
    }

    function onLeave() {
      visible = false;
      ship!.style.opacity = '0';
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <div ref={shipRef} className={styles.ship} aria-hidden />;
}
