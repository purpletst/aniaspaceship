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
    let offsetX = 0;
    let offsetY = 0;

    function onPointerDown(e: PointerEvent) {
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

      const rect = el.getBoundingClientRect();
      // Save where inside the element the pointer landed
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      isDragging = true;
      grip.setPointerCapture(e.pointerId);
      grip.style.cursor = 'grabbing';

      // Cancel any running CSS animation so its fill-mode doesn't override inline transform
      el.style.animation = 'none';
      el.style.position = 'fixed';
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.transform = 'none';
      el.style.margin = '0';
      e.preventDefault();
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return;
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
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
