// ─────────────────────────────────────────
// 아니아 — Unified Header + Hamburger + Search
// ─────────────────────────────────────────
(function () {
  // ── Inject unified header ──
  const headerPh = document.getElementById('header-placeholder');
  if (headerPh) {
    const mainLinks = SITE.nav.links.map(l =>
      `<li><a href="${l.href}">${l.label}</a></li>`
    ).join('');
    const subs = SITE.nav.shopSubs.map(s => `<a href="${s.href}">${s.label}</a>`).join('');

    headerPh.innerHTML = `
<header class="site-header" id="site-header">
  <!-- Desktop: left nav links / Mobile: hidden -->
  <ul class="nav-main-links">
    ${mainLinks}
    <li><button class="nav-search-btn" id="search-open-btn">SEARCH</button></li>
  </ul>

  <!-- Center logo (home button) -->
  <a href="/index.html" class="header-logo-link">
    <img src="/assets/logo-light-on.png" alt="아니아" class="header-logo-img">
  </a>

  <!-- Desktop: right user links / Mobile: left -->
  <div class="nav-user-links">
    <a href="/login.html" id="nav-auth-link" class="nav-auth-link">LOGIN</a>
    <a href="/cart.html" class="nav-cart">CART <span class="nav-cart-count">(0)</span></a>
  </div>

  <!-- Mobile only: hamburger (far right) -->
  <button class="hamburger" id="hamburger-btn" aria-label="메뉴 열기">☰</button>
</header>

<!-- Hamburger slide-in menu -->
<div class="hamburger-overlay" id="hamburger-menu">
  <button class="hamburger-close" id="hamburger-close">✕</button>
  <div class="h-menu">
    <button class="h-menu-item" id="shop-toggle">SHOP <span id="shop-toggle-icon">—</span></button>
    <div class="h-sub open" id="shop-sub">${subs}</div>
    <a href="/collection.html" class="h-menu-item">COLLECTION</a>
    <a href="/about.html" class="h-menu-item">ABOUT</a>
    <hr class="h-divider">
    <a href="#" class="h-menu-item">CONTACT</a>
    <a href="#" class="h-menu-item">INSTAGRAM</a>
    <hr class="h-divider">
    <a href="/cart.html" class="h-menu-item">장바구니 <span class="nav-cart-count">(0)</span></a>
    <hr class="h-divider">
    <a href="/login.html"  class="h-menu-item" id="h-auth-link">로그인</a>
    <a href="/signup.html" class="h-menu-item">회원가입</a>
    <a href="/mypage.html" class="h-menu-item" id="h-mypage-link" style="display:none">마이페이지</a>
    <hr class="h-divider">
    <button class="h-menu-item" id="h-search-btn">SEARCH</button>
  </div>
</div>`;
  }

  // ── Inject search modal ──
  document.body.insertAdjacentHTML('beforeend', `
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
</div>`);

  // ── Wire events ──
  function $(id) { return document.getElementById(id); }

  const menu = $('hamburger-menu');
  function openMenu()  { menu && menu.classList.add('open'); }
  function closeMenu() { menu && menu.classList.remove('open'); }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'hamburger-btn')   openMenu();
    if (e.target.id === 'hamburger-close') closeMenu();
  });

  // Shop accordion
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#shop-toggle');
    if (!toggle) return;
    const sub  = $('shop-sub');
    const icon = $('shop-toggle-icon');
    sub && sub.classList.toggle('open');
    if (icon) icon.textContent = sub.classList.contains('open') ? '—' : '+';
  });

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); closeSearch(); }
  });

  // ── Search ──
  const searchOverlay = $('search-overlay');
  const searchInput   = $('search-input');
  const searchStatus  = $('search-status');
  const searchResults = $('search-results');
  let searchTimer;

  function openSearch()  {
    if (!searchOverlay) return;
    searchOverlay.style.display = 'flex';
    searchInput && searchInput.focus();
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.style.display = 'none';
    if (searchInput)   searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
    if (searchStatus)  searchStatus.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'search-open-btn' || e.target.id === 'h-search-btn') {
      closeMenu(); openSearch();
    }
    if (e.target.id === 'search-close-btn') closeSearch();
    if (e.target.id === 'search-overlay')   closeSearch();
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => doSearch(searchInput.value), 280);
    });
  }

  async function doSearch(q) {
    if (!q.trim()) { searchResults.innerHTML = ''; searchStatus.style.display = 'none'; return; }
    searchStatus.textContent = '검색 중...'; searchStatus.style.display = 'block';
    searchResults.innerHTML = '';

    const res = await apiFetch(`${API}/products.php?action=search&q=${encodeURIComponent(q)}`);
    searchStatus.style.display = 'none';

    if (!res.ok || !res.data || !res.data.length) {
      const matches = SEED_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.name_ko && p.name_ko.includes(q))
      );
      if (matches.length) { renderSearchResults(matches); return; }
      searchStatus.textContent = '검색 결과가 없습니다.';
      searchStatus.style.display = 'block';
      return;
    }
    renderSearchResults(res.data);
  }

  function renderSearchResults(items) {
    searchResults.innerHTML = items.map(p => {
      const img = p.images && p.images.length
        ? (typeof p.images === 'string' ? JSON.parse(p.images)[0] : p.images[0])
        : '';
      return `<li>
        <a href="/product.html?id=${p.id}" class="search-result-item">
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

  // ── Cart badge ──
  if (typeof cartUpdateBadge === 'function') cartUpdateBadge();

  // ── Auth state: LOGIN ↔ MYPAGE ──
  (async () => {
    const res = await apiFetch(`${API}/auth.php?action=check`);
    const authLink     = $('nav-auth-link');
    const hAuthLink    = $('h-auth-link');
    const hMypageLink  = $('h-mypage-link');

    if (res.ok && res.data) {
      // Logged in
      const label = res.data.name ? res.data.name.split(' ')[0] : 'MYPAGE';
      if (authLink) { authLink.textContent = label; authLink.href = '/mypage.html'; }
      if (hAuthLink)   hAuthLink.style.display = 'none';
      if (hMypageLink) hMypageLink.style.display = 'block';
    }
    // Logged out: keep defaults (LOGIN → /login.html, mypage hidden in hamburger)
  })();
})();
