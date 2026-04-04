// ─────────────────────────────────────────
// 아니아 — XP Popup drag + close
// ─────────────────────────────────────────
(function () {
  // sessionStorage: show once per browser session, clean URL (no ?nopopup=1)
  if (sessionStorage.getItem('popupShown')) return;

  const overlay = document.getElementById('popup-overlay');
  const win     = document.getElementById('popup-window');
  const bar     = document.getElementById('popup-titlebar');
  if (!overlay || !win || !bar) return;

  // Mark shown immediately so logo-click navigating back won't re-show
  sessionStorage.setItem('popupShown', '1');

  // Close
  document.querySelectorAll('.popup-close').forEach(btn => {
    btn.addEventListener('click', () => { overlay.remove(); });
  });

  // Drag
  let dragging = false, ox = 0, oy = 0;

  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-no-drag]')) return;
    const rect = win.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    dragging = true;
    bar.setPointerCapture(e.pointerId);
    win.style.animation = 'none';
    win.style.position = 'fixed';
    win.style.left = rect.left + 'px';
    win.style.top  = rect.top  + 'px';
    win.style.transform = 'none';
    win.style.margin = '0';
    bar.classList.add('grabbing');
    e.preventDefault();
  });

  bar.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    win.style.left = (e.clientX - ox) + 'px';
    win.style.top  = (e.clientY - oy) + 'px';
  });

  bar.addEventListener('pointerup', () => {
    dragging = false;
    bar.classList.remove('grabbing');
  });
})();
