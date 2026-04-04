(function () {
  const el = document.getElementById('ship-cursor');
  if (!el) return;

  // 오프셋: 커서 우상단 45° 방향 5mm ≒ 19px
  const OX = 19, OY = -19;

  document.addEventListener('pointermove', (e) => {
    el.style.transform = `translate(${e.clientX + OX}px, ${e.clientY + OY}px)`;
  });

  document.addEventListener('pointerleave', () => { el.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { el.style.opacity = '1'; });

  // Glow on interactive elements
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('a,button,[role=button]')) {
      el.classList.add('glow');
    } else {
      el.classList.remove('glow');
    }
  });
})();
