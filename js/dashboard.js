/**
 * dashboard.js
 * ---------------------------------------------------------------
 * پنل نویسنده (داشبورد، فصل‌ها، پیش‌نویس‌ها، آمار، نظرات، تنظیمات)،
 * صفحه‌ی «رمان‌های من» و صفحه‌ی اعلان‌ها.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { qs, qsa, escapeHTML: esc, toFa, formatNumber: num, timeAgo } = NR.utils;
  const icon = (n) => NR.ui.icon(n);

  const SIDEBAR = [
    { key: 'overview', href: 'dashboard.html#overview', label: 'داشبورد', icon: 'grid' },
    { key: 'my-novels', href: 'my-novels.html', label: 'رمان‌های من', icon: 'book' },
    { key: 'create', href: 'create-novel.html', label: 'ایجاد رمان', icon: 'pen' },
    { key: 'chapters', href: 'dashboard.html#chapters', label: 'فصل‌ها', icon: 'list' },
    { key: 'drafts', href: 'dashboard.html#drafts', label: 'پیش‌نویس‌ها', icon: 'file' },
    { key: 'stats', href: 'dashboard.html#stats', label: 'آمار', icon: 'chart' },
    { key: 'comments', href: 'dashboard.html#comments', label: 'نظرات', icon: 'message' },
    { key: 'settings', href: 'dashboard.html#settings', label: 'تنظیمات', icon: 'settings' }
  ];

  function renderSidebar(active) {
    const user = NR.auth.user();
    const host = qs('#dashSidebar');
    host.innerHTML = `
      <div class="dash-user">${NR.ui.avatar(user, 52)}<div><strong>${esc(user.displayName)}</strong><a href="profile.html">مشاهده‌ی پروفایل</a></div></div>
      <nav aria-label="منوی پنل نویسنده"><ul class="dash-nav">${SIDEBAR.map((i) => `<li><a href="${i.href}" data-key="${i.key}" class="${i.key === active ? 'is-active' : ''}"${i.key === active ? ' aria-current="page"' : ''}>${icon(i.icon)}<span>${i.label}</span></a></li>`).join('')}</ul></nav>
      <button type="button" class="dash-logout" data-logout>${icon('logout')}<span>خروج</span></button>`;
  }

  function setActive(key) {
    qsa('.dash-nav a').forEach((a) => {
      const on = a.dataset.key === key;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  const statCard = (label, value, iconName, tone = '') => `<div class="stat-card ${tone}"><span class="stat-card__icon">${icon(iconName)}</span><div><dt>${label}</dt><dd>${value}</dd></div></div>`;

  /* ============================== بخش‌های داشبورد ============================== */
  const sections = {
    async overview(el) {
      const { totals, novels } = await NR.api.dashboard.stats();
      const comments = await NR.api.comments.onMyNovels();
      const user = NR.auth.user();
      el.innerHTML = `
        <header class="dash-head"><div><p class="eyebrow">پنل نویسنده</p><h1>سلام ${esc(user.displayName)}، شب بخیر برای نوشتن.</h1></div><a class="btn btn--primary" href="create-novel.html">${icon('pen')}رمان جدید</a></header>
        <dl class="stat-grid">
          ${statCard('تعداد رمان‌ها', toFa(totals.novels), 'book')}
          ${statCard('تعداد بازدید', num(totals.views), 'eye', 'is-gold')}
          ${statCard('تعداد لایک', num(totals.likes), 'heart', 'is-wine')}
          ${statCard('تعداد کامنت', toFa(totals.comments), 'message', 'is-plum')}
          ${statCard('دنبال‌کنندگان', num(totals.followers), 'users')}
        </dl>
        ${novels.length ? `
        <div class="dash-cols">
          <section class="panel"><div class="section-head"><h2 class="panel__title">رمان‌های اخیر</h2><a href="my-novels.html" class="link-more">همه ${icon('chevronLeft')}</a></div>
            <ul class="mini-list">${novels.slice(0, 5).map((n) => `<li><a href="edit-novel.html?id=${n.id}"><img src="${NR.ui.cover(n)}" alt="" width="40" height="60"><span><strong>${esc(n.title)}</strong><small>${toFa(n.chapterCount)} فصل · ${num(n.views)} بازدید · ${n.visibility === 'draft' ? 'پیش‌نویس' : NR.utils.statusLabel(n.status)}</small></span>${icon('chevronLeft')}</a></li>`).join('')}</ul></section>
          <section class="panel"><div class="section-head"><h2 class="panel__title">آخرین نظرات خوانندگان</h2><a href="#comments" class="link-more">همه ${icon('chevronLeft')}</a></div>
            ${comments.length ? `<ul class="mini-comments">${comments.slice(0, 4).map((c) => `<li>${NR.ui.avatar(c.user, 34)}<div><p><strong>${esc(c.user.displayName)}</strong> در <a href="novel.html?id=${c.novelId}#comment-${c.id}">${esc(c.novelTitle)}</a></p><p class="muted">${esc(c.text.slice(0, 110))}${c.text.length > 110 ? '…' : ''}</p></div></li>`).join('')}</ul>` : '<p class="muted">هنوز نظری دریافت نکرده‌اید.</p>'}</section>
        </div>` : NR.ui.emptyState({ title: 'هنوز رمانی منتشر نکرده‌اید.', text: 'اولین قدم را بردارید؛ پنل نویسنده منتظر آمار اولین رمان شماست.', action: { label: 'نوشتن اولین رمان', href: 'create-novel.html', icon: 'pen' } })}`;
    },

    async chapters(el) {
      const list = await NR.api.chapters.mine();
      el.innerHTML = `<header class="dash-head"><div><p class="eyebrow">مدیریت</p><h1>فصل‌ها</h1></div></header>
        <section class="panel">${list.length ? `<table class="data-table"><thead><tr><th scope="col">رمان</th><th scope="col">فصل</th><th scope="col">وضعیت</th><th scope="col">آخرین تغییر</th><th scope="col"><span class="sr-only">عملیات</span></th></tr></thead><tbody>
          ${list.map((c) => `<tr><td>${esc(c.novelTitle)}</td><td><strong>فصل ${toFa(c.number)}:</strong> ${esc(c.title)}</td><td><span class="chip chip--xs ${c.status === 'published' ? 'chip--success' : 'chip--warning'}">${NR.utils.statusLabel(c.status)}</span></td><td>${timeAgo(c.updatedAt)}</td>
            <td class="data-table__actions"><a class="icon-btn icon-btn--sm" href="reader.html?id=${c.novelId}&ch=${c.number}" aria-label="مشاهده">${icon('eye')}</a><a class="icon-btn icon-btn--sm" href="edit-novel.html?id=${c.novelId}#chapter-${c.number}" aria-label="ویرایش">${icon('pen')}</a></td></tr>`).join('')}
          </tbody></table>` : NR.ui.emptyState({ iconName: 'file', title: 'هنوز فصلی ننوشته‌اید.', action: { label: 'نوشتن اولین رمان', href: 'create-novel.html', icon: 'pen' } })}</section>`;
    },

    async drafts(el) {
      const [{ novels }, chapters] = await Promise.all([NR.api.dashboard.stats(), NR.api.chapters.mine()]);
      const dNovels = novels.filter((n) => n.visibility === 'draft');
      const dChapters = chapters.filter((c) => c.status === 'draft');
      el.innerHTML = `<header class="dash-head"><div><p class="eyebrow">در دست نوشتن</p><h1>پیش‌نویس‌ها</h1></div></header>
        <section class="panel"><h2 class="panel__title">رمان‌های پیش‌نویس</h2>
          ${dNovels.length ? `<ul class="mini-list">${dNovels.map((n) => `<li><a href="edit-novel.html?id=${n.id}"><img src="${NR.ui.cover(n)}" alt="" width="40" height="60"><span><strong>${esc(n.title)}</strong><small>آخرین تغییر ${timeAgo(n.updatedAt)}</small></span>${icon('chevronLeft')}</a></li>`).join('')}</ul>` : '<p class="muted">رمان پیش‌نویسی ندارید.</p>'}</section>
        <section class="panel"><h2 class="panel__title">فصل‌های پیش‌نویس</h2>
          ${dChapters.length ? `<ul class="mini-list">${dChapters.map((c) => `<li><a href="edit-novel.html?id=${c.novelId}#chapter-${c.number}"><span class="mini-list__num">${toFa(c.number)}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.novelTitle)} · ${timeAgo(c.updatedAt)}</small></span>${icon('chevronLeft')}</a></li>`).join('')}</ul>` : '<p class="muted">فصل پیش‌نویسی ندارید.</p>'}</section>`;
    },

    async stats(el) {
      const { novels, totals } = await NR.api.dashboard.stats();
      const max = Math.max(1, ...novels.map((n) => n.views));
      const engagement = totals.views ? ((totals.likes + totals.comments) / totals.views) * 100 : 0;
      el.innerHTML = `<header class="dash-head"><div><p class="eyebrow">عملکرد</p><h1>آمار</h1></div></header>
        <dl class="stat-grid stat-grid--3">
          ${statCard('نرخ تعامل', toFa(engagement.toFixed(1)).replace('.', '٫') + '٪', 'sparkle', 'is-gold')}
          ${statCard('میانگین بازدید هر رمان', num(novels.length ? Math.round(totals.views / novels.length) : 0), 'eye')}
          ${statCard('فصل‌های نوشته‌شده', toFa(totals.chapters), 'list', 'is-plum')}
        </dl>
        <section class="panel"><h2 class="panel__title">بازدید به تفکیک رمان</h2>
          ${novels.length ? `<ul class="bar-chart">${[...novels].sort((a, b) => b.views - a.views).map((n) => `<li><span class="bar-chart__label">${esc(n.title)}</span><span class="bar-chart__track"><span class="bar-chart__bar" style="--w:${(n.views / max) * 100}%"></span></span><span class="bar-chart__value">${num(n.views)}</span></li>`).join('')}</ul>` : '<p class="muted">هنوز داده‌ای برای نمایش وجود ندارد.</p>'}</section>
        <section class="panel"><h2 class="panel__title">لایک در برابر دیس‌لایک</h2>
          ${novels.length ? `<ul class="ratio-list">${novels.map((n) => { const t = n.likes + n.dislikes || 1; return `<li><span>${esc(n.title)}</span><span class="ratio" role="img" aria-label="${toFa(Math.round((n.likes / t) * 100))} درصد رضایت"><span style="width:${(n.likes / t) * 100}%"></span></span><small>${toFa(Math.round((n.likes / t) * 100))}٪</small></li>`; }).join('')}</ul>` : '<p class="muted">هنوز داده‌ای برای نمایش وجود ندارد.</p>'}</section>`;
      requestAnimationFrame(() => el.querySelectorAll('.bar-chart__bar').forEach((b) => b.classList.add('is-in')));
    },

    async comments(el) {
      const list = await NR.api.comments.onMyNovels();
      el.innerHTML = `<header class="dash-head"><div><p class="eyebrow">خوانندگان</p><h1>نظرات</h1></div></header>
        <section class="panel">${list.length ? `<ul class="mini-comments mini-comments--full">${list.map((c) => `
          <li data-row="${c.id}">${NR.ui.avatar(c.user, 40)}<div><p><strong>${esc(c.user.displayName)}</strong> <span class="muted">در</span> <a href="novel.html?id=${c.novelId}#comment-${c.id}">${esc(c.novelTitle)}</a> <time class="muted">${timeAgo(c.createdAt)}</time></p><p>${esc(c.text)}</p>
          <div class="btn-row"><a class="btn btn--ghost btn--sm" href="novel.html?id=${c.novelId}#comment-${c.id}">${icon('reply')}پاسخ</a><button type="button" class="btn btn--ghost btn--sm is-danger" data-del-comment="${c.id}">${icon('trash')}حذف</button></div></div></li>`).join('')}</ul>`
          : NR.ui.emptyState({ iconName: 'message', title: 'هنوز نظری روی رمان‌های شما ثبت نشده است.' })}</section>`;
      el.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-del-comment]');
        if (!b) return;
        const ok = await NR.ui.confirm({ title: 'حذف نظر', text: 'این نظر و پاسخ‌هایش حذف می‌شوند.', confirmText: 'حذف', danger: true });
        if (!ok) return;
        await NR.api.comments.remove(b.dataset.delComment);
        el.querySelector(`[data-row="${b.dataset.delComment}"]`).remove();
        NR.ui.toast('نظر حذف شد.', 'info');
      });
    },

    async settings(el) {
      const user = NR.auth.user();
      el.innerHTML = `<header class="dash-head"><div><p class="eyebrow">حساب کاربری</p><h1>تنظیمات</h1></div></header>
        <form class="panel settings-form" id="profileForm" novalidate>
          <h2 class="panel__title">اطلاعات پروفایل</h2>
          <div class="settings-grid">
            <div><span class="label">عکس پروفایل</span><div id="settingsAvatar"></div></div>
            <div>
              <div class="field"><label for="sName">نام نمایشی</label><input id="sName" name="displayName" class="input" maxlength="40" value="${esc(user.displayName)}"></div>
              <div class="field"><label for="sUser">نام کاربری</label><input id="sUser" class="input" value="@${esc(user.username)}" disabled><span class="field__hint">نام کاربری قابل تغییر نیست.</span></div>
              <div class="field"><label for="sEmail">ایمیل</label><input id="sEmail" class="input" value="${esc(user.email)}" disabled></div>
              <div class="field"><label for="sBio">درباره‌ی من (Bio)</label><textarea id="sBio" name="bio" class="input" rows="4" maxlength="300">${esc(user.bio || '')}</textarea></div>
            </div>
          </div>
          <div class="form-actions form-actions--row"><button type="submit" class="btn btn--primary">${icon('check')}ذخیره پروفایل</button></div>
        </form>
        <form class="panel settings-form" id="passwordForm" novalidate>
          <h2 class="panel__title">تغییر رمز عبور</h2>
          <div class="form-row"><div class="field"><label for="pCur">رمز فعلی</label><input id="pCur" name="current" type="password" class="input" autocomplete="current-password"></div>
            <div class="field"><label for="pNew">رمز جدید</label><input id="pNew" name="next" type="password" class="input" autocomplete="new-password"></div></div>
          <div class="form-actions form-actions--row"><button type="submit" class="btn btn--outline">تغییر رمز</button></div>
        </form>
        <section class="panel"><h2 class="panel__title">ظاهر</h2>
          <div class="setting-row"><div><strong>تم سایت</strong><p class="muted">حالت تاریک برای مطالعه‌ی شبانه، حالت روشن برای روز.</p></div>
            <button type="button" class="btn btn--ghost" data-theme-toggle>${icon('sun')}${icon('moon')}تغییر تم</button></div></section>
        <section class="panel panel--danger"><h2 class="panel__title">منطقه‌ی خطر</h2>
          <div class="setting-row"><div><strong>خروج از حساب</strong><p class="muted">نشست فعلی شما پایان می‌یابد.</p></div><button type="button" class="btn btn--danger" data-logout>${icon('logout')}خروج</button></div></section>`;
      NR.theme.syncToggles();
      const av = NR.ui.imageUploader(qs('#settingsAvatar'), { value: user.avatar, aspect: 'square', label: 'انتخاب عکس', hint: 'تصویر مربعی', maxSize: 320 });
      qs('#profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.submitter;
        NR.ui.setLoading(btn, true, 'در حال ذخیره…');
        try {
          await NR.api.users.updateProfile({ displayName: e.target.displayName.value, bio: e.target.bio.value, avatar: av.getValue() });
          NR.ui.toast('پروفایل به‌روزرسانی شد.', 'success');
          setTimeout(() => location.reload(), 700);
        } catch (err) { NR.ui.toast(err.message, 'error'); }
        NR.ui.setLoading(btn, false);
      });
      qs('#passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        if (f.next.value.length < 6) return NR.ui.fieldError(f.next, 'رمز جدید باید حداقل ۶ کاراکتر باشد.');
        NR.ui.fieldError(f.next, null);
        try {
          await NR.api.users.updateProfile({ currentPassword: f.current.value, newPassword: f.next.value });
          f.reset();
          NR.ui.toast('رمز عبور تغییر کرد.', 'success');
        } catch (err) { NR.ui.fieldError(f.current, err.message); }
      });
    }
  };

  /* ============================== صفحه داشبورد ============================== */
  NR.pages.dashboard = function () {
    if (!NR.auth.guardPage('برای ورود به پنل نویسنده ابتدا وارد حساب کاربری خود شوید.')) return;
    const show = async () => {
      const key = (location.hash || '#overview').slice(1);
      const name = sections[key] ? key : 'overview';
      setActive(name);
      // جایگزینی کانتینر برای حذف listenerهای بخش قبلی
      const old = qs('#dashContent');
      const fresh = old.cloneNode(false);
      fresh.innerHTML = `<div class="stat-grid">${Array.from({ length: 4 }, () => '<div class="skeleton skeleton--block"></div>').join('')}</div>${NR.ui.skeletonLines(5)}`;
      old.replaceWith(fresh);
      await sections[name](fresh);
    };
    renderSidebar('overview');
    window.addEventListener('hashchange', () => { show(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    show();
  };

  /* ============================== صفحه رمان‌های من ============================== */
  NR.pages['my-novels'] = async function () {
    if (!NR.auth.guardPage('برای مدیریت رمان‌هایتان ابتدا وارد حساب کاربری خود شوید.')) return;
    renderSidebar('my-novels');
    const grid = qs('#myNovels');
    const load = async () => {
      grid.innerHTML = `<div class="manage-grid">${NR.ui.skeletonCards(3)}</div>`;
      const { novels } = await NR.api.dashboard.stats();
      qs('#myNovelsCount').textContent = novels.length ? `${toFa(novels.length)} رمان` : '';
      if (!novels.length) {
        grid.innerHTML = NR.ui.emptyState({ iconName: 'pen', title: 'هنوز رمانی منتشر نکرده‌اید.', text: 'هر رمان بزرگی از یک صفحه‌ی خالی شروع شده است.', action: { label: 'نوشتن اولین رمان', href: 'create-novel.html', icon: 'pen' } });
        return;
      }
      grid.innerHTML = `<div class="manage-grid">${novels.map((n) => `
        <article class="manage-card" data-id="${n.id}">
          <a href="novel.html?id=${n.id}" class="manage-card__cover"><img src="${NR.ui.cover(n)}" alt="کاور رمان ${esc(n.title)}" width="120" height="180" loading="lazy"></a>
          <div class="manage-card__body">
            <div class="chip-row">${n.visibility === 'draft' ? '<span class="chip chip--xs chip--warning">پیش‌نویس</span>' : '<span class="chip chip--xs chip--success">منتشر شده</span>'}<span class="chip chip--xs">${NR.utils.statusLabel(n.status)}</span>${NR.ui.ageBadge(n.ageRating)}</div>
            <h2><a href="novel.html?id=${n.id}">${esc(n.title)}</a></h2>
            <p class="muted">${esc(n.summary)}</p>
            <ul class="novel-card__stats"><li>${icon('list')}${toFa(n.chapterCount)} فصل</li><li>${icon('eye')}${num(n.views)}</li><li>${icon('heart')}${num(n.likes)}</li></ul>
            <div class="btn-row">
              <a class="btn btn--primary btn--sm" href="edit-novel.html?id=${n.id}#chapter-new">${icon('plus')}فصل جدید</a>
              <a class="btn btn--ghost btn--sm" href="edit-novel.html?id=${n.id}">${icon('pen')}ویرایش</a>
              <button type="button" class="btn btn--ghost btn--sm is-danger" data-delete="${n.id}" data-title="${esc(n.title)}">${icon('trash')}حذف</button>
            </div>
          </div>
        </article>`).join('')}</div>`;
    };
    grid.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-delete]');
      if (!b) return;
      const ok = await NR.ui.confirm({ title: 'حذف رمان', text: `رمان «${b.dataset.title}» و همه‌ی فصل‌ها و نظراتش حذف می‌شوند. این کار قابل بازگشت نیست.`, confirmText: 'بله، حذف شود', danger: true });
      if (!ok) return;
      const card = b.closest('.manage-card');
      card.classList.add('is-removing');
      await NR.api.novels.remove(b.dataset.delete);
      NR.ui.toast('رمان حذف شد.', 'info');
      load();
    });
    load();
  };

  /* ============================== صفحه اعلان‌ها ============================== */
  NR.pages.notifications = async function () {
    if (!NR.auth.guardPage('برای مشاهده‌ی اعلان‌ها ابتدا وارد حساب کاربری خود شوید.')) return;
    const listEl = qs('#notificationList');
    let filter = 'all';
    let items = [];
    const iconMap = { like: 'heart', comment: 'message', reply: 'reply', chapter: 'book', follow: 'userPlus', system: 'sparkle' };
    const render = () => {
      const list = filter === 'unread' ? items.filter((n) => !n.read) : items;
      qs('#unreadCount').textContent = toFa(items.filter((n) => !n.read).length);
      listEl.innerHTML = list.length
        ? list.map((n) => `
          <li class="notification${n.read ? '' : ' is-unread'}" data-id="${n.id}">
            <span class="notification__icon notification__icon--${n.type}">${icon(iconMap[n.type] || 'bell')}</span>
            <a class="notification__body" href="${n.novelId ? `novel.html?id=${n.novelId}${n.type === 'comment' || n.type === 'reply' ? '#comments' : ''}` : n.actor ? `profile.html?user=${esc(n.actor.username)}` : '#'}" data-open="${n.id}">
              <p>${esc(n.text)}</p><time datetime="${n.createdAt}">${timeAgo(n.createdAt)}</time></a>
            <button type="button" class="icon-btn icon-btn--sm" data-remove="${n.id}" aria-label="حذف اعلان">${icon('close')}</button>
          </li>`).join('')
        : `<li>${NR.ui.emptyState({ iconName: 'bell', title: filter === 'unread' ? 'اعلان خوانده‌نشده‌ای ندارید.' : 'هنوز اعلانی ندارید.', text: 'وقتی کسی رمان شما را بپسندد یا فصل تازه‌ای از رمان‌های محبوبتان منتشر شود، اینجا باخبر می‌شوید.' })}</li>`;
    };
    listEl.innerHTML = NR.ui.skeletonLines(5);
    items = await NR.api.notifications.list();
    render();
    NR.ui.tabs(qs('#notifTabs'), (tab) => { filter = tab; render(); });
    qs('#markAll').addEventListener('click', async () => {
      await NR.api.notifications.markRead();
      items.forEach((n) => (n.read = true));
      render();
      qsa('.badge-dot').forEach((b) => b.remove());
      NR.ui.toast('همه‌ی اعلان‌ها خوانده شدند.', 'success');
    });
    listEl.addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-remove]');
      const open = e.target.closest('[data-open]');
      if (rm) {
        await NR.api.notifications.remove(rm.dataset.remove);
        items = items.filter((n) => n.id !== rm.dataset.remove);
        render();
      } else if (open) {
        await NR.api.notifications.markRead(open.dataset.open);
      }
    });
  };
})();
