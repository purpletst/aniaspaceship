// ─────────────────────────────────────────
// 아니아 — XP Popup drag + close
// 표시 조건: localStorage 'aniaPopupSeen' 없을 때만 (브라우저 최초 방문)
// 로고 클릭 재방문 시 팝업 미표시 (세션/탭 무관)
// ─────────────────────────────────────────
(function () {
  const overlay = document.getElementById('popup-overlay');
  if (!overlay) return;

  // Already seen — remove from DOM immediately so it never blocks interaction
  if (sessionStorage.getItem('aniaPopupShown')) {
    overlay.remove();
    return;
  }

  const win = document.getElementById('popup-window');
  const bar = document.getElementById('popup-titlebar');
  if (!win || !bar) return;

  // Mark shown for this session only (clears when tab/window closes)
  sessionStorage.setItem('aniaPopupShown', '1');

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
