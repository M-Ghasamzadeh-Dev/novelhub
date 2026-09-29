/**
 * auth.js
 * ---------------------------------------------------------------
 * احراز هویت دمو: ورود، ثبت‌نام، خروج، محافظت از صفحات،
 * بررسی دسترسی برای عملیات‌ها و صفحه‌ی پروفایل کاربر.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { qs, escapeHTML: esc, toFa, formatNumber: num } = NR.utils;

  /** فقط آدرس‌های داخلی مجاز برای redirect */
  function safeRedirect() {
    const r = NR.utils.getParam('redirect');
    if (r && /^[a-z0-9-]+\.html(\?[^\s]*)?$/i.test(r) && !/^(login|register)\.html/.test(r)) return r;
    return 'home.html';
  }

  NR.auth = {
    user: () => NR.api.auth.currentUser(),
    isLoggedIn: () => !!NR.api.auth.session(),

    /**
     * بررسی دسترسی قبل از عملیات؛ در صورت مهمان بودن Modal ورود باز می‌شود.
     * @returns {boolean}
     */
    require(message) {
      if (this.isLoggedIn()) return true;
      NR.ui.toast('برای این کار باید وارد حساب شوید.', 'warning');
      NR.ui.loginRequired(message);
      return false;
    },

    /** محافظت از صفحات نویسنده / کاربر */
    guardPage(message) {
      if (this.isLoggedIn()) return true;
      const main = document.getElementById('main');
      const redirect = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      main.innerHTML = `
        <section class="container locked-state">
          <div class="empty-state">
            <div class="empty-state__icon">${NR.ui.icon('lock')}</div>
            <h1>این بخش مخصوص اعضاست</h1>
            <p>${esc(message || 'برای دسترسی به این بخش ابتدا وارد حساب کاربری خود شوید.')}</p>
            <div class="btn-row"><a class="btn btn--primary" href="login.html?redirect=${redirect}">ورود</a><a class="btn btn--outline" href="register.html?redirect=${redirect}">ثبت‌نام</a><a class="btn btn--ghost" href="home.html">ادامه به صورت مهمان</a></div>
          </div>
        </section>`;
      NR.ui.loginRequired(message);
      return false;
    },

    async logout() {
      await NR.api.auth.logout();
      NR.ui.toast('از حساب خود خارج شدید.', 'info');
      setTimeout(() => (location.href = 'home.html'), 500);
    }
  };

  /* ---------- رویدادهای سراسری: خروج و دنبال کردن ---------- */
  document.addEventListener('click', async (e) => {
    if (e.target.closest('[data-logout]')) {
      e.preventDefault();
      NR.auth.logout();
      return;
    }
    const followBtn = e.target.closest('[data-follow]');
    if (followBtn) {
      e.preventDefault();
      if (!NR.auth.require('برای دنبال کردن نویسنده ابتدا وارد حساب کاربری خود شوید.')) return;
      followBtn.disabled = true;
      try {
        const res = await NR.api.users.toggleFollow(followBtn.dataset.follow);
        document.querySelectorAll(`[data-follow="${followBtn.dataset.follow}"]`).forEach((b) => {
          b.setAttribute('aria-pressed', String(res.following));
          b.textContent = res.following ? 'دنبال می‌کنید' : 'دنبال کردن';
          b.classList.toggle('btn--ghost', res.following);
          b.classList.toggle('btn--outline', !res.following);
        });
        document.querySelectorAll(`[data-follower-count="${followBtn.dataset.follow}"]`).forEach((el) => (el.textContent = num(res.followers)));
        NR.ui.toast(res.following ? 'نویسنده را دنبال کردید.' : 'دنبال کردن لغو شد.', 'success');
      } catch (err) {
        NR.ui.toast(err.message, 'error');
      } finally {
        followBtn.disabled = false;
      }
    }
  });

  /** نمایش/مخفی کردن رمز عبور */
  function bindPasswordToggles(root) {
    root.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.innerHTML = NR.ui.icon('eye');
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.togglePassword);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور');
        btn.classList.toggle('is-active', show);
      });
    });
  }

  /* ============================== صفحه ورود ============================== */
  NR.pages.login = function () {
    if (NR.auth.isLoggedIn()) {
      location.replace(safeRedirect());
      return;
    }
    const form = qs('#loginForm');
    bindPasswordToggles(form);
    qs('#fillDemo').addEventListener('click', () => {
      form.identifier.value = 'demo@novel.ir';
      form.password.value = 'demo1234';
      NR.ui.toast('اطلاعات حساب نمایشی وارد شد.', 'info');
    });
    qs('#forgotBtn').addEventListener('click', async () => {
      await NR.ui.modal({
        title: 'بازیابی رمز عبور',
        icon: 'mail',
        html: `<p>ایمیل یا نام کاربری خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.</p>
               <div class="field"><label for="forgotInput">ایمیل یا نام کاربری</label><input id="forgotInput" class="input" type="text" autocomplete="username"></div>`,
        actions: [{ label: 'انصراف', value: null }, { label: 'ارسال لینک', value: 'send', variant: 'primary' }],
        onOpen: (wrap) => { wrap.querySelector('#forgotInput').value = form.identifier.value; }
      }).then(async (v) => {
        if (v === 'send') {
          await NR.api.auth.forgotPassword('demo');
          NR.ui.toast('لینک بازیابی (نمایشی) به ایمیل شما ارسال شد.', 'success');
        }
      });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idOk = form.identifier.value.trim().length >= 3;
      const pwOk = form.password.value.length >= 4;
      NR.ui.fieldError(form.identifier, idOk ? null : 'ایمیل یا نام کاربری را وارد کنید.');
      NR.ui.fieldError(form.password, pwOk ? null : 'رمز عبور را وارد کنید.');
      if (!idOk || !pwOk) return;
      const btn = form.querySelector('[type="submit"]');
      NR.ui.setLoading(btn, true, 'در حال ورود…');
      try {
        const user = await NR.api.auth.login({ identifier: form.identifier.value, password: form.password.value, remember: form.remember.checked });
        NR.ui.toast(`${user.displayName} عزیز، خوش آمدید!`, 'success');
        setTimeout(() => (location.href = safeRedirect()), 600);
      } catch (err) {
        NR.ui.setLoading(btn, false);
        qs('#loginError').textContent = err.message;
        qs('#loginError').hidden = false;
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
      }
    });
  };

  /* ============================== صفحه ثبت‌نام ============================== */
  NR.pages.register = function () {
    if (NR.auth.isLoggedIn()) {
      location.replace('profile.html');
      return;
    }
    const form = qs('#registerForm');
    bindPasswordToggles(form);
    const uploader = NR.ui.imageUploader(qs('#avatarUploader'), { label: 'انتخاب عکس پروفایل', hint: 'اختیاری · تصویر مربعی بهتر است', aspect: 'square', maxSize: 320 });
    const meter = qs('#passwordMeter');
    form.password.addEventListener('input', () => {
      const v = form.password.value;
      const score = [v.length >= 8, /[A-Z]/.test(v) || /[a-z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
      meter.dataset.score = v ? score : 0;
      meter.querySelector('span').textContent = v ? ['خیلی ضعیف', 'ضعیف', 'متوسط', 'خوب', 'قوی'][score] : '';
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const checks = [
        [form.username, /^[A-Za-z0-9_.]{3,20}$/.test(form.username.value.trim()), 'نام کاربری ۳ تا ۲۰ کاراکتر انگلیسی، عدد، _ یا . باشد.'],
        [form.email, /^\S+@\S+\.\S+$/.test(form.email.value.trim()), 'ایمیل معتبر وارد کنید.'],
        [form.password, form.password.value.length >= 6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'],
        [form.confirm, form.confirm.value === form.password.value && form.confirm.value, 'تکرار رمز عبور مطابقت ندارد.'],
        [form.rules, form.rules.checked, 'برای ثبت‌نام باید قوانین را بپذیرید.']
      ];
      let valid = true;
      checks.forEach(([input, ok, msg]) => {
        NR.ui.fieldError(input, ok ? null : msg);
        if (!ok) valid = false;
      });
      if (!valid) return NR.ui.toast('لطفاً خطاهای فرم را برطرف کنید.', 'error');
      const btn = form.querySelector('[type="submit"]');
      NR.ui.setLoading(btn, true, 'در حال ساخت حساب…');
      try {
        await NR.api.auth.register({ username: form.username.value, email: form.email.value, password: form.password.value, avatar: uploader.getValue() });
        NR.ui.toast('حساب شما با موفقیت ساخته شد.', 'success');
        setTimeout(() => (location.href = safeRedirect() === 'home.html' ? 'profile.html' : safeRedirect()), 700);
      } catch (err) {
        NR.ui.setLoading(btn, false);
        NR.ui.toast(err.message, 'error');
        if (err.message.includes('نام کاربری')) NR.ui.fieldError(form.username, err.message);
        if (err.message.includes('ایمیل')) NR.ui.fieldError(form.email, err.message);
      }
    });
  };

  /* ============================== صفحه پروفایل ============================== */
  NR.pages.profile = async function () {
    const root = qs('#profileRoot');
    const username = NR.utils.getParam('user');
    const me = NR.auth.user();
    if (!username && !me) return NR.auth.guardPage('برای مشاهده‌ی پروفایل خود وارد حساب شوید.');
    root.innerHTML = `<div class="container profile-skeleton">${NR.ui.skeletonLines(3)}</div>`;
    let user;
    try {
      user = await NR.api.users.get(username || me.id);
    } catch (err) {
      root.innerHTML = NR.ui.errorState({ title: 'کاربر پیدا نشد', text: 'این پروفایل وجود ندارد یا حذف شده است.' });
      return;
    }
    const self = me && me.id === user.id;
    NR.ui.setMeta({ title: `${user.displayName} (@${user.username})`, description: user.bio || `پروفایل ${user.displayName} در شب‌نامه` });
    const following = NR.api.users.isFollowing(user.id);
    root.innerHTML = `
      <section class="profile-hero">
        <div class="container profile-hero__inner">
          <div class="profile-hero__avatar">${NR.ui.avatar(user, 128)}</div>
          <div class="profile-hero__info">
            <h1>${esc(user.displayName)}</h1>
            <p class="profile-hero__handle">@${esc(user.username)}</p>
            <p class="profile-hero__bio">${esc(user.bio || (self ? 'هنوز بیوگرافی ننوشته‌اید. از تنظیمات پنل نویسنده آن را اضافه کنید.' : 'این کاربر هنوز بیوگرافی ننوشته است.'))}</p>
            <dl class="profile-stats">
              <div><dt>رمان</dt><dd>${toFa(user.novelCount)}</dd></div>
              <div><dt>دنبال‌کننده</dt><dd data-follower-count="${user.id}">${num(user.followers)}</dd></div>
              <div><dt>دنبال‌شده</dt><dd>${num(user.following)}</dd></div>
            </dl>
          </div>
          <div class="profile-hero__actions">
            ${self
              ? `<a class="btn btn--outline" href="dashboard.html#settings">${NR.ui.icon('settings')}ویرایش پروفایل</a><a class="btn btn--primary" href="create-novel.html">${NR.ui.icon('pen')}نوشتن رمان</a>`
              : `<button type="button" class="btn ${following ? 'btn--ghost' : 'btn--primary'}" data-follow="${user.id}" aria-pressed="${following}">${following ? 'دنبال می‌کنید' : 'دنبال کردن'}</button>`}
          </div>
        </div>
      </section>
      <section class="container profile-body">
        <div class="tabs" role="tablist" aria-label="بخش‌های پروفایل">
          <button role="tab" id="tab-novels" data-tab="novels" aria-controls="panel-novels" aria-selected="true">رمان‌ها</button>
          <button role="tab" id="tab-favs" data-tab="favs" aria-controls="panel-favs" aria-selected="false" tabindex="-1">علاقه‌مندی‌ها</button>
          <button role="tab" id="tab-activity" data-tab="activity" aria-controls="panel-activity" aria-selected="false" tabindex="-1">فعالیت‌ها</button>
        </div>
        <div id="panel-novels" role="tabpanel" aria-labelledby="tab-novels"><div class="novel-grid">${NR.ui.skeletonCards(4)}</div></div>
        <div id="panel-favs" role="tabpanel" aria-labelledby="tab-favs" hidden></div>
        <div id="panel-activity" role="tabpanel" aria-labelledby="tab-activity" hidden></div>
      </section>`;

    const loaded = {};
    const loaders = {
      novels: async () => {
        const list = await NR.api.novels.list({ authorId: user.id, sort: 'updated' });
        qs('#panel-novels').innerHTML = list.length
          ? `<div class="novel-grid">${list.map(NR.ui.novelCard).join('')}</div>`
          : NR.ui.emptyState({ title: self ? 'هنوز رمانی منتشر نکرده‌اید.' : 'این کاربر هنوز رمانی منتشر نکرده است.', action: self ? { label: 'نوشتن اولین رمان', href: 'create-novel.html', icon: 'pen' } : null });
      },
      favs: async () => {
        qs('#panel-favs').innerHTML = `<div class="novel-grid">${NR.ui.skeletonCards(4)}</div>`;
        const list = await NR.api.bookmarks.list(user.id);
        qs('#panel-favs').innerHTML = list.length
          ? `<div class="novel-grid">${list.map(NR.ui.novelCard).join('')}</div>`
          : NR.ui.emptyState({ iconName: 'bookmark', title: 'فهرست علاقه‌مندی‌ها خالی است.', action: self ? { label: 'کشف رمان‌ها', href: 'search.html' } : null });
      },
      activity: async () => {
        qs('#panel-activity').innerHTML = NR.ui.skeletonLines(4);
        const list = await NR.api.users.activities(user.id);
        const iconMap = { like: 'heart', comment: 'message', bookmark: 'bookmark', create: 'book', chapter: 'file', follow: 'userPlus' };
        qs('#panel-activity').innerHTML = list.length
          ? `<ol class="timeline">${list.map((a) => `<li class="timeline__item"><span class="timeline__icon">${NR.ui.icon(iconMap[a.type] || 'sparkle')}</span><div><p>${a.novelId ? `<a href="novel.html?id=${a.novelId}">${esc(a.text)}</a>` : esc(a.text)}</p><time datetime="${a.createdAt}">${NR.utils.timeAgo(a.createdAt)}</time></div></li>`).join('')}</ol>`
          : NR.ui.emptyState({ iconName: 'clock', title: 'هنوز فعالیتی ثبت نشده است.' });
      }
    };
    const load = (name) => {
      if (loaded[name]) return;
      loaded[name] = true;
      loaders[name]();
    };
    NR.ui.tabs(root, load);
    load('novels');
  };
})();

/* لینک‌ها و دکمه‌هایی که data-requires-auth دارند برای مهمان Modal ورود باز می‌کنند */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-requires-auth]');
  if (!el || window.NR.auth.isLoggedIn()) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  window.NR.auth.require(el.dataset.requiresAuth || undefined);
}, true);
