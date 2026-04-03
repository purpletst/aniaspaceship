'use client';

import { useRef, useEffect } from 'react';

export function useDraggable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const handle = handleRef.current;
    if (!container || !handle) return;

    // Local copies so TypeScript knows they're non-null inside callbacks
    const el = container;
    const grip = handle;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    function onPointerDown(e: PointerEvent) {
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

      isDragging = true;
      grip.setPointerCapture(e.pointerId);
      grip.style.cursor = 'grabbing';

      const rect = el.getBoundingClientRect();
      originLeft = rect.left;
      originTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;

      el.style.position = 'fixed';
      el.style.left = `${originLeft}px`;
      el.style.top = `${originTop}px`;
      el.style.transform = 'none';
      el.style.margin = '0';
      e.preventDefault();
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return;
      el.style.left = `${originLeft + e.clientX - startX}px`;
      el.style.top = `${originTop + e.clientY - startY}px`;
    }

    function onPointerUp() {
      isDragging = false;
      grip.style.cursor = 'grab';
    }

    grip.addEventListener('pointerdown', onPointerDown);
    grip.addEventListener('pointermove', onPointerMove);
    grip.addEventListener('pointerup', onPointerUp);

    return () => {
      grip.removeEventListener('pointerdown', onPointerDown);
      grip.removeEventListener('pointermove', onPointerMove);
      grip.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return { containerRef, handleRef };
}
