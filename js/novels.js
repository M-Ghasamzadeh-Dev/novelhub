/**
 * novels.js
 * ---------------------------------------------------------------
 * صفحات مربوط به رمان:
 *   home · categories · novel (جزئیات) · authors ·
 *   create-novel · edit-novel (همراه با مدیریت فصل‌ها)
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { qs, qsa, escapeHTML: esc, toFa, formatNumber: num, formatDate, getParam } = NR.utils;
  const icon = (n, c) => NR.ui.icon(n, c);
  const fa1 = (x) => toFa(Number(x || 0).toFixed(1)).replace('.', '٫');

  /* ============================== صفحه اصلی ============================== */
  NR.pages.home = async function () {
    const grids = { popular: qs('#popularGrid'), fresh: qs('#newGrid'), ongoing: qs('#ongoingGrid') };
    Object.values(grids).forEach((g) => (g.innerHTML = NR.ui.skeletonCards(g.dataset.count ? Number(g.dataset.count) : 5)));
    qs('#rankList').innerHTML = NR.ui.skeletonLines(5);
    qs('#authorsGrid').innerHTML = NR.ui.skeletonLines(3);

    const all = await NR.api.novels.list({ sort: 'popular' });
    // ژانرها با تعداد رمان
    qs('#homeGenres').innerHTML = NR.api.genres().map((g) => NR.ui.genreCard(g, all.filter((n) => n.genres.includes(g.slug)).length)).join('');

    // Hero: سه کاور برتر
    const top = all.filter((n) => n.ageRating !== '18').slice(0, 3);
    qs('#heroStack').innerHTML = top.map((n, i) => `<a href="novel.html?id=${n.id}" class="hero-book hero-book--${i + 1}" aria-label="${esc(n.title)}"><img src="${NR.ui.cover(n)}" alt="کاور رمان ${esc(n.title)}" width="300" height="450"></a>`).join('');
    const authorsCount = new Set(all.map((n) => n.authorId)).size;
    qs('#heroStats').innerHTML = `<div><dt>رمان</dt><dd>${toFa(all.length)}</dd></div><div><dt>نویسنده</dt><dd>${toFa(authorsCount)}</dd></div><div><dt>فصل منتشرشده</dt><dd>${toFa(all.reduce((s, n) => s + n.chapterCount, 0))}</dd></div>`;

    const byRating = [...all].sort((a, b) => b.rating - a.rating).slice(0, 10);
    const newest = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    const ongoing = all.filter((n) => n.status === 'ongoing').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    grids.popular.innerHTML = byRating.map(NR.ui.novelCard).join('');
    grids.fresh.innerHTML = newest.map(NR.ui.novelCard).join('');
    grids.ongoing.innerHTML = ongoing.map(NR.ui.novelCard).join('');
    qs('#rankList').innerHTML = all.slice(0, 5).map((n, i) => NR.ui.rankItem(n, i + 1)).join('');

    // ادامه‌ی مطالعه
    const recent = NR.api.progress.recent(4).map((p) => ({ p, n: all.find((x) => x.id === p.novelId) })).filter((x) => x.n);
    if (recent.length) {
      qs('#continueSection').hidden = false;
      qs('#continueList').innerHTML = recent.map(({ p, n }) => `
        <a class="continue-card" href="reader.html?id=${n.id}&ch=${p.chapterNumber}">
          <img src="${NR.ui.cover(n)}" alt="" width="56" height="84">
          <span><strong>${esc(n.title)}</strong><small>فصل ${toFa(p.chapterNumber)} از ${toFa(n.chapterCount)}</small>
          <span class="progress" aria-label="پیشرفت مطالعه"><span style="width:${Math.round((p.chapterNumber / Math.max(1, n.chapterCount)) * 100)}%"></span></span></span>
          ${icon('chevronLeft')}
        </a>`).join('');
    }

    const authors = await NR.api.users.authors({ limit: 6 });
    qs('#authorsGrid').innerHTML = authors.map(NR.ui.authorCard).join('');
    NR.ui.reveal();
  };

  /* ============================== صفحه دسته‌بندی ============================== */
  NR.pages.categories = async function () {
    const root = qs('#categoriesRoot');
    const slug = getParam('genre');
    const genre = NR.api.genres().find((g) => g.slug === slug);

    if (!slug) {
      const all = await NR.api.novels.list();
      root.innerHTML = `
        <header class="page-head container"><p class="eyebrow">کتابخانه</p><h1>دسته‌بندی رمان‌ها</h1><p class="page-head__lead">از عاشقانه تا علمی تخیلی؛ قفسه‌ی مورد علاقه‌تان را انتخاب کنید.</p></header>
        <section class="container"><div class="genre-grid genre-grid--large">${NR.api.genres().map((g) => NR.ui.genreCard(g, all.filter((n) => n.genres.includes(g.slug)).length)).join('')}</div></section>`;
      return;
    }
    if (!genre) {
      root.innerHTML = NR.ui.errorState({ title: 'این دسته‌بندی وجود ندارد', text: 'دسته‌بندی مورد نظر پیدا نشد.' });
      return;
    }
    if (genre.adult) await NR.ui.adultGate();
    NR.ui.setMeta({ title: `رمان‌های ${genre.name}`, description: `${genre.desc}؛ فهرست رمان‌های ${genre.name} در شب‌نامه.` });
    root.innerHTML = `
      <section class="genre-hero" style="--g1:${genre.colors[0]};--g2:${genre.colors[1]}">
        <div class="container">
          <nav class="breadcrumb" aria-label="مسیر صفحه"><a href="home.html">خانه</a><span aria-hidden="true">/</span><a href="categories.html">دسته‌بندی‌ها</a><span aria-hidden="true">/</span><span aria-current="page">${genre.name}</span></nav>
          <h1>${genre.name}</h1><p>${genre.desc}</p>
        </div>
        <span class="genre-hero__glyph" aria-hidden="true">${genre.name.charAt(0)}</span>
      </section>
      <section class="container">
        <div class="toolbar" role="search">
          <div class="input-icon">${icon('search')}<label class="sr-only" for="catSearch">جستجو در این دسته</label><input id="catSearch" class="input" type="search" placeholder="جستجو در رمان‌های ${genre.name}…"></div>
          <div class="segmented" role="radiogroup" aria-label="وضعیت انتشار">
            <label><input type="radio" name="catStatus" value="" checked><span>همه</span></label>
            <label><input type="radio" name="catStatus" value="ongoing"><span>در حال انتشار</span></label>
            <label><input type="radio" name="catStatus" value="completed"><span>تکمیل شده</span></label>
          </div>
          <label class="select-wrap"><span class="sr-only">مرتب‌سازی</span>
            <select id="catSort" class="input"><option value="newest">جدیدترین</option><option value="popular">محبوب‌ترین</option><option value="views">بیشترین بازدید</option><option value="rating">بالاترین امتیاز</option></select>
          </label>
        </div>
        <p class="result-count" id="catCount" aria-live="polite"></p>
        <div class="novel-grid" id="catGrid"></div>
      </section>`;
    const state = { q: '', status: '', sort: 'newest' };
    const grid = qs('#catGrid');
    const run = async () => {
      grid.classList.add('novel-grid');
      grid.innerHTML = NR.ui.skeletonCards(8);
      const list = await NR.api.novels.list({ genres: [slug], q: state.q, status: state.status, sort: state.sort });
      qs('#catCount').textContent = `${toFa(list.length)} رمان در دسته‌ی ${genre.name}`;
      if (!list.length) {
        grid.classList.remove('novel-grid');
        grid.innerHTML = NR.ui.emptyState({ title: 'رمانی با این فیلترها پیدا نشد.', text: 'شاید وقتش رسیده باشد که خودتان اولین رمان این دسته را بنویسید.', action: { label: 'نوشتن رمان', href: 'create-novel.html', icon: 'pen' } });
      } else grid.innerHTML = list.map(NR.ui.novelCard).join('');
    };
    qs('#catSearch').addEventListener('input', NR.utils.debounce((e) => { state.q = e.target.value.trim(); run(); }, 250));
    qsa('input[name="catStatus"]').forEach((r) => r.addEventListener('change', () => { state.status = r.value; run(); }));
    qs('#catSort').addEventListener('change', (e) => { state.sort = e.target.value; run(); });
    run();
  };

  /* ============================== صفحه نویسندگان ============================== */
  NR.pages.authors = async function () {
    const grid = qs('#authorsList');
    grid.innerHTML = NR.ui.skeletonLines(4);
    const authors = await NR.api.users.authors();
    const render = (q = '') => {
      const nq = NR.utils.normalize(q);
      const list = authors.filter((a) => !nq || NR.utils.normalize(a.displayName + ' ' + a.username).includes(nq));
      grid.innerHTML = list.length ? list.map(NR.ui.authorCard).join('') : NR.ui.emptyState({ iconName: 'users', title: 'نویسنده‌ای پیدا نشد.' });
    };
    render();
    qs('#authorSearch').addEventListener('input', (e) => render(e.target.value));
  };

  /* ============================== صفحه جزئیات رمان ============================== */
  NR.pages.novel = async function () {
    const root = qs('#novelRoot');
    const id = getParam('id');
    root.innerHTML = `<div class="container novel-skeleton"><div class="skeleton skeleton--cover"></div><div>${NR.ui.skeletonLines(6)}</div></div>`;
    let novel;
    try {
      novel = await NR.api.novels.get(id);
    } catch (err) {
      root.innerHTML = NR.ui.errorState({ title: 'رمان پیدا نشد', text: 'این رمان وجود ندارد، حذف شده یا هنوز منتشر نشده است.' });
      NR.ui.setMeta({ title: 'رمان پیدا نشد' });
      return;
    }
    if (novel.ageRating === '18' && !novel.isOwner) {
      root.innerHTML = `<div class="container novel-skeleton is-veiled"><div class="skeleton skeleton--cover"></div><div>${NR.ui.skeletonLines(6)}</div></div>`;
      const ok = await NR.ui.adultGate();
      if (!ok) return;
    }
    NR.api.novels.view(novel.id);
    NR.ui.setMeta({ title: novel.title, description: novel.summary });
    const chapters = await NR.api.chapters.list(novel.id);
    const progress = NR.api.progress.get(novel.id);
    const coverUrl = NR.ui.cover(novel);
    const typeLabel = { text: 'متنی', image: 'تصویری', mixed: 'متن + تصویر' }[novel.contentType];
    const readTime = Math.max(1, Math.round(chapters.reduce((s, c) => s + c.words, 0) / 220));

    root.innerHTML = `
      <section class="novel-hero">
        <div class="novel-hero__backdrop" style="background-image:url('${coverUrl}')" aria-hidden="true"></div>
        <div class="container novel-hero__inner">
          <div class="novel-hero__cover">
            <img src="${coverUrl}" alt="کاور رمان ${esc(novel.title)}" width="300" height="450">
            ${NR.ui.statusRibbon(novel.status)}
          </div>
          <div class="novel-hero__info">
            <nav class="breadcrumb" aria-label="مسیر صفحه"><a href="home.html">خانه</a><span aria-hidden="true">/</span><a href="categories.html?genre=${novel.genres[0]}">${esc(novel.genresInfo[0] ? novel.genresInfo[0].name : '')}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(novel.title)}</span></nav>
            <div class="chip-row">${novel.genresInfo.map((g) => `<a class="chip" href="categories.html?genre=${g.slug}">${g.name}</a>`).join('')}${NR.ui.ageBadge(novel.ageRating)}${novel.visibility === 'draft' ? '<span class="chip chip--warning">پیش‌نویس (فقط شما می‌بینید)</span>' : ''}</div>
            <h1 class="novel-hero__title">${esc(novel.title)}</h1>
            <div class="novel-hero__author">
              ${novel.author ? `<a href="profile.html?user=${esc(novel.author.username)}" class="author-inline">${NR.ui.avatar(novel.author, 40)}<span><small>نوشته‌ی</small><strong>${esc(novel.authorName)}</strong></span></a>` : ''}
              ${novel.author && !novel.isOwner ? `<button type="button" class="btn btn--sm ${NR.api.users.isFollowing(novel.authorId) ? 'btn--ghost' : 'btn--outline'}" data-follow="${novel.authorId}">${NR.api.users.isFollowing(novel.authorId) ? 'دنبال می‌کنید' : 'دنبال کردن'}</button>` : ''}
            </div>
            <p class="novel-hero__summary">${esc(novel.summary)}</p>
            <ul class="stat-row" aria-label="آمار رمان">
              <li><strong>${fa1(novel.rating)}</strong><span>${icon('star')}امتیاز</span></li>
              <li><strong>${toFa(novel.chapterCount)}</strong><span>${icon('list')}فصل</span></li>
              <li><strong>${num(novel.views)}</strong><span>${icon('eye')}بازدید</span></li>
              <li><strong id="likeCount">${num(novel.likes)}</strong><span>${icon('like')}لایک</span></li>
              <li><strong id="dislikeCount">${num(novel.dislikes)}</strong><span>${icon('dislike')}دیس‌لایک</span></li>
              <li><strong>${toFa(novel.commentCount)}</strong><span>${icon('message')}نظر</span></li>
            </ul>
            <div class="novel-actions">
              ${chapters.length ? `<a class="btn btn--primary btn--lg" href="reader.html?id=${novel.id}&ch=${chapters[0].number}">${icon('book')}شروع مطالعه</a>` : '<span class="btn btn--primary btn--lg is-disabled" aria-disabled="true">هنوز فصلی منتشر نشده</span>'}
              ${progress && chapters.length ? `<a class="btn btn--outline btn--lg" href="reader.html?id=${novel.id}&ch=${progress.chapterNumber}">${icon('chevronLeft')}ادامه مطالعه (فصل ${toFa(progress.chapterNumber)})</a>` : ''}
              <button type="button" class="btn btn--ghost btn--lg bookmark-btn${novel.bookmarked ? ' is-active' : ''}" data-bookmark="${novel.id}" aria-pressed="${novel.bookmarked}">${icon('bookmark')}<span data-bookmark-label>${novel.bookmarked ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}</span></button>
              <div class="react-group" role="group" aria-label="واکنش به رمان">
                <button type="button" class="react-btn${novel.userReaction === 'like' ? ' is-active' : ''}" data-react="like" aria-pressed="${novel.userReaction === 'like'}" aria-label="لایک">${icon('like')}</button>
                <button type="button" class="react-btn react-btn--down${novel.userReaction === 'dislike' ? ' is-active' : ''}" data-react="dislike" aria-pressed="${novel.userReaction === 'dislike'}" aria-label="دیس‌لایک">${icon('dislike')}</button>
              </div>
              ${novel.isOwner ? `<a class="btn btn--ghost btn--lg" href="edit-novel.html?id=${novel.id}">${icon('pen')}ویرایش</a>` : ''}
            </div>
          </div>
        </div>
      </section>

      <section class="container novel-layout">
        <div class="novel-main">
          <article class="panel">
            <h2 class="panel__title">درباره‌ی رمان</h2>
            <p class="prose">${esc(novel.description || novel.summary).replace(/\n/g, '<br>')}</p>
            ${novel.tags.length ? `<div class="chip-row">${novel.tags.map((t) => `<a class="chip chip--tag" href="search.html?q=${encodeURIComponent(t)}&field=tag">#${esc(t)}</a>`).join('')}</div>` : ''}
          </article>
          <article class="panel" id="chapters">
            <div class="section-head"><h2 class="panel__title">فهرست فصل‌ها</h2>
              ${chapters.length > 1 ? `<button type="button" class="btn btn--ghost btn--sm" id="sortChapters" aria-label="تغییر ترتیب فصل‌ها">${icon('arrowDown')}<span>قدیمی‌ترین</span></button>` : ''}</div>
            ${chapters.length ? `<ol class="chapter-list" id="chapterList">${chapters.map((c) => `
              <li><a class="chapter-item${progress && c.number <= progress.chapterNumber ? ' is-read' : ''}" href="reader.html?id=${novel.id}&ch=${c.number}">
                <span class="chapter-item__num">فصل ${toFa(c.number)}</span>
                <span class="chapter-item__title">${esc(c.title)}</span>
                <span class="chapter-item__meta"><time datetime="${c.publishedAt || c.updatedAt}">${formatDate(c.publishedAt || c.updatedAt)}</time> · ${toFa(Math.max(1, Math.round(c.words / 220)))} دقیقه</span>
              </a></li>`).join('')}</ol>` : NR.ui.emptyState({ iconName: 'file', title: 'هنوز فصلی منتشر نشده است.', action: novel.isOwner ? { label: 'افزودن اولین فصل', href: `edit-novel.html?id=${novel.id}#chapter-new`, icon: 'plus' } : null })}
          </article>
          <section class="panel comments" id="comments" aria-label="نظرات"></section>
        </div>
        <aside class="novel-aside">
          <div class="panel">
            <h2 class="panel__title">مشخصات</h2>
            <dl class="meta-list">
              <div><dt>وضعیت</dt><dd><span class="status-dot status-dot--${novel.status}"></span>${NR.utils.statusLabel(novel.status)}</dd></div>
              <div><dt>ژانر</dt><dd>${esc(novel.genresInfo.map((g) => g.name).join('، '))}</dd></div>
              <div><dt>رده سنی</dt><dd>${NR.utils.ageLabel(novel.ageRating)}</dd></div>
              <div><dt>نوع محتوا</dt><dd>${typeLabel}</dd></div>
              <div><dt>تاریخ انتشار</dt><dd>${formatDate(novel.createdAt)}</dd></div>
              <div><dt>آخرین بروزرسانی</dt><dd>${formatDate(novel.updatedAt)}</dd></div>
              <div><dt>زمان مطالعه</dt><dd>حدود ${toFa(readTime)} دقیقه</dd></div>
            </dl>
          </div>
          <div class="panel"><h2 class="panel__title">رمان‌های مشابه</h2><ul class="rank-list rank-list--compact" id="similarList">${NR.ui.skeletonLines(3)}</ul></div>
        </aside>
      </section>`;

    // لایک / دیس‌لایک
    qsa('[data-react]', root).forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (!NR.auth.require(btn.dataset.react === 'like' ? 'برای لایک کردن ابتدا وارد حساب کاربری خود شوید.' : 'برای دیس‌لایک کردن ابتدا وارد حساب کاربری خود شوید.')) return;
        try {
          const res = await NR.api.novels.react(novel.id, btn.dataset.react);
          qs('#likeCount').textContent = num(res.likes);
          qs('#dislikeCount').textContent = num(res.dislikes);
          qsa('[data-react]', root).forEach((b) => {
            const on = b.dataset.react === res.userReaction;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
          if (res.userReaction === 'like') NR.ui.toast('این رمان را پسندیدید.', 'success');
          else if (res.userReaction === 'dislike') NR.ui.toast('نظر شما ثبت شد.', 'info');
        } catch (err) { NR.ui.toast(err.message, 'error'); }
      })
    );

    // ترتیب فصل‌ها
    const sortBtn = qs('#sortChapters');
    if (sortBtn) sortBtn.addEventListener('click', () => {
      const list = qs('#chapterList');
      const items = Array.from(list.children).reverse();
      list.append(...items);
      const desc = sortBtn.dataset.desc !== 'true';
      sortBtn.dataset.desc = String(desc);
      list.classList.toggle('is-desc', desc);
      sortBtn.innerHTML = `${icon(desc ? 'arrowUp' : 'arrowDown')}<span>${desc ? 'جدیدترین' : 'قدیمی‌ترین'}</span>`;
    });

    NR.comments.mount(qs('#comments'), novel);

    const similar = (await NR.api.novels.list({ sort: 'popular' })).filter((n) => n.id !== novel.id && n.genres.some((g) => novel.genres.includes(g))).slice(0, 4);
    qs('#similarList').innerHTML = similar.length ? similar.map((n, i) => NR.ui.rankItem(n, i + 1)).join('') : '<li class="muted">موردی پیدا نشد.</li>';
  };

  /* ============================== فرم رمان (مشترک ایجاد/ویرایش) ============================== */
  function novelFormHTML(n = {}, mode = 'create') {
    const genres = NR.api.genres();
    const selected = n.genres || [];
    const primary = selected[0] || '';
    const radio = (name, value, label, current, extra = '') => `<label class="radio-card"><input type="radio" name="${name}" value="${value}" ${current === value ? 'checked' : ''} ${extra}><span>${label}</span></label>`;
    return `
      <form id="novelForm" class="novel-form" novalidate>
        <div class="novel-form__main">
          <fieldset class="panel form-section">
            <legend class="panel__title">${icon('book')}اطلاعات اصلی</legend>
            <div class="field"><label for="title">عنوان رمان <span class="req">*</span></label>
              <input id="title" name="title" class="input input--lg" maxlength="80" required value="${esc(n.title || '')}" placeholder="مثلاً: شب‌های بی‌ماه"><span class="field__hint" data-counter="title">${toFa((n.title || '').length)} / ۸۰</span></div>
            <div class="field"><label for="summary">توضیح کوتاه <span class="req">*</span></label>
              <textarea id="summary" name="summary" class="input" rows="2" maxlength="200" required placeholder="یک یا دو جمله که خواننده را کنجکاو کند">${esc(n.summary || '')}</textarea><span class="field__hint" data-counter="summary">${toFa((n.summary || '').length)} / ۲۰۰</span></div>
            <div class="field"><label for="description">توضیحات کامل</label>
              <textarea id="description" name="description" class="input" rows="6" maxlength="3000" placeholder="خلاصه‌ی داستان، شخصیت‌ها و فضای کلی رمان…">${esc(n.description || '')}</textarea></div>
            <div class="field"><label for="penName">نام مستعار نویسنده</label>
              <input id="penName" name="penName" class="input" maxlength="40" value="${esc(n.penName || '')}" placeholder="اختیاری؛ در غیر این صورت نام حساب شما نمایش داده می‌شود"></div>
          </fieldset>

          <fieldset class="panel form-section">
            <legend class="panel__title">${icon('grid')}ژانر</legend>
            <div class="field"><label for="primaryGenre">ژانر اصلی <span class="req">*</span></label>
              <select id="primaryGenre" name="primaryGenre" class="input"><option value="">انتخاب ژانر…</option>${genres.map((g) => `<option value="${g.slug}" ${primary === g.slug ? 'selected' : ''}>${g.name}</option>`).join('')}</select></div>
            <div class="field"><span class="label" id="extraGenresLabel">ژانرهای فرعی <small class="muted">(حداکثر ۲ مورد)</small></span>
              <div class="chip-checks" id="extraGenres" role="group" aria-labelledby="extraGenresLabel">${genres.map((g) => `<label class="chip-check"><input type="checkbox" name="extraGenre" value="${g.slug}" ${selected.slice(1).includes(g.slug) ? 'checked' : ''} ${primary === g.slug ? 'disabled' : ''}><span>${g.name}</span></label>`).join('')}</div></div>
          </fieldset>

          <fieldset class="panel form-section">
            <legend class="panel__title">${icon('layers')}نوع محتوا و وضعیت</legend>
            <div class="field"><span class="label">نوع محتوا</span>
              <div class="radio-cards radio-cards--3">
                ${radio('contentType', 'text', `${icon('type')}<strong>متن</strong><small>رمان متنی کلاسیک</small>`, n.contentType || 'text')}
                ${radio('contentType', 'image', `${icon('image')}<strong>تصویر</strong><small>کمیک / رمان تصویری</small>`, n.contentType)}
                ${radio('contentType', 'mixed', `${icon('layers')}<strong>متن + تصویر</strong><small>رمان مصور</small>`, n.contentType)}
              </div></div>
            <div class="field"><span class="label">وضعیت رمان</span>
              <div class="segmented">${[['ongoing', 'در حال انتشار'], ['completed', 'تکمیل شده']].map(([v, l]) => `<label><input type="radio" name="status" value="${v}" ${(n.status || 'ongoing') === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
            <div class="field"><span class="label">رده سنی</span>
              <div class="segmented" id="ageGroup">${[['all', 'عمومی'], ['13', '+۱۳'], ['16', '+۱۶'], ['18', '+۱۸']].map(([v, l]) => `<label><input type="radio" name="ageRating" value="${v}" ${(n.ageRating || 'all') === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
            <label class="switch"><input type="checkbox" name="adult" id="adultSwitch" ${n.adult ? 'checked' : ''}><span class="switch__track" aria-hidden="true"></span><span><strong>این رمان محتوای +۱۸ دارد</strong><small>رمان پشت صفحه‌ی هشدار سنی نمایش داده می‌شود.</small></span></label>
          </fieldset>

          <fieldset class="panel form-section">
            <legend class="panel__title">${icon('sparkle')}تگ‌ها</legend>
            <div class="field"><label for="tagsInput">تگ‌ها <small class="muted">(حداکثر ۸ تگ)</small></label><div id="tagsBox" data-input-id="tagsInput"></div>
              <span class="field__hint">با Enter یا ویرگول تگ جدید اضافه کنید.</span></div>
          </fieldset>
        </div>

        <aside class="novel-form__aside">
          <div class="panel form-section sticky">
            <h2 class="panel__title">${icon('image')}تصویر کاور</h2>
            <div id="coverUploader"></div>
            <p class="field__hint">نسبت پیشنهادی ۲ به ۳ (مثلاً ۶۰۰×۹۰۰). اگر کاوری انتخاب نکنید، کاور هنری خودکار ساخته می‌شود.</p>
            <div class="live-preview"><span class="label">پیش‌نمایش کارت</span><div id="livePreview"></div></div>
            <div class="form-actions">
              ${mode === 'create'
                ? `<button type="submit" class="btn btn--primary btn--block btn--lg" data-visibility="published">${icon('check')}ایجاد رمان</button><button type="submit" class="btn btn--ghost btn--block" data-visibility="draft">${icon('file')}ذخیره به‌عنوان پیش‌نویس</button>`
                : `<button type="submit" class="btn btn--primary btn--block btn--lg" data-visibility="${n.visibility || 'published'}">${icon('check')}ذخیره تغییرات</button>
                   ${n.visibility === 'draft' ? `<button type="submit" class="btn btn--outline btn--block" data-visibility="published">${icon('send')}انتشار رمان</button>` : `<button type="submit" class="btn btn--ghost btn--block" data-visibility="draft">${icon('file')}بازگرداندن به پیش‌نویس</button>`}`}
            </div>
          </div>
        </aside>
      </form>`;
  }

  /** اتصال رفتارهای فرم رمان و برگرداندن تابع خواندن داده */
  function bindNovelForm(form, novel = {}) {
    const coverUp = NR.ui.imageUploader(qs('#coverUploader'), { value: novel.cover || null, onChange: () => preview() });
    const tags = NR.ui.tagInput(qs('#tagsBox'), { value: novel.tags || [] });
    const me = NR.auth.user();

    const read = () => {
      const primary = form.primaryGenre.value;
      const extra = qsa('input[name="extraGenre"]:checked', form).map((c) => c.value).filter((g) => g !== primary);
      return {
        title: form.title.value, summary: form.summary.value, description: form.description.value, penName: form.penName.value,
        genres: primary ? [primary, ...extra] : extra, contentType: qs('input[name="contentType"]:checked', form).value,
        status: qs('input[name="status"]:checked', form).value, ageRating: qs('input[name="ageRating"]:checked', form).value,
        adult: form.adult.checked, cover: coverUp.getValue(), tags: tags.getValue()
      };
    };

    const preview = () => {
      const d = read();
      const fake = {
        id: novel.id || 'preview', title: d.title || 'عنوان رمان', authorName: d.penName || (me ? me.displayName : ''), genres: d.genres.length ? d.genres : ['drama'],
        genresInfo: (d.genres.length ? d.genres : ['drama']).map((g) => NR.api.genres().find((x) => x.slug === g)), status: d.status, ageRating: d.adult ? '18' : d.ageRating,
        contentType: d.contentType, cover: d.cover, chapterCount: novel.chapterCount || 0, views: novel.views || 0, likes: novel.likes || 0, rating: novel.rating || 0, motif: novel.motif, palette: novel.palette
      };
      qs('#livePreview').innerHTML = NR.ui.novelCard(fake).replace(/<button[\s\S]*?<\/button>/, '').replace(/href="[^"]*"/, 'href="#" tabindex="-1" aria-disabled="true"').replace(' is-blurred', '').replace(/<span class="adult-veil">[\s\S]*?<\/span>/, '');
    };

    // شمارنده‌ی کاراکتر
    ['title', 'summary'].forEach((name) => form[name].addEventListener('input', () => {
      qs(`[data-counter="${name}"]`).textContent = `${toFa(form[name].value.length)} / ${toFa(form[name].maxLength)}`;
    }));
    // ژانر اصلی نباید در فرعی‌ها انتخاب شود + محدودیت ۲ ژانر فرعی
    form.primaryGenre.addEventListener('change', () => {
      qsa('input[name="extraGenre"]', form).forEach((c) => {
        c.disabled = c.value === form.primaryGenre.value;
        if (c.disabled) c.checked = false;
      });
      NR.ui.fieldError(form.primaryGenre, null);
    });
    qs('#extraGenres').addEventListener('change', (e) => {
      if (qsa('input[name="extraGenre"]:checked', form).length > 2) {
        e.target.checked = false;
        NR.ui.toast('حداکثر دو ژانر فرعی می‌توانید انتخاب کنید.', 'warning');
      }
    });
    // هماهنگی سوئیچ +۱۸ با رده سنی
    const syncAdult = () => {
      const on = form.adult.checked;
      qsa('input[name="ageRating"]', form).forEach((r) => {
        if (on) r.checked = r.value === '18';
        r.disabled = on && r.value !== '18';
      });
    };
    form.adult.addEventListener('change', syncAdult);
    qs('#ageGroup').addEventListener('change', () => { if (qs('input[name="ageRating"]:checked', form).value === '18') { form.adult.checked = true; syncAdult(); } });
    syncAdult();
    form.addEventListener('input', NR.utils.debounce(preview, 150));
    form.addEventListener('change', preview);
    preview();

    const validate = () => {
      const d = read();
      const checks = [[form.title, d.title.trim().length >= 2, 'عنوان رمان باید حداقل ۲ حرف باشد.'], [form.summary, d.summary.trim().length >= 10, 'توضیح کوتاه باید حداقل ۱۰ حرف باشد.'], [form.primaryGenre, !!form.primaryGenre.value, 'ژانر اصلی را انتخاب کنید.']];
      let ok = true;
      checks.forEach(([el, valid, msg]) => { NR.ui.fieldError(el, valid ? null : msg); if (!valid) ok = false; });
      if (!ok) {
        const first = form.querySelector('[aria-invalid="true"]');
        first && first.focus();
        NR.ui.toast('لطفاً فیلدهای الزامی را کامل کنید.', 'error');
      }
      return ok ? d : null;
    };
    return { read, validate };
  }

  /* ============================== صفحه ایجاد رمان ============================== */
  NR.pages['create-novel'] = function () {
    if (!NR.auth.guardPage('برای نوشتن و انتشار رمان ابتدا وارد حساب کاربری خود شوید.')) return;
    const root = qs('#novelFormRoot');
    root.innerHTML = novelFormHTML({}, 'create');
    const form = qs('#novelForm');
    const ctrl = bindNovelForm(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = ctrl.validate();
      if (!data) return;
      const btn = e.submitter || form.querySelector('[type="submit"]');
      data.visibility = btn.dataset.visibility || 'published';
      NR.ui.setLoading(btn, true, 'در حال ذخیره…');
      try {
        const novel = await NR.api.novels.create(data);
        NR.ui.toast(data.visibility === 'draft' ? 'رمان به‌عنوان پیش‌نویس ذخیره شد.' : 'رمان ایجاد شد! حالا اولین فصل را بنویسید.', 'success');
        setTimeout(() => (location.href = `edit-novel.html?id=${novel.id}#chapter-new`), 700);
      } catch (err) {
        NR.ui.setLoading(btn, false);
        NR.ui.toast(err.message, 'error');
      }
    });
  };

  /* ============================== ویرایشگر فصل (بلاک‌ها) ============================== */
  function blockHTML(b, i) {
    const tools = `<div class="block__tools">
        <button type="button" class="icon-btn icon-btn--sm" data-move="-1" aria-label="انتقال به بالا">${icon('arrowUp')}</button>
        <button type="button" class="icon-btn icon-btn--sm" data-move="1" aria-label="انتقال به پایین">${icon('arrowDown')}</button>
        <button type="button" class="icon-btn icon-btn--sm icon-btn--danger" data-remove-block aria-label="حذف این بخش">${icon('trash')}</button></div>`;
    if (b.type === 'image') {
      return `<div class="block block--image" data-index="${i}"><div class="block__head"><span>${icon('image')}بخش تصویری</span>${tools}</div>
        <div class="block__uploader"></div>
        <label class="sr-only" for="cap-${i}">توضیح تصویر</label><input id="cap-${i}" class="input input--sm" data-caption placeholder="توضیح زیر تصویر (اختیاری)" value="${esc(b.caption || '')}"></div>`;
    }
    return `<div class="block block--text" data-index="${i}"><div class="block__head"><span>${icon('type')}بخش متنی</span>${tools}</div>
      <label class="sr-only" for="txt-${i}">متن فصل</label><textarea id="txt-${i}" class="input block__text" rows="8" placeholder="متن فصل را اینجا بنویسید. هر خط خالی یک پاراگراف جدید است…">${esc(b.text || '')}</textarea></div>`;
  }

  function chapterEditor(host, novel, chapter, onDone) {
    let blocks = chapter && chapter.blocks ? NR.utils.clone(chapter.blocks) : novel.contentType === 'image' ? [{ type: 'image', src: null, caption: '' }] : [{ type: 'text', text: '' }];
    const number = chapter ? chapter.number : NR.api.chapters.nextNumber(novel.id);
    host.hidden = false;
    host.innerHTML = `
      <form class="panel chapter-editor" id="chapterForm" novalidate>
        <div class="section-head"><h3 class="panel__title">${chapter ? `ویرایش فصل ${toFa(chapter.number)}` : 'فصل جدید'}</h3>
          ${chapter ? `<span class="chip ${chapter.status === 'published' ? 'chip--success' : 'chip--warning'}">${NR.utils.statusLabel(chapter.status)}</span>` : ''}</div>
        <div class="form-row">
          <div class="field field--narrow"><label for="chNumber">شماره فصل</label><input id="chNumber" name="number" type="number" min="1" class="input" value="${number}" required></div>
          <div class="field"><label for="chTitle">عنوان فصل <span class="req">*</span></label><input id="chTitle" name="title" class="input" maxlength="80" value="${esc(chapter ? chapter.title : '')}" placeholder="مثلاً: شروع یک اتفاق عجیب" required></div>
        </div>
        <div class="field"><span class="label">متن و تصاویر فصل</span><div class="block-list" id="blockList"></div>
          <div class="block-add"><button type="button" class="btn btn--ghost btn--sm" data-add="text">${icon('plus')}بخش متن</button><button type="button" class="btn btn--ghost btn--sm" data-add="image">${icon('image')}افزودن تصویر</button><span class="muted" id="wordCount"></span></div>
        </div>
        <div class="form-actions form-actions--row">
          <button type="button" class="btn btn--ghost" data-cancel>انصراف</button>
          <button type="submit" class="btn btn--outline" data-publish="false">${icon('file')}ذخیره فصل</button>
          <button type="submit" class="btn btn--primary" data-publish="true">${icon('send')}${chapter && chapter.status === 'published' ? 'ذخیره و به‌روزرسانی' : 'انتشار فصل'}</button>
        </div>
      </form>`;
    const list = qs('#blockList', host);
    const form = qs('#chapterForm', host);

    const collect = () => {
      qsa('.block', list).forEach((el) => {
        const b = blocks[Number(el.dataset.index)];
        if (b.type === 'text') b.text = el.querySelector('textarea').value;
        else b.caption = el.querySelector('[data-caption]').value;
      });
    };
    const updateCount = () => {
      collect();
      const words = blocks.filter((b) => b.type === 'text').reduce((s, b) => s + (b.text.trim() ? b.text.trim().split(/\s+/).length : 0), 0);
      qs('#wordCount', host).textContent = `${toFa(words)} کلمه · ${toFa(blocks.filter((b) => b.type === 'image' && b.src).length)} تصویر`;
    };
    const render = () => {
      list.innerHTML = blocks.map(blockHTML).join('');
      qsa('.block--image', list).forEach((el) => {
        const b = blocks[Number(el.dataset.index)];
        NR.ui.imageUploader(el.querySelector('.block__uploader'), { value: b.src, aspect: 'wide', label: 'تصویر این بخش را انتخاب کنید', maxSize: 900, onChange: (v) => { b.src = v; updateCount(); } });
      });
      updateCount();
    };
    list.addEventListener('input', updateCount);
    list.addEventListener('click', async (e) => {
      const el = e.target.closest('.block');
      if (!el) return;
      const i = Number(el.dataset.index);
      const mv = e.target.closest('[data-move]');
      if (mv) {
        collect();
        const j = i + Number(mv.dataset.move);
        if (j < 0 || j >= blocks.length) return;
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        render();
        const moved = list.querySelector(`[data-index="${j}"] [data-move="${mv.dataset.move}"]`);
        moved && moved.focus();
      }
      if (e.target.closest('[data-remove-block]')) {
        collect();
        const b = blocks[i];
        if ((b.type === 'text' && b.text.trim()) || (b.type === 'image' && b.src)) {
          const ok = await NR.ui.confirm({ title: 'حذف بخش', text: 'محتوای این بخش حذف می‌شود.', confirmText: 'حذف', danger: true });
          if (!ok) return;
        }
        blocks.splice(i, 1);
        if (!blocks.length) blocks.push({ type: 'text', text: '' });
        render();
      }
    });
    qsa('[data-add]', host).forEach((btn) => btn.addEventListener('click', () => {
      collect();
      blocks.push(btn.dataset.add === 'image' ? { type: 'image', src: null, caption: '' } : { type: 'text', text: '' });
      render();
      const last = list.lastElementChild;
      last.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const f = last.querySelector('textarea, label');
      f && f.focus();
    }));
    qs('[data-cancel]', host).addEventListener('click', () => { host.hidden = true; host.innerHTML = ''; history.replaceState(null, '', '#chapters'); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      collect();
      const btn = e.submitter;
      const publish = btn && btn.dataset.publish === 'true';
      NR.ui.fieldError(form.title, form.title.value.trim() ? null : 'عنوان فصل را وارد کنید.');
      if (!form.title.value.trim()) return form.title.focus();
      NR.ui.setLoading(btn, true, publish ? 'در حال انتشار…' : 'در حال ذخیره…');
      try {
        const saved = await NR.api.chapters.save(novel.id, { id: chapter ? chapter.id : null, number: form.number.value, title: form.title.value, blocks }, publish);
        NR.ui.toast(publish ? `فصل ${toFa(saved.number)} منتشر شد.` : `فصل ${toFa(saved.number)} ذخیره شد.`, 'success');
        host.hidden = true;
        host.innerHTML = '';
        onDone && onDone(saved);
      } catch (err) {
        NR.ui.setLoading(btn, false);
        NR.ui.toast(err.message, 'error');
      }
    });
    render();
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => form.title.focus({ preventScroll: true }), 300);
  }

  /* ============================== صفحه ویرایش رمان ============================== */
  NR.pages['edit-novel'] = async function () {
    if (!NR.auth.guardPage('برای ویرایش رمان ابتدا وارد حساب کاربری خود شوید.')) return;
    const root = qs('#editRoot');
    root.innerHTML = `<div class="container">${NR.ui.skeletonLines(6)}</div>`;
    let novel;
    try {
      novel = await NR.api.novels.get(getParam('id'));
      if (!novel.isOwner) throw new Error('forbidden');
    } catch (err) {
      root.innerHTML = NR.ui.errorState({ title: 'دسترسی ممکن نیست', text: 'این رمان وجود ندارد یا شما نویسنده‌ی آن نیستید.' });
      return;
    }
    NR.ui.setMeta({ title: `ویرایش «${novel.title}»` });
    root.innerHTML = `
      <header class="page-head container page-head--row">
        <div><nav class="breadcrumb" aria-label="مسیر صفحه"><a href="dashboard.html">پنل نویسنده</a><span aria-hidden="true">/</span><a href="my-novels.html">رمان‌های من</a><span aria-hidden="true">/</span><span aria-current="page">ویرایش</span></nav>
          <h1>${esc(novel.title)}</h1><p class="page-head__lead">${novel.visibility === 'draft' ? 'این رمان پیش‌نویس است و هنوز برای دیگران نمایش داده نمی‌شود.' : 'تغییرات بلافاصله برای خوانندگان نمایش داده می‌شود.'}</p></div>
        <div class="btn-row"><a class="btn btn--ghost" href="novel.html?id=${novel.id}">${icon('eye')}مشاهده صفحه رمان</a><button type="button" class="btn btn--danger" id="deleteNovel">${icon('trash')}حذف رمان</button></div>
      </header>
      <div class="container">
        <div class="tabs" role="tablist" aria-label="بخش‌های ویرایش">
          <button role="tab" data-tab="info" id="tab-info" aria-controls="panel-info" aria-selected="true">اطلاعات رمان</button>
          <button role="tab" data-tab="chapters" id="tab-chapters" aria-controls="panel-chapters" aria-selected="false" tabindex="-1">فصل‌ها <span class="chip chip--xs" id="chapterBadge"></span></button>
        </div>
        <div id="panel-info" role="tabpanel" aria-labelledby="tab-info">${novelFormHTML(novel, 'edit')}</div>
        <div id="panel-chapters" role="tabpanel" aria-labelledby="tab-chapters" hidden>
          <div class="section-head"><h2 class="section-title">فصل‌های رمان</h2><button type="button" class="btn btn--primary" id="newChapter">${icon('plus')}فصل جدید</button></div>
          <div id="chapterEditorHost" hidden></div>
          <div class="panel"><div id="chapterTable"></div></div>
        </div>
      </div>`;

    const form = qs('#novelForm');
    const ctrl = bindNovelForm(form, novel);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = ctrl.validate();
      if (!data) return;
      const btn = e.submitter;
      data.visibility = btn.dataset.visibility;
      NR.ui.setLoading(btn, true, 'در حال ذخیره…');
      try {
        novel = { ...novel, ...(await NR.api.novels.update(novel.id, data)) };
        NR.ui.toast(data.visibility === 'draft' ? 'رمان به پیش‌نویس منتقل شد.' : 'تغییرات رمان ذخیره شد.', 'success');
        setTimeout(() => location.reload(), 600);
      } catch (err) {
        NR.ui.setLoading(btn, false);
        NR.ui.toast(err.message, 'error');
      }
    });

    qs('#deleteNovel').addEventListener('click', async () => {
      const ok = await NR.ui.confirm({ title: 'حذف رمان', text: `رمان «${novel.title}» همراه با همه‌ی فصل‌ها و نظراتش برای همیشه حذف می‌شود. این کار قابل بازگشت نیست.`, confirmText: 'بله، حذف شود', danger: true });
      if (!ok) return;
      await NR.api.novels.remove(novel.id);
      NR.ui.toast('رمان حذف شد.', 'info');
      setTimeout(() => (location.href = 'my-novels.html'), 600);
    });

    const host = qs('#chapterEditorHost');
    let chapters = [];
    const loadChapters = async () => {
      chapters = await NR.api.chapters.list(novel.id, { includeDrafts: true });
      qs('#chapterBadge').textContent = toFa(chapters.length);
      qs('#chapterTable').innerHTML = chapters.length
        ? `<table class="data-table"><thead><tr><th scope="col">شماره</th><th scope="col">عنوان</th><th scope="col">وضعیت</th><th scope="col">آخرین تغییر</th><th scope="col"><span class="sr-only">عملیات</span></th></tr></thead><tbody>
          ${chapters.map((c) => `<tr><td>فصل ${toFa(c.number)}</td><td><strong>${esc(c.title)}</strong><small class="muted d-block">${toFa(c.words)} کلمه</small></td>
            <td><span class="chip chip--xs ${c.status === 'published' ? 'chip--success' : 'chip--warning'}">${NR.utils.statusLabel(c.status)}</span></td><td>${NR.utils.timeAgo(c.updatedAt)}</td>
            <td class="data-table__actions">
              <a class="icon-btn icon-btn--sm" href="reader.html?id=${novel.id}&ch=${c.number}" aria-label="مشاهده فصل ${toFa(c.number)}">${icon('eye')}</a>
              <button type="button" class="icon-btn icon-btn--sm" data-edit-ch="${c.number}" aria-label="ویرایش فصل ${toFa(c.number)}">${icon('pen')}</button>
              ${c.status === 'draft' ? `<button type="button" class="icon-btn icon-btn--sm icon-btn--gold" data-publish-ch="${c.number}" aria-label="انتشار فصل ${toFa(c.number)}">${icon('send')}</button>` : ''}
              <button type="button" class="icon-btn icon-btn--sm icon-btn--danger" data-delete-ch="${c.id}" aria-label="حذف فصل ${toFa(c.number)}">${icon('trash')}</button></td></tr>`).join('')}
          </tbody></table>`
        : NR.ui.emptyState({ iconName: 'file', title: 'این رمان هنوز فصلی ندارد.', text: 'اولین فصل را بنویسید؛ می‌توانید آن را پیش‌نویس ذخیره کنید یا مستقیم منتشر کنید.' });
    };
    const openEditor = async (numberOrNew) => {
      tabCtrl.activate('chapters');
      if (numberOrNew === 'new') return chapterEditor(host, novel, null, afterSave);
      const ch = await NR.api.chapters.get(novel.id, numberOrNew);
      chapterEditor(host, novel, ch, afterSave);
    };
    const afterSave = () => { loadChapters(); history.replaceState(null, '', '#chapters'); };

    qs('#newChapter').addEventListener('click', () => openEditor('new'));
    qs('#chapterTable').addEventListener('click', async (e) => {
      const edit = e.target.closest('[data-edit-ch]');
      const pub = e.target.closest('[data-publish-ch]');
      const del = e.target.closest('[data-delete-ch]');
      if (edit) openEditor(Number(edit.dataset.editCh));
      if (pub) {
        const ch = await NR.api.chapters.get(novel.id, pub.dataset.publishCh);
        await NR.api.chapters.save(novel.id, ch, true);
        NR.ui.toast(`فصل ${toFa(ch.number)} منتشر شد.`, 'success');
        loadChapters();
      }
      if (del) {
        const ok = await NR.ui.confirm({ title: 'حذف فصل', text: 'این فصل برای همیشه حذف می‌شود.', confirmText: 'حذف فصل', danger: true });
        if (!ok) return;
        await NR.api.chapters.remove(del.dataset.deleteCh);
        NR.ui.toast('فصل حذف شد.', 'info');
        loadChapters();
      }
    });

    const tabCtrl = NR.ui.tabs(root, (tab) => { if (location.hash !== '#' + tab && tab === 'chapters' && !location.hash.startsWith('#chapter')) history.replaceState(null, '', '#chapters'); if (tab === 'info') history.replaceState(null, '', location.pathname + location.search); });
    await loadChapters();
    const hash = location.hash;
    if (hash === '#chapters') tabCtrl.activate('chapters');
    else if (hash === '#chapter-new') openEditor('new');
    else if (/^#chapter-\d+$/.test(hash)) openEditor(Number(hash.split('-')[1]));
  };
})();
