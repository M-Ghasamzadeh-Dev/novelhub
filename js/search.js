/**
 * search.js
 * ---------------------------------------------------------------
 * جستجوی Real-Time:
 *   - پیشنهادهای زنده در Header
 *   - صفحه‌ی جستجو با فیلتر ژانر، وضعیت، رده سنی، نوع محتوا و مرتب‌سازی
 *   - همگام‌سازی فیلترها با URL (قابل اشتراک‌گذاری)
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { qs, qsa, escapeHTML: esc, toFa, debounce, getParam, setParams } = NR.utils;

  /** هایلایت عبارت جستجو در متن */
  function highlight(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const parts = NR.utils.normalize(q).split(' ').filter(Boolean).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!parts.length) return safe;
    return safe.replace(new RegExp(`(${parts.join('|')})`, 'gi'), '<mark>$1</mark>');
  }

  NR.search = {
    highlight,
    /** پیشنهادهای جستجوی Header */
    bindSuggest(input, box) {
      if (!input || !box) return;
      let items = [];
      let active = -1;
      const close = () => { box.innerHTML = ''; box.classList.remove('is-open'); active = -1; };
      const run = debounce(async () => {
        const q = input.value.trim();
        if (q.length < 2) return close();
        box.classList.add('is-open');
        box.innerHTML = `<div class="search-suggest__loading">${NR.ui.skeletonLines(2)}</div>`;
        const list = await NR.api.novels.list({ q, limit: 5, sort: 'popular' });
        if (input.value.trim() !== q) return;
        items = list;
        box.innerHTML = list.length
          ? list.map((n, i) => `<a role="option" id="sg-${i}" class="search-suggest__item" href="novel.html?id=${n.id}"><img src="${NR.ui.cover(n)}" alt="" width="36" height="54"><span><strong>${highlight(n.title, q)}</strong><small>${highlight(n.authorName, q)} · ${esc(n.genresInfo.map((g) => g.name).join('، '))}</small></span></a>`).join('') +
            `<a class="search-suggest__all" href="search.html?q=${encodeURIComponent(q)}">مشاهده‌ی همه‌ی نتایج برای «${esc(q)}»</a>`
          : `<p class="search-suggest__empty">نتیجه‌ای برای «${esc(q)}» پیدا نشد.</p>`;
      }, 220);
      input.addEventListener('input', run);
      input.addEventListener('keydown', (e) => {
        const links = qsa('.search-suggest__item', box);
        if (!links.length) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          active = (active + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
          links.forEach((l, i) => l.classList.toggle('is-active', i === active));
          input.setAttribute('aria-activedescendant', links[active].id);
        }
        if (e.key === 'Enter' && active >= 0) {
          e.preventDefault();
          location.href = links[active].href;
        }
      });
      document.addEventListener('click', (e) => { if (!e.target.closest('.header-search')) close(); });
      return { items: () => items };
    }
  };

  /* ============================== صفحه جستجو ============================== */
  NR.pages.search = async function () {
    const input = qs('#searchInput');
    const field = qs('#searchField');
    const sort = qs('#sortSelect');
    const results = qs('#results');
    const count = qs('#resultCount');
    const chipsBox = qs('#activeFilters');
    const genreBox = qs('#genreFilters');
    const filters = qs('#filters');

    // ساخت چیپ‌های ژانر
    genreBox.innerHTML = NR.api.genres().map((g) => `<label class="chip-check"><input type="checkbox" name="genre" value="${g.slug}"><span>${g.name}</span></label>`).join('');

    // خواندن وضعیت از URL
    const state = {
      q: getParam('q') || '',
      field: getParam('field') || 'all',
      genres: (getParam('genre') || '').split(',').filter(Boolean),
      status: getParam('status') || '',
      age: getParam('age') || '',
      type: getParam('type') || '',
      sort: getParam('sort') || 'popular'
    };
    input.value = state.q;
    field.value = state.field;
    sort.value = state.sort;
    qsa('input[name="genre"]', filters).forEach((c) => (c.checked = state.genres.includes(c.value)));
    ['status', 'age', 'type'].forEach((name) => {
      const r = qs(`input[name="${name}"][value="${state[name]}"]`, filters);
      if (r) r.checked = true;
    });

    const titles = { newest: 'رمان‌های جدید', popular: 'محبوب‌ترین رمان‌ها', views: 'پربازدیدترین رمان‌ها' };
    const heading = qs('#searchTitle');

    const renderChips = () => {
      const chips = [];
      if (state.q) chips.push(['q', `«${state.q}»`]);
      state.genres.forEach((g) => chips.push(['genre:' + g, NR.api.genres().find((x) => x.slug === g).name]));
      if (state.status) chips.push(['status', NR.utils.statusLabel(state.status)]);
      if (state.age) chips.push(['age', 'رده سنی ' + NR.utils.ageLabel(state.age)]);
      if (state.type) chips.push(['type', { text: 'متنی', image: 'تصویری', mixed: 'متن + تصویر' }[state.type]]);
      chipsBox.innerHTML = chips.map(([k, l]) => `<button type="button" class="chip chip--removable" data-clear="${k}" aria-label="حذف فیلتر ${esc(l)}">${esc(l)}${NR.ui.icon('close')}</button>`).join('') +
        (chips.length ? '<button type="button" class="link-btn" data-clear="all">پاک کردن همه</button>' : '');
      const n = chips.length - (state.q ? 1 : 0);
      qs('#filterCount').textContent = n ? toFa(n) : '';
    };

    let reqId = 0;
    const run = async () => {
      const id = ++reqId;
      setParams({ q: state.q, field: state.field !== 'all' ? state.field : '', genre: state.genres, status: state.status, age: state.age, type: state.type, sort: state.sort });
      heading.textContent = state.q ? `نتایج جستجو برای «${state.q}»` : titles[state.sort] && !state.genres.length ? titles[state.sort] : 'کاوش در رمان‌ها';
      renderChips();
      results.classList.add('novel-grid');
      results.setAttribute('aria-busy', 'true');
      results.innerHTML = NR.ui.skeletonCards(8);
      const list = await NR.api.novels.list({ q: state.q, field: state.field, genres: state.genres, status: state.status, age: state.age, contentType: state.type, sort: state.sort });
      if (id !== reqId) return; // پاسخ قدیمی‌تر
      results.setAttribute('aria-busy', 'false');
      count.textContent = `${toFa(list.length)} رمان`;
      if (!list.length) {
        results.classList.remove('novel-grid');
        results.innerHTML = NR.ui.emptyState({ iconName: 'search', title: 'رمانی با این مشخصات پیدا نشد.', text: 'عبارت دیگری امتحان کنید یا چند فیلتر را بردارید.' });
      } else {
        results.innerHTML = list.map(NR.ui.novelCard).join('');
      }
    };

    input.addEventListener('input', debounce(() => { state.q = input.value.trim(); run(); }, 250));
    qs('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); state.q = input.value.trim(); run(); });
    field.addEventListener('change', () => { state.field = field.value; run(); });
    sort.addEventListener('change', () => { state.sort = sort.value; run(); });
    filters.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'genre') state.genres = qsa('input[name="genre"]:checked', filters).map((c) => c.value);
      if (['status', 'age', 'type'].includes(t.name)) state[t.name] = t.value;
      run();
    });
    const clear = (key) => {
      if (key === 'all') {
        Object.assign(state, { q: '', genres: [], status: '', age: '', type: '' });
        input.value = '';
      } else if (key === 'q') { state.q = ''; input.value = ''; }
      else if (key.startsWith('genre:')) state.genres = state.genres.filter((g) => g !== key.slice(6));
      else state[key] = '';
      qsa('input[name="genre"]', filters).forEach((c) => (c.checked = state.genres.includes(c.value)));
      ['status', 'age', 'type'].forEach((name) => { const r = qs(`input[name="${name}"][value="${state[name]}"]`, filters); if (r) r.checked = true; });
      run();
    };
    chipsBox.addEventListener('click', (e) => { const b = e.target.closest('[data-clear]'); if (b) clear(b.dataset.clear); });
    qs('#resetFilters').addEventListener('click', () => clear('all'));

    // کشوی فیلتر در موبایل
    const toggle = qs('#filtersToggle');
    const setDrawer = (open) => {
      filters.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open && window.innerWidth < 900);
    };
    toggle.addEventListener('click', () => setDrawer(!filters.classList.contains('is-open')));
    qs('#filtersClose').addEventListener('click', () => setDrawer(false));

    run();
    input.focus({ preventScroll: true });
  };
})();
