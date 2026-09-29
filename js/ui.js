/**
 * ui.js
 * ---------------------------------------------------------------
 * کامپوننت‌های رابط کاربری مشترک:
 *   آیکون‌ها، کاور و آواتار SVG، Header / Footer / Bottom Nav،
 *   Toast، Modal (تأیید، نیاز به ورود، هشدار +۱۸)، کارت‌ها،
 *   Skeleton، Empty State، آپلود تصویر، ورودی تگ، متا تگ‌ها.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = (window.NR = window.NR || {});
  const { escapeHTML: esc, formatNumber: num, toFa } = NR.utils;

  /* ============================== آیکون‌ها ============================== */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    like: '<path d="M7 10v11H3V10z"/><path d="M7 10l4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7"/>',
    dislike: '<path d="M17 14V3h4v11z"/><path d="M17 14l-4 8a3 3 0 0 1-3-3v-4H4.5a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.9 3H17"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    book: '<path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v3M12 10v8M17 6v12"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
    reply: '<path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    focus: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.2.3 1.4 1.2 2.7 2.5 2.7z"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    telegram: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    twitter: '<path d="M4 4l16 16M20 4 4 20"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/>'
  };

  function icon(name, cls = '') {
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  }

  /* ============================== کاور و آواتار SVG ============================== */
  const GOLD = '#d4b26a';
  const PARCH = '#f3e9d2';
  const MOTIFS = {
    moon: (bg) => `<g opacity=".9"><circle cx="196" cy="138" r="56" fill="${PARCH}"/><circle cx="220" cy="122" r="52" fill="${bg}"/></g><g fill="${PARCH}" opacity=".7"><circle cx="70" cy="80" r="1.6"/><circle cx="110" cy="160" r="1.2"/><circle cx="250" cy="220" r="1.4"/><circle cx="60" cy="210" r="1"/><circle cx="150" cy="60" r="1.3"/></g>`,
    house: () => `<g fill="#050407" opacity=".85"><path d="M70 250 L150 180 L230 250 L230 300 L70 300Z"/><rect x="190" y="175" width="16" height="40"/></g><rect x="138" y="232" width="24" height="30" fill="${GOLD}" opacity=".9"/><path d="M0 300 Q80 280 150 300 T300 295 L300 320 L0 320Z" fill="#050407" opacity=".9"/><g stroke="${GOLD}" stroke-opacity=".35" fill="none"><path d="M40 300 C30 230 60 190 50 140"/><path d="M262 300 C272 240 245 200 258 150"/></g>`,
    dome: () => `<g fill="none" stroke="${GOLD}" stroke-width="2.2" opacity=".85"><path d="M90 290 V200 A60 60 0 0 1 210 200 V290"/><path d="M110 290 V210 A40 40 0 0 1 190 210 V290"/><path d="M150 140 V120"/><path d="M60 290 V150 M240 290 V150"/><circle cx="60" cy="146" r="5"/><circle cx="240" cy="146" r="5"/></g><path d="M40 290 H260" stroke="${GOLD}" stroke-width="2.2" opacity=".85"/>`,
    letter: () => `<g transform="rotate(-8 150 200)"><rect x="70" y="150" width="160" height="104" rx="4" fill="${PARCH}" opacity=".92"/><path d="M70 150 L150 212 L230 150" fill="none" stroke="#6b5a3a" stroke-width="2"/><circle cx="150" cy="212" r="16" fill="#8e2436"/><circle cx="150" cy="212" r="8" fill="none" stroke="${GOLD}" stroke-width="1.5"/></g>`,
    circuit: () => `<g stroke="#6fc3ff" stroke-opacity=".6" stroke-width="1.6" fill="none"><path d="M40 120 H120 V200 H200"/><path d="M260 90 V170 H180 V250"/><path d="M60 260 H140 V300"/><path d="M230 290 H200 V230"/></g><g fill="#6fc3ff"><circle cx="120" cy="120" r="4"/><circle cx="200" cy="200" r="5"/><circle cx="180" cy="250" r="4"/><circle cx="140" cy="300" r="4"/></g><circle cx="150" cy="200" r="34" fill="none" stroke="${GOLD}" stroke-width="2" opacity=".8"/><text x="150" y="212" text-anchor="middle" font-size="30" font-family="monospace" fill="${GOLD}">0</text>`,
    cup: () => `<g fill="none" stroke="${PARCH}" stroke-width="2.4" opacity=".85"><path d="M100 200 H200 V240 A50 44 0 0 1 100 240Z"/><path d="M200 210 C230 210 230 245 200 245"/><path d="M80 290 H220"/></g><g fill="none" stroke="${GOLD}" stroke-width="2" opacity=".7"><path d="M130 180 C120 160 140 150 130 128"/><path d="M160 180 C150 160 170 150 160 120"/></g>`,
    file: () => `<g transform="rotate(6 150 210)"><rect x="80" y="150" width="140" height="120" rx="4" fill="#d9c9a3" opacity=".9"/><rect x="80" y="140" width="60" height="16" rx="3" fill="#d9c9a3" opacity=".9"/><text x="150" y="232" text-anchor="middle" font-size="56" font-weight="700" font-family="Tahoma" fill="#8e2436">۷</text></g><path d="M40 90 L260 330" stroke="#8e2436" stroke-width="3" opacity=".5"/>`,
    wind: () => `<g fill="none" stroke="${PARCH}" stroke-linecap="round" opacity=".8"><path d="M40 150 C120 110 180 190 260 140" stroke-width="2.4"/><path d="M60 190 C130 160 170 230 250 190" stroke-width="1.8"/><path d="M30 230 C110 200 190 260 270 225" stroke-width="1.4"/></g><circle cx="150" cy="120" r="6" fill="${GOLD}"/><path d="M150 126 L144 200 L156 200Z" fill="${GOLD}" opacity=".85"/>`,
    mountain: () => `<path d="M20 300 L120 150 L170 220 L210 170 L290 300Z" fill="#050407" opacity=".75"/><path d="M120 150 L104 175 L120 170 L134 180Z M210 170 L198 188 L212 184 L222 190Z" fill="${PARCH}" opacity=".9"/><circle cx="220" cy="100" r="22" fill="${GOLD}" opacity=".85"/>`,
    flame: () => `<path d="M150 300 C95 280 90 220 125 180 C130 210 145 215 150 205 C140 170 150 140 180 110 C178 150 215 170 212 230 C210 275 185 296 150 300Z" fill="#e0703a" opacity=".85"/><path d="M150 296 C125 285 122 250 142 228 C146 246 158 248 160 238 C172 256 178 285 150 296Z" fill="${GOLD}"/>`,
    train: () => `<g stroke="${GOLD}" stroke-width="2" opacity=".7"><path d="M150 170 L60 320 M150 170 L240 320"/><path d="M120 220 H180 M104 250 H196 M86 280 H214"/></g><circle cx="150" cy="150" r="20" fill="${PARCH}" opacity=".95"/><circle cx="150" cy="150" r="46" fill="${PARCH}" opacity=".12"/><g fill="${PARCH}" opacity=".6"><circle cx="60" cy="70" r="2"/><circle cx="240" cy="90" r="2"/><circle cx="200" cy="50" r="1.4"/></g>`,
    wave: () => `<g fill="none" stroke="${PARCH}" stroke-width="2" opacity=".75"><path d="M0 230 Q37 210 75 230 T150 230 T225 230 T300 230"/><path d="M0 260 Q37 240 75 260 T150 260 T225 260 T300 260" opacity=".7"/><path d="M0 290 Q37 270 75 290 T150 290 T225 290 T300 290" opacity=".5"/></g><circle cx="150" cy="150" r="40" fill="${GOLD}" opacity=".85"/>`
  };

  function splitTitle(title, max = 13) {
    const words = title.split(' ');
    const lines = [];
    let line = '';
    words.forEach((w) => {
      if ((line + ' ' + w).trim().length > max && line) {
        lines.push(line);
        line = w;
      } else line = (line + ' ' + w).trim();
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  const coverCache = {};
  function cover(novel) {
    if (novel.cover) return novel.cover;
    const key = novel.id + novel.title + (novel.authorName || '');
    if (coverCache[key]) return coverCache[key];
    let palette = novel.palette;
    if (!palette) {
      const g = NR.seed.genres.find((x) => x.slug === (novel.genres || [])[0]);
      palette = g ? g.colors : ['#3d2a55', '#120d1a'];
    }
    const motif = MOTIFS[novel.motif] || MOTIFS.moon;
    const lines = splitTitle(novel.title || 'بی‌نام');
    const titleSVG = lines.map((l, i) => `<text x="150" y="${358 + i * 32 - (lines.length - 1) * 16}" text-anchor="middle" direction="rtl" font-family="Vazirmatn, Tahoma, sans-serif" font-size="25" font-weight="700" fill="${PARCH}">${esc(l)}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><defs><linearGradient id="bg" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient><radialGradient id="glow" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="300" height="450" fill="url(#bg)"/><rect width="300" height="450" fill="url(#glow)"/>${motif(palette[0])}<rect x="14" y="14" width="272" height="422" rx="3" fill="none" stroke="${GOLD}" stroke-opacity=".45"/><path d="M120 316 H180" stroke="${GOLD}" stroke-opacity=".6"/>${titleSVG}</svg>`;
    coverCache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return coverCache[key];
  }

  function avatar(user, size = 40) {
    if (!user) user = { displayName: '?' };
    const name = esc(user.displayName || user.username || '?');
    if (user.avatar) return `<img class="avatar" src="${user.avatar}" alt="تصویر پروفایل ${name}" width="${size}" height="${size}" style="--size:${size}px" loading="lazy">`;
    const letter = esc((user.displayName || user.username || '?').trim().charAt(0));
    return `<span class="avatar avatar--letter" style="--size:${size}px;--avatar-color:${user.color || '#7b4fa8'}" role="img" aria-label="تصویر پروفایل ${name}">${letter}</span>`;
  }

  /* ============================== متا و SEO ============================== */
  function setMeta({ title, description, image }) {
    if (title) {
      document.title = `${title} | ${NR.config.appName}`;
      const og = document.querySelector('meta[property="og:title"]');
      if (og) og.setAttribute('content', document.title);
    }
    if (description) {
      ['meta[name="description"]', 'meta[property="og:description"]'].forEach((s) => {
        const m = document.querySelector(s);
        if (m) m.setAttribute('content', description);
      });
    }
    if (image && !image.startsWith('data:')) {
      const m = document.querySelector('meta[property="og:image"]');
      if (m) m.setAttribute('content', image);
    }
  }

  /* ============================== Layout ============================== */
  const NAV = [
    { href: 'home.html', label: 'خانه', page: 'home' },
    { href: 'categories.html', label: 'دسته‌بندی‌ها', page: 'categories' },
    { href: 'search.html', label: 'رمان‌ها', page: 'search', match: (p) => !p.get('sort') },
    { href: 'authors.html', label: 'نویسندگان', page: 'authors' },
    { href: 'search.html?sort=newest', label: 'رمان‌های جدید', page: 'search', match: (p) => p.get('sort') === 'newest' },
    { href: 'search.html?sort=popular', label: 'محبوب‌ترین‌ها', page: 'search', match: (p) => p.get('sort') === 'popular' }
  ];

  const LOGO = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3c47e"/><stop offset="1" stop-color="#a77d35"/></linearGradient></defs><circle cx="20" cy="20" r="19" fill="none" stroke="url(#lg)" stroke-width="1.5"/><path d="M25.5 9.5a11 11 0 1 0 5 15.6A9 9 0 0 1 25.5 9.5z" fill="url(#lg)"/><path d="M13 27 L22 14" stroke="#8e2436" stroke-width="2" stroke-linecap="round"/></svg>`;

  function renderHeader() {
    const host = document.getElementById('site-header');
    if (!host) return;
    const user = NR.api.auth.currentUser();
    const page = document.body.dataset.page;
    const params = new URLSearchParams(location.search);
    const unread = NR.api.notifications.unreadCount();
    const links = NAV.map((l) => {
      const active = l.page === page && (!l.match || l.match(params));
      return `<li><a href="${l.href}" class="nav-link${active ? ' is-active' : ''}"${active ? ' aria-current="page"' : ''}>${l.label}</a></li>`;
    }).join('');

    const userArea = user
      ? `<a href="notifications.html" class="icon-btn" aria-label="اعلان‌ها${unread ? ' (' + toFa(unread) + ' خوانده‌نشده)' : ''}">${icon('bell')}${unread ? `<span class="badge-dot">${toFa(unread > 9 ? '9+' : unread)}</span>` : ''}</a>
         <div class="user-menu">
           <button class="user-menu__trigger" id="userMenuBtn" aria-haspopup="true" aria-expanded="false" aria-controls="userMenu" aria-label="منوی حساب کاربری">${avatar(user, 36)}</button>
           <div class="user-menu__panel" id="userMenu" role="menu" hidden>
             <div class="user-menu__head">${avatar(user, 44)}<div><strong>${esc(user.displayName)}</strong><span>@${esc(user.username)}</span></div></div>
             <a role="menuitem" href="profile.html">${icon('user')}پروفایل من</a>
             <a role="menuitem" href="dashboard.html">${icon('chart')}پنل نویسنده</a>
             <a role="menuitem" href="my-novels.html">${icon('book')}رمان‌های من</a>
             <a role="menuitem" href="create-novel.html">${icon('pen')}نوشتن رمان</a>
             <a role="menuitem" href="favorites.html">${icon('bookmark')}علاقه‌مندی‌ها</a>
             <a role="menuitem" href="notifications.html">${icon('bell')}اعلان‌ها</a>
             <button role="menuitem" type="button" data-logout class="is-danger">${icon('logout')}خروج از حساب</button>
           </div>
         </div>`
      : `<a href="login.html" class="btn btn--ghost btn--sm hide-mobile">ورود</a><a href="register.html" class="btn btn--primary btn--sm hide-mobile">ثبت‌نام</a>`;

    host.outerHTML = `
      <header class="site-header" id="siteHeader">
        <div class="container header-inner">
          <a class="brand" href="home.html" aria-label="${NR.config.appName} - صفحه اصلی">${LOGO}<span class="brand-name">${NR.config.appName}</span></a>
          <nav class="main-nav" id="mainNav" aria-label="منوی اصلی">
            <ul class="nav-list">${links}</ul>
            ${user ? '' : `<div class="main-nav__auth"><a href="login.html" class="btn btn--ghost">ورود</a><a href="register.html" class="btn btn--primary">ثبت‌نام</a></div>`}
          </nav>
          <div class="header-actions">
            <button class="icon-btn" type="button" id="searchToggle" aria-label="جستجو" aria-expanded="false" aria-controls="headerSearch">${icon('search')}</button>
            <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="تغییر تم">${icon('sun', 'icon-sun')}${icon('moon', 'icon-moon')}</button>
            ${userArea}
            <button class="icon-btn nav-toggle" type="button" id="navToggle" aria-label="باز کردن منو" aria-expanded="false" aria-controls="mainNav">${icon('menu')}</button>
          </div>
        </div>
        <div class="header-search" id="headerSearch" hidden>
          <form class="container header-search__form" action="search.html" role="search">
            ${icon('search')}
            <label for="headerSearchInput" class="sr-only">جستجوی رمان</label>
            <input id="headerSearchInput" name="q" type="search" autocomplete="off" placeholder="عنوان رمان، نویسنده، ژانر یا تگ…">
            <kbd class="hide-mobile">Esc</kbd>
          </form>
          <div class="container"><div class="search-suggest" id="searchSuggest" role="listbox" aria-label="پیشنهادهای جستجو"></div></div>
        </div>
      </header>
      <div class="nav-backdrop" id="navBackdrop" hidden></div>`;
    bindHeader();
  }

  function bindHeader() {
    const header = document.getElementById('siteHeader');
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    const backdrop = document.getElementById('navBackdrop');
    const setNav = (open) => {
      nav.classList.toggle('is-open', open);
      backdrop.hidden = !open;
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.innerHTML = icon(open ? 'close' : 'menu');
      document.body.classList.toggle('no-scroll', open);
    };
    navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
    backdrop.addEventListener('click', () => setNav(false));

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // منوی کاربر
    const menuBtn = document.getElementById('userMenuBtn');
    if (menuBtn) {
      const panel = document.getElementById('userMenu');
      const setMenu = (open) => {
        panel.hidden = !open;
        menuBtn.setAttribute('aria-expanded', String(open));
        if (open) panel.querySelector('[role="menuitem"]').focus();
      };
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMenu(panel.hidden);
      });
      document.addEventListener('click', (e) => {
        if (!panel.hidden && !e.target.closest('.user-menu')) setMenu(false);
      });
      panel.addEventListener('keydown', (e) => {
        const items = NR.utils.qsa('[role="menuitem"]', panel);
        const i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
      });
    }

    // جستجوی سریع در Header
    const searchToggle = document.getElementById('searchToggle');
    const searchBox = document.getElementById('headerSearch');
    const input = document.getElementById('headerSearchInput');
    const setSearch = (open) => {
      searchBox.hidden = !open;
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
    };
    searchToggle.addEventListener('click', () => setSearch(searchBox.hidden));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!searchBox.hidden) setSearch(false);
        if (nav.classList.contains('is-open')) setNav(false);
      }
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        setSearch(true);
      }
    });
    if (NR.search && NR.search.bindSuggest) NR.search.bindSuggest(input, document.getElementById('searchSuggest'));
  }

  function renderFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    const genres = NR.seed.genres.slice(0, 8).map((g) => `<li><a href="categories.html?genre=${g.slug}">${g.name}</a></li>`).join('');
    host.outerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div class="footer-brand">
            <a class="brand" href="home.html">${LOGO}<span class="brand-name">${NR.config.appName}</span></a>
            <p>خانه‌ای برای قصه‌ها؛ جایی که نویسنده‌های فارسی‌زبان رمان‌هایشان را فصل به فصل منتشر می‌کنند و خواننده‌ها شب را با یک داستان تازه به صبح می‌رسانند.</p>
            <div class="socials" aria-label="شبکه‌های اجتماعی">
              <a href="#" class="icon-btn" aria-label="اینستاگرام شب‌نامه">${icon('instagram')}</a>
              <a href="#" class="icon-btn" aria-label="تلگرام شب‌نامه">${icon('telegram')}</a>
              <a href="#" class="icon-btn" aria-label="ایکس شب‌نامه">${icon('twitter')}</a>
              <a href="#" class="icon-btn" aria-label="یوتیوب شب‌نامه">${icon('youtube')}</a>
            </div>
          </div>
          <nav aria-label="لینک‌های مهم"><h2 class="footer-title">لینک‌های مهم</h2><ul>
            <li><a href="search.html?sort=newest">رمان‌های جدید</a></li><li><a href="search.html?sort=popular">محبوب‌ترین‌ها</a></li>
            <li><a href="authors.html">نویسندگان</a></li><li><a href="create-novel.html">نوشتن رمان</a></li><li><a href="dashboard.html">پنل نویسنده</a></li></ul></nav>
          <nav aria-label="دسته‌بندی‌ها"><h2 class="footer-title">دسته‌بندی‌ها</h2><ul class="footer-genres">${genres}</ul></nav>
          <nav aria-label="شب‌نامه"><h2 class="footer-title">شب‌نامه</h2><ul>
            <li><a href="about.html">درباره ما</a></li><li><a href="rules.html">قوانین</a></li><li><a href="rules.html#privacy">حریم خصوصی</a></li><li><a href="contact.html">تماس با ما</a></li></ul></nav>
        </div>
        <div class="container footer-bottom">
          <p>© ${toFa(new Date().getFullYear())} ${NR.config.appName}. تمامی حقوق آثار متعلق به نویسندگان است.</p>
          <button type="button" class="link-btn" data-reset-demo>${icon('refresh')}بازنشانی داده‌های دمو</button>
        </div>
      </footer>`;
  }

  function renderBottomNav() {
    const page = document.body.dataset.page;
    if (page === 'reader') return;
    const user = NR.api.auth.currentUser();
    const items = [
      { href: 'home.html', label: 'خانه', icon: 'home', page: 'home' },
      { href: 'categories.html', label: 'دسته‌ها', icon: 'grid', page: 'categories' },
      { href: 'create-novel.html', label: 'نوشتن', icon: 'pen', page: 'create-novel', accent: true },
      { href: 'search.html', label: 'جستجو', icon: 'search', page: 'search' },
      { href: user ? 'profile.html' : 'login.html', label: user ? 'پروفایل' : 'ورود', icon: user ? 'user' : 'login', page: user ? 'profile' : 'login' }
    ];
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label', 'منوی پایین موبایل');
    nav.innerHTML = items.map((i) => `<a href="${i.href}" class="bottom-nav__item${i.page === page ? ' is-active' : ''}${i.accent ? ' is-accent' : ''}"${i.page === page ? ' aria-current="page"' : ''}>${icon(i.icon)}<span>${i.label}</span></a>`).join('');
    document.body.appendChild(nav);
    document.body.classList.add('has-bottom-nav');
  }

  /** انتقال نرم بین صفحات */
  function bindPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.href.split('#')[0] === location.href.split('#')[0] || a.getAttribute('href').startsWith('#')) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => (location.href = url.href), 170);
    });
    window.addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
  }

  function renderLayout() {
    renderHeader();
    renderFooter();
    renderBottomNav();
    bindPageTransitions();
    document.addEventListener('click', async (e) => {
      if (e.target.closest('[data-reset-demo]')) {
        const ok = await confirm({ title: 'بازنشانی داده‌های دمو', text: 'همه‌ی رمان‌ها، فصل‌ها، نظرات و حساب‌هایی که ساخته‌اید پاک می‌شوند و داده‌های نمونه برمی‌گردند.', confirmText: 'بازنشانی', danger: true });
        if (ok) {
          NR.db.reset();
          toast('داده‌های دمو بازنشانی شد.', 'success');
          setTimeout(() => (location.href = 'home.html'), 600);
        }
      }
    });
  }

  /* ============================== Toast ============================== */
  function toast(message, type = 'info', timeout = 3200) {
    let region = document.getElementById('toastRegion');
    if (!region) {
      region = document.createElement('div');
      region.id = 'toastRegion';
      region.className = 'toast-region';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'false');
      document.body.appendChild(region);
    }
    const map = { success: 'check', error: 'alert', info: 'info', warning: 'alert' };
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="toast__icon">${icon(map[type] || 'info')}</span><span class="toast__text">${esc(message)}</span><button class="toast__close" type="button" aria-label="بستن اعلان">${icon('close')}</button>`;
    region.appendChild(el);
    const remove = () => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 250);
    };
    el.querySelector('.toast__close').addEventListener('click', remove);
    setTimeout(remove, timeout);
  }

  /* ============================== Modal ============================== */
  /**
   * @param {Object} o { title, html, icon, tone, actions:[{label,value,variant,href}], size, dismissible }
   * @returns {Promise<any>} مقدار دکمه‌ی انتخاب‌شده یا null
   */
  function modal(o) {
    return new Promise((resolve) => {
      const lastFocus = document.activeElement;
      const id = NR.utils.uid('modal');
      const wrap = document.createElement('div');
      wrap.className = 'modal' + (o.className ? ' ' + o.className : '');
      wrap.innerHTML = `
        <div class="modal__backdrop" data-dismiss></div>
        <div class="modal__dialog modal__dialog--${o.size || 'sm'}" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
          ${o.dismissible === false ? '' : `<button class="modal__close icon-btn" type="button" aria-label="بستن" data-dismiss>${icon('close')}</button>`}
          ${o.icon ? `<div class="modal__icon modal__icon--${o.tone || 'gold'}">${o.icon.startsWith('<') ? o.icon : icon(o.icon)}</div>` : ''}
          <h2 class="modal__title" id="${id}-title">${o.title}</h2>
          <div class="modal__body">${o.html || ''}</div>
          ${o.actions && o.actions.length ? `<div class="modal__actions">${o.actions.map((a, i) => a.href ? `<a class="btn btn--${a.variant || 'ghost'}" href="${a.href}">${a.label}</a>` : `<button type="button" class="btn btn--${a.variant || 'ghost'}" data-action="${i}">${a.label}</button>`).join('')}</div>` : ''}
        </div>`;
      document.body.appendChild(wrap);
      document.body.classList.add('no-scroll');
      requestAnimationFrame(() => wrap.classList.add('is-open'));

      const close = (value) => {
        wrap.classList.remove('is-open');
        document.removeEventListener('keydown', onKey);
        setTimeout(() => {
          wrap.remove();
          if (!document.querySelector('.modal')) document.body.classList.remove('no-scroll');
          if (lastFocus && lastFocus.focus) lastFocus.focus();
        }, 220);
        resolve(value);
      };
      const onKey = (e) => {
        if (e.key === 'Escape' && o.dismissible !== false) close(null);
        if (e.key === 'Tab') {
          const f = NR.utils.qsa('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])', wrap);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      };
      document.addEventListener('keydown', onKey);
      wrap.addEventListener('click', (e) => {
        if (e.target.closest('[data-dismiss]') && o.dismissible !== false) close(null);
        const btn = e.target.closest('[data-action]');
        if (btn) close(o.actions[Number(btn.dataset.action)].value);
      });
      const focusTarget = wrap.querySelector('.modal__actions .btn--primary, .modal__actions .btn--danger, .modal__actions .btn, input, textarea');
      setTimeout(() => focusTarget && focusTarget.focus(), 60);
      if (o.onOpen) o.onOpen(wrap, close);
    });
  }

  function confirm({ title = 'تأیید عملیات', text = 'آیا مطمئن هستید؟', confirmText = 'تأیید', cancelText = 'انصراف', danger = false } = {}) {
    return modal({
      title,
      icon: danger ? 'trash' : 'info',
      tone: danger ? 'danger' : 'gold',
      html: `<p>${esc(text)}</p>`,
      actions: [
        { label: cancelText, value: false, variant: 'ghost' },
        { label: confirmText, value: true, variant: danger ? 'danger' : 'primary' }
      ]
    }).then((v) => v === true);
  }

  function loginRequired(message) {
    const redirect = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    return modal({
      title: 'ورود به حساب کاربری',
      icon: 'lock',
      html: `<p>${esc(message || 'برای استفاده از این قابلیت ابتدا وارد حساب کاربری خود شوید.')}</p>`,
      actions: [
        { label: 'ادامه به صورت مهمان', value: 'guest', variant: 'ghost' },
        { label: 'ثبت‌نام', href: `register.html?redirect=${redirect}`, variant: 'outline' },
        { label: 'ورود', href: `login.html?redirect=${redirect}`, variant: 'primary' }
      ]
    });
  }

  /** هشدار محتوای بزرگسال؛ تأیید در طول نشست مرورگر به خاطر سپرده می‌شود */
  function adultGate() {
    if (NR.storage.get('adult_ok', false, sessionStorage)) return Promise.resolve(true);
    return modal({
      title: 'محتوای مخصوص بزرگسالان',
      icon: `<span class="age-mark">+۱۸</span>`,
      tone: 'danger',
      dismissible: false,
      className: 'modal--adult',
      html: '<p>این محتوا برای کاربران بزرگسال در نظر گرفته شده است. با ورود تأیید می‌کنید که حداقل ۱۸ سال سن دارید.</p>',
      actions: [
        { label: 'بازگشت', value: false, variant: 'ghost' },
        { label: 'ورود به محتوا', value: true, variant: 'danger' }
      ]
    }).then((ok) => {
      if (ok) NR.storage.set('adult_ok', true, sessionStorage);
      else {
        if (document.referrer && new URL(document.referrer).origin === location.origin) history.back();
        else location.href = 'home.html';
      }
      return !!ok;
    });
  }

  /* ============================== کارت‌ها ============================== */
  const adultOk = () => NR.storage.get('adult_ok', false, sessionStorage);

  function statusRibbon(status) {
    return `<span class="ribbon ribbon--${status}">${NR.utils.statusLabel(status)}</span>`;
  }

  function ageBadge(age) {
    if (!age || age === 'all') return '';
    return `<span class="age-badge age-badge--${age}" title="رده سنی">${NR.utils.ageLabel(age)}</span>`;
  }

  function novelCard(n) {
    const bookmarked = NR.api.bookmarks.has(n.id);
    const blurred = n.ageRating === '18' && !adultOk();
    const genre = n.genresInfo && n.genresInfo[0] ? n.genresInfo[0].name : '';
    return `
      <article class="novel-card" data-novel-id="${n.id}">
        <a href="novel.html?id=${n.id}" class="novel-card__link">
          <div class="novel-card__cover${blurred ? ' is-blurred' : ''}">
            <img src="${cover(n)}" alt="کاور رمان ${esc(n.title)}" loading="lazy" width="300" height="450">
            ${statusRibbon(n.status)}
            <div class="novel-card__badges">${ageBadge(n.ageRating)}${n.contentType !== 'text' ? `<span class="type-badge">${icon('image')}مصور</span>` : ''}</div>
            ${blurred ? `<span class="adult-veil">${icon('lock')}محتوای +۱۸</span>` : ''}
            <span class="novel-card__rating">${icon('star')}${toFa(n.rating ? n.rating.toFixed(1) : '—').replace('.', '٫')}</span>
          </div>
          <div class="novel-card__body">
            <span class="novel-card__genre">${esc(genre)}</span>
            <h3 class="novel-card__title">${esc(n.title)}</h3>
            <p class="novel-card__author">${esc(n.authorName)}</p>
            <ul class="novel-card__stats" aria-label="آمار رمان">
              <li title="تعداد فصل">${icon('list')}${toFa(n.chapterCount)} فصل</li>
              <li title="بازدید">${icon('eye')}${num(n.views)}</li>
              <li title="لایک">${icon('heart')}${num(n.likes)}</li>
            </ul>
          </div>
        </a>
        <button type="button" class="novel-card__bookmark${bookmarked ? ' is-active' : ''}" data-bookmark="${n.id}" aria-pressed="${bookmarked}" aria-label="${bookmarked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}">${icon('bookmark')}</button>
      </article>`;
  }

  function rankItem(n, rank) {
    return `
      <li class="rank-item">
        <a href="novel.html?id=${n.id}" class="rank-item__link">
          <span class="rank-item__num" aria-hidden="true">${toFa(rank)}</span>
          <img class="rank-item__cover${n.ageRating === '18' && !adultOk() ? ' is-blurred' : ''}" src="${cover(n)}" alt="کاور رمان ${esc(n.title)}" loading="lazy" width="60" height="90">
          <span class="rank-item__info">
            <strong>${esc(n.title)}</strong>
            <span>${esc(n.authorName)} · ${esc(n.genresInfo.map((g) => g.name).slice(0, 2).join('، '))}</span>
            <span class="rank-item__meta">${icon('heart')}${num(n.likes)} ${icon('eye')}${num(n.views)} ${icon('star')}${toFa(n.rating.toFixed(1)).replace('.', '٫')}</span>
          </span>
        </a>
      </li>`;
  }

  function authorCard(a) {
    const me = NR.api.auth.currentUser();
    const following = NR.api.users.isFollowing(a.id);
    const self = me && me.id === a.id;
    return `
      <article class="author-card">
        <a href="profile.html?user=${esc(a.username)}" class="author-card__link">
          ${avatar(a, 76)}
          <h3 class="author-card__name">${esc(a.displayName)}</h3>
          <span class="author-card__handle">@${esc(a.username)}</span>
        </a>
        <dl class="author-card__stats">
          <div><dt>رمان</dt><dd>${toFa(a.novelCount)}</dd></div>
          <div><dt>دنبال‌کننده</dt><dd data-follower-count="${a.id}">${num(a.followers)}</dd></div>
        </dl>
        ${self ? `<a href="dashboard.html" class="btn btn--outline btn--sm btn--block">پنل من</a>` : `<button type="button" class="btn ${following ? 'btn--ghost' : 'btn--outline'} btn--sm btn--block" data-follow="${a.id}" aria-pressed="${following}">${following ? 'دنبال می‌کنید' : 'دنبال کردن'}</button>`}
      </article>`;
  }

  function genreCard(g, count) {
    return `
      <a class="genre-card${g.adult ? ' genre-card--adult' : ''}" href="categories.html?genre=${g.slug}" style="--g1:${g.colors[0]};--g2:${g.colors[1]}">
        <span class="genre-card__glyph" aria-hidden="true">${esc(g.name.charAt(0))}</span>
        <span class="genre-card__name">${esc(g.name)}</span>
        <span class="genre-card__desc">${esc(g.desc)}</span>
        ${count !== undefined ? `<span class="genre-card__count">${toFa(count)} رمان</span>` : ''}
      </a>`;
  }

  function skeletonCards(n = 6) {
    return Array.from({ length: n }, () => `
      <div class="novel-card novel-card--skeleton" aria-hidden="true">
        <div class="skeleton skeleton--cover"></div>
        <div class="novel-card__body"><div class="skeleton skeleton--line w-40"></div><div class="skeleton skeleton--line w-80"></div><div class="skeleton skeleton--line w-60"></div></div>
      </div>`).join('');
  }

  function skeletonLines(n = 4) {
    return `<div class="skeleton-stack" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<div class="skeleton skeleton--line" style="width:${90 - (i % 3) * 15}%"></div>`).join('')}</div>`;
  }

  function emptyState({ iconName = 'book', title, text = '', action } = {}) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">${icon(iconName)}</div>
        <h3>${title}</h3>
        ${text ? `<p>${text}</p>` : ''}
        ${action ? `<a href="${action.href}" class="btn btn--primary">${action.icon ? icon(action.icon) : ''}${action.label}</a>` : ''}
      </div>`;
  }

  function errorState({ title = 'این صفحه در قصه‌ی ما نیست', text = 'شاید صفحه حذف شده یا آدرس اشتباه وارد شده است.' } = {}) {
    return `
      <section class="error-state">
        <div class="error-state__code" aria-hidden="true">۴۰۴</div>
        <h1>${title}</h1>
        <p>${text}</p>
        <div class="btn-row"><a href="home.html" class="btn btn--primary">${icon('home')}بازگشت به خانه</a><a href="search.html" class="btn btn--ghost">${icon('search')}جستجوی رمان</a></div>
      </section>`;
  }

  /* ============================== آپلود تصویر ============================== */
  function imageUploader(el, { value = null, label = 'تصویر کاور را انتخاب کنید', hint = 'JPG یا PNG، حداکثر ۸ مگابایت', aspect = 'cover', maxSize = 720, onChange } = {}) {
    let current = value;
    const inputId = NR.utils.uid('file');
    el.classList.add('uploader', `uploader--${aspect}`);
    const render = () => {
      el.innerHTML = current
        ? `<div class="uploader__preview"><img src="${current}" alt="پیش‌نمایش تصویر انتخاب‌شده"><div class="uploader__tools">
             <label for="${inputId}" class="btn btn--sm btn--ghost">${icon('image')}تغییر</label>
             <button type="button" class="btn btn--sm btn--danger" data-remove>${icon('trash')}حذف تصویر</button></div></div>
           <input id="${inputId}" type="file" accept="image/*" class="sr-only">`
        : `<label for="${inputId}" class="uploader__drop" tabindex="0">
             <span class="uploader__icon">${icon('upload')}</span><strong>${label}</strong><span>${hint}</span><span class="uploader__or">یا تصویر را اینجا رها کنید</span>
           </label><input id="${inputId}" type="file" accept="image/*" class="sr-only">`;
      const input = el.querySelector('input');
      input.addEventListener('change', () => input.files[0] && handle(input.files[0]));
      const drop = el.querySelector('.uploader__drop');
      if (drop) drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
      const rm = el.querySelector('[data-remove]');
      if (rm) rm.addEventListener('click', () => { current = null; render(); onChange && onChange(null); toast('تصویر حذف شد.', 'info'); });
    };
    const handle = async (file) => {
      el.classList.add('is-loading');
      try {
        current = await NR.utils.resizeImage(file, maxSize);
        render();
        onChange && onChange(current);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        el.classList.remove('is-loading');
      }
    };
    ['dragenter', 'dragover'].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); el.classList.add('is-dragging'); }));
    ['dragleave', 'drop'].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); el.classList.remove('is-dragging'); }));
    el.addEventListener('drop', (e) => e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]));
    render();
    return { getValue: () => current, setValue: (v) => { current = v; render(); } };
  }

  /* ============================== ورودی تگ ============================== */
  function tagInput(el, { value = [], max = 8, placeholder = 'تگ را بنویسید و Enter بزنید' } = {}) {
    let tags = [...value];
    const inputId = el.dataset.inputId || NR.utils.uid('tag');
    el.classList.add('tag-input');
    const render = () => {
      el.innerHTML = tags.map((t, i) => `<span class="tag">#${esc(t)}<button type="button" aria-label="حذف تگ ${esc(t)}" data-i="${i}">${icon('close')}</button></span>`).join('') +
        `<input id="${inputId}" type="text" placeholder="${tags.length >= max ? 'حداکثر تعداد تگ' : placeholder}" ${tags.length >= max ? 'disabled' : ''} aria-label="افزودن تگ">`;
      const input = el.querySelector('input');
      input.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ',' || e.key === '،') && input.value.trim()) {
          e.preventDefault();
          const t = input.value.trim().replace(/^#/, '').slice(0, 24);
          if (!tags.includes(t) && tags.length < max) tags.push(t);
          render();
          el.querySelector('input').focus();
        } else if (e.key === 'Backspace' && !input.value && tags.length) {
          tags.pop();
          render();
          el.querySelector('input').focus();
        }
      });
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) { tags.splice(Number(b.dataset.i), 1); render(); }
      else if (e.target === el) el.querySelector('input').focus();
    });
    render();
    return { getValue: () => [...tags] };
  }

  /** وضعیت loading دکمه */
  function setLoading(btn, loading, text) {
    if (!btn) return;
    if (loading) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${text || 'لطفاً صبر کنید…'}`;
    } else {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  }

  /** نمایش خطای فیلد فرم */
  function fieldError(input, message) {
    const field = input.closest('.field') || input.parentElement;
    let err = field.querySelector('.field__error');
    if (!message) {
      input.removeAttribute('aria-invalid');
      if (err) err.remove();
      return;
    }
    input.setAttribute('aria-invalid', 'true');
    if (!err) {
      err = document.createElement('p');
      err.className = 'field__error';
      err.id = (input.id || NR.utils.uid('f')) + '-error';
      field.appendChild(err);
      input.setAttribute('aria-describedby', err.id);
    }
    err.textContent = message;
  }

  /** فعال‌سازی Tabها با پشتیبانی کیبورد */
  function tabs(root, onChange) {
    const list = NR.utils.qsa('[role="tab"]', root);
    const activate = (tab, focus) => {
      list.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      onChange && onChange(tab.dataset.tab);
    };
    list.forEach((t, i) => {
      t.addEventListener('click', () => activate(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') activate(list[(i + 1) % list.length], true);
        if (e.key === 'ArrowRight') activate(list[(i - 1 + list.length) % list.length], true);
      });
    });
    return { activate: (name) => { const t = list.find((x) => x.dataset.tab === name); if (t) activate(t); } };
  }

  /** ظاهر شدن تدریجی بخش‌ها هنگام اسکرول */
  function reveal(root = document) {
    let els = NR.utils.qsa('[data-reveal]:not(.is-visible)', root);
    const check = () => {
      els = els.filter((e) => {
        if (e.getBoundingClientRect().top < window.innerHeight * 0.92) { e.classList.add('is-visible'); return false; }
        return true;
      });
      if (!els.length) window.removeEventListener('scroll', onScroll);
    };
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { check(); ticking = false; }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check();
  }

  NR.ui = { icon, cover, avatar, setMeta, renderLayout, renderHeader, toast, modal, confirm, loginRequired, adultGate, novelCard, rankItem, authorCard, genreCard, statusRibbon, ageBadge, skeletonCards, skeletonLines, emptyState, errorState, imageUploader, tagInput, setLoading, fieldError, tabs, reveal };

  /* ============================== صفحه تماس با ما ============================== */
  NR.pages.contact = function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const user = NR.api.auth.currentUser();
    if (user) {
      form.name.value = user.displayName;
      form.email.value = user.email;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      [['name', (v) => v.trim().length >= 2, 'نام خود را وارد کنید.'], ['email', (v) => /^\S+@\S+\.\S+$/.test(v), 'ایمیل معتبر وارد کنید.'], ['subject', (v) => v, 'موضوع را انتخاب کنید.'], ['message', (v) => v.trim().length >= 10, 'پیام باید حداقل ۱۰ حرف باشد.']].forEach(([name, test, msg]) => {
        const ok = test(form[name].value);
        fieldError(form[name], ok ? null : msg);
        if (!ok) valid = false;
      });
      if (!valid) return;
      const btn = form.querySelector('[type="submit"]');
      setLoading(btn, true, 'در حال ارسال…');
      await NR.api.contact.send({ name: form.name.value, email: form.email.value, subject: form.subject.value, message: form.message.value });
      setLoading(btn, false);
      form.reset();
      toast('پیام شما ارسال شد. به‌زودی پاسخ می‌دهیم.', 'success');
    });
  };
})();
