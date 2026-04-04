// ─────────────────────────────────────────
// 아니아 — Nav + Hamburger + Search
// ─────────────────────────────────────────
(function () {
  // ── Inject nav HTML ──
  const navPh = document.getElementById('nav-placeholder');
  if (navPh) {
    navPh.innerHTML = `
<nav class="nav" style="background:${SITE.nav.bg}">
  <ul class="nav-left">
    ${SITE.nav.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
    <li><button class="nav-search-btn" id="search-open-btn">SEARCH</button></li>
  </ul>
  <div class="nav-right">
    <a href="/mypage.html" id="nav-mypage-link">MYPAGE</a>
    <a href="#">BAG (0)</a>
    <button class="hamburger" id="hamburger-btn" aria-label="메뉴 열기">☰</button>
  </div>
</nav>`;
  }

  // ── Inject hamburger HTML ──
  const hPh = document.getElementById('hamburger-placeholder');
  if (hPh) {
    const subs = SITE.nav.shopSubs.map(s => `<a href="${s.href}">${s.label}</a>`).join('');
    hPh.innerHTML = `
<div class="hamburger-overlay" id="hamburger-menu">
  <button class="hamburger-close" id="hamburger-close">✕</button>
  <div class="h-menu">
    <button class="h-menu-item" id="shop-toggle">SHOP <span id="shop-toggle-icon">—</span></button>
    <div class="h-sub open" id="shop-sub">${subs}</div>
    <a href="#" class="h-menu-item">SS</a>
    <a href="#" class="h-menu-item">HOUSE</a>
    <a href="#" class="h-menu-item">COLLECTION</a>
    <a href="#" class="h-menu-item">STOCKIST</a>
    <hr class="h-divider">
    <a href="#" class="h-menu-item">CONTACT</a>
    <a href="#" class="h-menu-item">INSTAGRAM</a>
    <hr class="h-divider">
    <a href="/login.html"  class="h-menu-item">로그인</a>
    <a href="/signup.html" class="h-menu-item">회원가입</a>
    <a href="/mypage.html" class="h-menu-item">마이페이지</a>
    <hr class="h-divider">
    <button class="h-menu-item" id="h-search-btn">SEARCH</button>
  </div>
</div>`;
  }

  // ── Inject logo bar ──
  const logoPh = document.getElementById('logo-placeholder');
  if (logoPh) {
    logoPh.innerHTML = `
<div class="logo-bar">
  <a href="/index.html?nopopup=1">
    <img src="/assets/logo-light-on.png" alt="아니아" height="176">
  </a>
</div>`;
  }

  // ── Inject search modal ──
  const searchHtml = `
<div class="search-overlay" id="search-overlay" style="display:none">
  <div class="search-modal">
    <div class="search-input-row">
      <span>🔍</span>
      <input class="search-input" id="search-input" placeholder="상품명으로 검색..." autocomplete="off">
      <button class="search-close" id="search-close-btn">✕</button>
    </div>
    <p class="search-status" id="search-status" style="display:none"></p>
    <ul class="search-results" id="search-results"></ul>
  </div>
</div>`;
  document.body.insertAdjacentHTML('beforeend', searchHtml);

  // ── Wire events (after DOM injected) ──
  function $(id) { return document.getElementById(id); }

  // Hamburger open/close
  const menu = $('hamburger-menu');
  function openMenu()  { menu && menu.classList.add('open'); }
  function closeMenu() { menu && menu.classList.remove('open'); }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'hamburger-btn')  openMenu();
    if (e.target.id === 'hamburger-close') closeMenu();
  });

  // Shop accordion
  const shopSub = $('shop-sub');
  const shopIcon = $('shop-toggle-icon');
  document.addEventListener('click', (e) => {
    if (e.target.id === 'shop-toggle' || e.target.closest('#shop-toggle')) {
      shopSub && shopSub.classList.toggle('open');
      if (shopIcon) shopIcon.textContent = shopSub.classList.contains('open') ? '—' : '+';
    }
  });

  // Escape closes menu & search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); closeSearch(); }
  });

  // ── Search ──
  const searchOverlay = $('search-overlay');
  const searchInput   = $('search-input');
  const searchStatus  = $('search-status');
  const searchResults = $('search-results');
  let searchTimer;

  function openSearch()  { if (searchOverlay) { searchOverlay.style.display='flex'; searchInput && searchInput.focus(); } }
  function closeSearch() { if (searchOverlay) { searchOverlay.style.display='none'; if(searchInput) searchInput.value=''; if(searchResults) searchResults.innerHTML=''; } }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'search-open-btn' || e.target.id === 'h-search-btn') { closeMenu(); openSearch(); }
    if (e.target.id === 'search-close-btn') closeSearch();
    if (e.target.id === 'search-overlay') closeSearch();
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => doSearch(searchInput.value), 280);
    });
  }

  async function doSearch(q) {
    if (!q.trim()) { searchResults.innerHTML=''; searchStatus.style.display='none'; return; }
    searchStatus.textContent = '검색 중...'; searchStatus.style.display='block';
    searchResults.innerHTML = '';

    const res = await apiFetch(`${API}/products.php?action=search&q=${encodeURIComponent(q)}`);
    searchStatus.style.display = 'none';

    if (!res.ok || !res.data.length) {
      searchStatus.textContent = '검색 결과가 없습니다.';
      searchStatus.style.display = 'block';
      // Fallback: search seed data
      const matches = SEED_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.name_ko && p.name_ko.includes(q))
      );
      if (matches.length) renderSearchResults(matches);
      return;
    }
    renderSearchResults(res.data);
  }

  function renderSearchResults(items) {
    searchResults.innerHTML = items.map(p => {
      const img = (p.images && p.images.length) ? (typeof p.images === 'string' ? JSON.parse(p.images)[0] : p.images[0]) : '';
      return `<li>
        <a href="/product.html?id=${p.id}" class="search-result-item" onclick="closeSearch()">
          <div class="search-thumb">${img ? `<img src="${img}" alt="">` : ''}</div>
          <div class="search-info">
            <span class="search-name-ko">${p.name_ko || p.name}</span>
            <span class="search-name-en">${p.name}</span>
            <span class="search-price">${fmtPrice(p.price)}</span>
          </div>
        </a>
      </li>`;
    }).join('');
  }

  // Auth state — update nav
  (async () => {
    const res = await apiFetch(`${API}/auth.php?action=check`);
    const mypageLink = $('nav-mypage-link');
    if (res.ok && res.data && mypageLink) {
      mypageLink.textContent = res.data.name ? res.data.name.split(' ')[0] : 'MYPAGE';
    }
  })();
})();
