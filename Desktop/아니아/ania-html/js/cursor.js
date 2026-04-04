// ─────────────────────────────────────────
// 아니아 — Spaceship cursor overlay
// ─────────────────────────────────────────
(function () {
  const ship = document.getElementById('ship-cursor');
  if (!ship) return;

  const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"]';
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    if (!visible) { visible = true; ship.style.opacity = '1'; }
    ship.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    const isPointer = !!(e.target).closest(INTERACTIVE);
    ship.classList.toggle('glow', isPointer);
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    ship.style.opacity = '0';
  });
})();
