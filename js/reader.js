/**
 * reader.js
 * ---------------------------------------------------------------
 * تجربه‌ی مطالعه: فصل قبلی/بعدی، فهرست فصل‌ها، اندازه و نوع فونت،
 * فاصله‌ی خطوط، عرض متن، تم تاریک/روشن/کاغذی، حالت تمرکز،
 * نوار پیشرفت و ذخیره‌ی خودکار محل مطالعه.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { qs, qsa, escapeHTML: esc, toFa, getParam } = NR.utils;
  const icon = (n) => NR.ui.icon(n);

  const DEFAULTS = { size: 19, width: 'normal', leading: 2.1, font: 'naskh', theme: null };
  const WIDTHS = { narrow: '34rem', normal: '42rem', wide: '52rem' };
  const FONTS = { naskh: "'Noto Naskh Arabic', 'Vazirmatn', serif", vazir: "'Vazirmatn', Tahoma, sans-serif" };

  const settings = {
    get() { return { ...DEFAULTS, ...NR.storage.get('reader', {}) }; },
    set(patch) { NR.storage.set('reader', { ...this.get(), ...patch }); }
  };

  function renderBlocks(blocks) {
    return blocks.map((b) => {
      if (b.type === 'image') return `<figure class="chapter-figure"><img src="${b.src}" alt="${esc(b.caption || 'تصویر داخل فصل')}" loading="lazy">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      return b.text.split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
    }).join('');
  }

  NR.pages.reader = async function () {
    const root = qs('#readerRoot');
    const novelId = getParam('id');
    let number = Number(getParam('ch')) || 1;
    root.innerHTML = `<div class="reader-loading">${NR.ui.skeletonLines(8)}</div>`;

    let novel, chapter, chapters;
    try {
      novel = await NR.api.novels.get(novelId);
      if (novel.ageRating === '18' && !novel.isOwner) {
        const ok = await NR.ui.adultGate();
        if (!ok) return;
      }
      chapters = await NR.api.chapters.list(novelId, { includeDrafts: novel.isOwner });
      if (!chapters.length) throw new Error('empty');
      if (!chapters.some((c) => c.number === number)) number = chapters[0].number;
      chapter = await NR.api.chapters.get(novelId, number);
    } catch (err) {
      document.body.classList.remove('reader-page');
      root.innerHTML = NR.ui.errorState({ title: 'فصل پیدا نشد', text: 'این فصل وجود ندارد یا هنوز منتشر نشده است.' });
      return;
    }

    const idx = chapters.findIndex((c) => c.number === chapter.number);
    const prev = chapters[idx - 1];
    const next = chapters[idx + 1];
    const words = chapter.blocks.filter((b) => b.type === 'text').reduce((s, b) => s + b.text.split(/\s+/).length, 0);
    NR.ui.setMeta({ title: `فصل ${toFa(chapter.number)}: ${chapter.title} | ${novel.title}`, description: `مطالعه‌ی فصل ${toFa(chapter.number)} رمان ${novel.title} نوشته‌ی ${novel.authorName}` });
    NR.api.progress.set(novelId, chapter.number);
    const link = (c) => `reader.html?id=${novelId}&ch=${c.number}`;

    root.innerHTML = `
      <div class="reader-progress" aria-hidden="true"><span id="readProgress"></span></div>
      <header class="reader-bar" id="readerBar">
        <a class="icon-btn" href="novel.html?id=${novelId}" aria-label="بازگشت به صفحه رمان">${icon('chevronRight')}</a>
        <div class="reader-bar__title"><strong>${esc(novel.title)}</strong><span>فصل ${toFa(chapter.number)} · ${esc(chapter.title)}</span></div>
        <div class="reader-bar__actions">
          <button type="button" class="icon-btn" data-panel="chapterDrawer" aria-controls="chapterDrawer" aria-expanded="false" aria-label="فهرست فصل‌ها">${icon('list')}</button>
          <button type="button" class="icon-btn" data-panel="settingsPanel" aria-controls="settingsPanel" aria-expanded="false" aria-label="تنظیمات مطالعه">${icon('type')}</button>
          <button type="button" class="icon-btn hide-mobile" id="focusToggle" aria-pressed="false" aria-label="حالت مطالعه (تمرکز)">${icon('focus')}</button>
          <button type="button" class="icon-btn${novel.bookmarked ? ' is-active' : ''}" data-bookmark="${novelId}" aria-pressed="${novel.bookmarked}" aria-label="افزودن به علاقه‌مندی‌ها">${icon('bookmark')}</button>
        </div>
      </header>

      <main id="main" class="reader-main">
        <article class="reader-article" id="readerArticle">
          <header class="chapter-head">
            ${chapter.status === 'draft' ? '<p class="chip chip--warning">پیش‌نویس، فقط شما این فصل را می‌بینید</p>' : ''}
            <p class="chapter-head__kicker">فصل ${toFa(chapter.number)}</p>
            <h1 class="chapter-head__title">${esc(chapter.title)}</h1>
            <p class="chapter-head__meta"><a href="novel.html?id=${novelId}">${esc(novel.title)}</a> · <a href="${novel.author ? 'profile.html?user=' + esc(novel.author.username) : '#'}">${esc(novel.authorName)}</a> · ${toFa(Math.max(1, Math.round(words / 220)))} دقیقه مطالعه</p>
            <span class="ornament" aria-hidden="true">❦</span>
          </header>
          <div class="chapter-body" id="chapterBody">${renderBlocks(chapter.blocks)}</div>
          <footer class="chapter-end">
            <span class="ornament" aria-hidden="true">✦ ✦ ✦</span>
            <p>پایان فصل ${toFa(chapter.number)}${!next && novel.status === 'completed' ? ' · پایان رمان' : ''}</p>
            <nav class="chapter-nav" aria-label="پیمایش فصل‌ها">
              ${prev ? `<a class="chapter-nav__link" href="${link(prev)}" rel="prev">${icon('chevronRight')}<span><small>فصل قبلی</small><strong>${esc(prev.title)}</strong></span></a>` : '<span></span>'}
              ${next ? `<a class="chapter-nav__link chapter-nav__link--next" href="${link(next)}" rel="next"><span><small>فصل بعدی</small><strong>${esc(next.title)}</strong></span>${icon('chevronLeft')}</a>`
                : `<a class="chapter-nav__link chapter-nav__link--next" href="novel.html?id=${novelId}#comments"><span><small>${novel.status === 'completed' ? 'رمان تمام شد' : 'فصل بعدی به‌زودی'}</small><strong>نظرتان را بنویسید</strong></span>${icon('message')}</a>`}
            </nav>
          </footer>
        </article>
      </main>

      <nav class="reader-dock" aria-label="فصل قبلی و بعدی">
        ${prev ? `<a class="btn btn--ghost btn--sm" href="${link(prev)}">${icon('chevronRight')}قبلی</a>` : '<span class="btn btn--ghost btn--sm is-disabled" aria-disabled="true">قبلی</span>'}
        <span class="reader-dock__pos">${toFa(idx + 1)} / ${toFa(chapters.length)}</span>
        ${next ? `<a class="btn btn--primary btn--sm" href="${link(next)}">بعدی${icon('chevronLeft')}</a>` : '<span class="btn btn--ghost btn--sm is-disabled" aria-disabled="true">بعدی</span>'}
      </nav>

      <aside class="reader-panel reader-panel--drawer" id="chapterDrawer" aria-label="فهرست فصل‌ها" hidden>
        <div class="reader-panel__head"><h2>فهرست فصل‌ها</h2><button type="button" class="icon-btn" data-close-panel aria-label="بستن">${icon('close')}</button></div>
        <ol class="drawer-chapters">${chapters.map((c) => `<li><a href="${link(c)}" class="${c.number === chapter.number ? 'is-current' : ''}"${c.number === chapter.number ? ' aria-current="page"' : ''}><span>فصل ${toFa(c.number)}</span>${esc(c.title)}${c.status === 'draft' ? ' <small>(پیش‌نویس)</small>' : ''}</a></li>`).join('')}</ol>
      </aside>

      <aside class="reader-panel" id="settingsPanel" aria-label="تنظیمات مطالعه" hidden>
        <div class="reader-panel__head"><h2>تنظیمات مطالعه</h2><button type="button" class="icon-btn" data-close-panel aria-label="بستن">${icon('close')}</button></div>
        <div class="setting"><span class="label" id="lbl-size">اندازه فونت</span>
          <div class="stepper" role="group" aria-labelledby="lbl-size"><button type="button" class="icon-btn" data-size="-1" aria-label="کوچک‌تر">A-</button><output id="sizeOut"></output><button type="button" class="icon-btn" data-size="1" aria-label="بزرگ‌تر">A+</button></div></div>
        <div class="setting"><span class="label">فونت متن</span>
          <div class="segmented segmented--block"><label><input type="radio" name="rFont" value="naskh"><span class="font-naskh">نسخ ادبی</span></label><label><input type="radio" name="rFont" value="vazir"><span>وزیر</span></label></div></div>
        <div class="setting"><span class="label">فاصله‌ی خطوط</span>
          <div class="segmented segmented--block"><label><input type="radio" name="rLeading" value="1.8"><span>فشرده</span></label><label><input type="radio" name="rLeading" value="2.1"><span>معمولی</span></label><label><input type="radio" name="rLeading" value="2.5"><span>باز</span></label></div></div>
        <div class="setting"><span class="label">عرض متن</span>
          <div class="segmented segmented--block"><label><input type="radio" name="rWidth" value="narrow"><span>باریک</span></label><label><input type="radio" name="rWidth" value="normal"><span>معمولی</span></label><label><input type="radio" name="rWidth" value="wide"><span>عریض</span></label></div></div>
        <div class="setting"><span class="label">تم مطالعه</span>
          <div class="theme-swatches" role="radiogroup" aria-label="تم مطالعه">
            <label class="swatch swatch--dark"><input type="radio" name="rTheme" value="dark"><span>تاریک</span></label>
            <label class="swatch swatch--light"><input type="radio" name="rTheme" value="light"><span>روشن</span></label>
            <label class="swatch swatch--sepia"><input type="radio" name="rTheme" value="sepia"><span>کاغذی</span></label>
          </div></div>
        <button type="button" class="btn btn--ghost btn--block" id="resetReader">${icon('refresh')}بازگشت به پیش‌فرض</button>
      </aside>
      <div class="reader-scrim" id="readerScrim" hidden></div>`;

    /* ---------- اعمال تنظیمات ---------- */
    const article = qs('#readerArticle');
    const apply = () => {
      const s = settings.get();
      const theme = s.theme || NR.theme.get();
      document.body.dataset.readerTheme = theme;
      article.style.setProperty('--reader-size', s.size + 'px');
      article.style.setProperty('--reader-width', WIDTHS[s.width]);
      article.style.setProperty('--reader-leading', s.leading);
      article.style.setProperty('--reader-font', FONTS[s.font]);
      qs('#sizeOut').textContent = toFa(s.size);
      [['rFont', s.font], ['rLeading', String(s.leading)], ['rWidth', s.width], ['rTheme', theme]].forEach(([n, v]) => {
        const r = qs(`input[name="${n}"][value="${v}"]`);
        if (r) r.checked = true;
      });
    };
    apply();
    qsa('[data-size]').forEach((b) => b.addEventListener('click', () => {
      const s = settings.get();
      settings.set({ size: Math.min(28, Math.max(15, s.size + Number(b.dataset.size))) });
      apply();
    }));
    qs('#settingsPanel').addEventListener('change', (e) => {
      const map = { rFont: 'font', rLeading: 'leading', rWidth: 'width', rTheme: 'theme' };
      const key = map[e.target.name];
      if (!key) return;
      settings.set({ [key]: key === 'leading' ? Number(e.target.value) : e.target.value });
      if (key === 'theme' && e.target.value !== 'sepia') NR.theme.set(e.target.value);
      apply();
    });
    qs('#resetReader').addEventListener('click', () => { NR.storage.set('reader', {}); apply(); NR.ui.toast('تنظیمات مطالعه بازنشانی شد.', 'info'); });

    /* ---------- پنل‌ها ---------- */
    const scrim = qs('#readerScrim');
    const closePanels = () => {
      qsa('.reader-panel').forEach((p) => (p.hidden = true));
      qsa('[data-panel]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      scrim.hidden = true;
    };
    qsa('[data-panel]').forEach((btn) => btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.panel);
      const open = panel.hidden;
      closePanels();
      if (open) {
        panel.hidden = false;
        scrim.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        const cur = panel.querySelector('.is-current, input:checked, button');
        cur && cur.focus();
        if (cur && cur.classList.contains('is-current')) cur.scrollIntoView({ block: 'center' });
      }
    }));
    qsa('[data-close-panel]').forEach((b) => b.addEventListener('click', closePanels));
    scrim.addEventListener('click', closePanels);

    /* ---------- حالت تمرکز ---------- */
    const focusBtn = qs('#focusToggle');
    const setFocus = (on) => {
      document.body.classList.toggle('is-focus-mode', on);
      focusBtn.setAttribute('aria-pressed', String(on));
      if (on) NR.ui.toast('حالت مطالعه فعال شد. برای خروج F یا Esc را بزنید.', 'info', 2400);
    };
    focusBtn.addEventListener('click', () => setFocus(!document.body.classList.contains('is-focus-mode')));

    /* ---------- کیبورد ---------- */
    document.addEventListener('keydown', (e) => {
      if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
      if (e.key === 'ArrowLeft' && next) location.href = link(next);
      if (e.key === 'ArrowRight' && prev) location.href = link(prev);
      if (e.key.toLowerCase() === 'f' || e.key === 'ب') setFocus(!document.body.classList.contains('is-focus-mode'));
      if (e.key === 'Escape') { closePanels(); setFocus(false); }
    });

    /* ---------- نوار پیشرفت و مخفی شدن نوار بالا ---------- */
    const bar = qs('#readerBar');
    const prog = qs('#readProgress');
    let lastY = window.scrollY;
    let saveTimer;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 100;
      prog.style.width = pct + '%';
      const down = window.scrollY > lastY && window.scrollY > 120;
      bar.classList.toggle('is-hidden', down);
      document.body.classList.toggle('dock-hidden', down);
      lastY = window.scrollY;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => NR.api.progress.set(novelId, chapter.number, Math.round(pct)), 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    document.addEventListener('nr:theme', (e) => { if (settings.get().theme !== 'sepia') { settings.set({ theme: e.detail }); apply(); } });
  };
})();
