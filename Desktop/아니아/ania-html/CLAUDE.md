# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**아니아 (Ania)** — 26 F/W Korean fashion brand site. Static HTML/CSS/JS frontend with a PHP REST API backend targeting Café24 shared hosting.

- No build step, no framework, no bundler. All files are served as-is.
- To develop locally, serve the project root with any PHP-capable server (e.g. `php -S localhost:8000` inside `ania-html/`).
- The PHP API requires MySQL. Configure via environment variables or edit `api/db.php` directly (see below).

## Architecture

### Frontend (`ania-html/`)
- All pages are plain `.html` files at the root.
- **Every page must load `js/config.js` before `js/nav.js`** — `config.js` defines `SITE`, `API`, `apiFetch`, `SEED_PRODUCTS`, and all cart functions (`cartAdd`, `cartGet`, etc.) that `nav.js` and other inline scripts depend on.
- `js/nav.js` injects the unified `<header>` into `#header-placeholder`, the hamburger slide-in menu, and the search modal. It also calls `cartUpdateBadge()` and checks auth state on every page load.
- `js/popup.js` — XP-style draggable popup on the homepage; uses `sessionStorage` key `aniaPopupShown` so it reappears each new browser session.
- `js/cursor.js` — custom spaceship cursor overlay (`<div id="ship-cursor">`) positioned with JS at +19px/-19px (upper-right, 45°) from the native pointer.

### Data flow (offline-first fallback chain)
1. Pages call `apiFetch('/api/products.php?action=…')` to get live DB data.
2. On API failure, fall back to `SEED_PRODUCTS` (defined in `config.js`).
3. `SEED_PRODUCTS` itself checks `localStorage.aniaLocalProducts` first — data seeded via `admin-local.html` (no-DB local admin).

### PHP API (`api/`)
All endpoints follow the same pattern: `?action=<verb>` via GET or POST.
- `db.php` — PDO singleton, `json_ok()`, `json_err()`, `require_auth()`, `require_admin()`.
- `products.php` — list/search/single (public), create/update/delete (admin only).
- `auth.php` — login/logout/check; uses PHP sessions.
- `signup.php` — POST only; creates user with email, password (bcrypt, min 8 chars), name, mobile, address fields.
- `profile.php` — GET (read profile) / POST (update name/mobile/address); requires auth.
- `orders.php` — GET (user's orders) / POST (create order from cart items); requires auth.
- `upload.php` — POST multipart; admin only; saves to `assets/uploads/`; returns `{ url }`. Allowed: jpeg/png/webp/gif, max 10 MB.
- `health.php` — DB connection probe for Café24 deployment verification.
- DB credentials: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` env vars (fallback to hardcoded defaults in `db.php`).

### DB schema (key tables)
- `users` — id, email, password (bcrypt), name, mobile, postal_code, address, address_detail, is_admin, created_at
- `products` — id, name, name_ko, price, images (JSON array), category, description, is_available, stock, created_at
- `orders` — id, user_id, items (JSON array of `{id,name,unit_price,quantity,size}`), total_price, status, shipping_address (JSON), created_at

### Admin
- `admin/index.php` — order management dashboard; requires `is_admin=1` session.
- `admin/products.php` — product CRUD with image upload (calls `api/upload.php`).
- `admin/members.php` — user list.
- `admin-local.html` — localStorage-based product CRUD with JSON export for phpMyAdmin import; use this when no DB is available locally.

### Cart
Fully client-side via `localStorage` key `aniaCart`. Functions in `config.js`: `cartAdd(item)`, `cartRemove(idx)`, `cartGet()`, `cartTotal()`, `cartCount()`, `cartUpdateBadge()`. Checkout (`cart.html`) POSTs to `api/orders.php`.

## Key conventions

- Nav links and shop sub-categories are configured in `SITE.nav` in `config.js` — don't hardcode them in HTML.
- Prices formatted with `fmtPrice(n)` → Korean won format (e.g. `298,000원`).
- `images` column in DB is a JSON array of URL strings; always `json_encode`/`json_decode` when reading or writing.
- The `overflow-x: hidden` fix must be on `html`, **not** `body` — putting it on `body` breaks `position: sticky` for the header.
