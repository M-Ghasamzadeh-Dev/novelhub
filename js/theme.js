/**
 * theme.js
 * ---------------------------------------------------------------
 * مدیریت تم تاریک/روشن. این فایل در <head> لود می‌شود تا تم قبل از
 * نمایش صفحه اعمال شود و «چشمک زدن» رنگ‌ها رخ ندهد.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const KEY = 'nr_theme';
  const root = document.documentElement;

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) { /* مقدار نامعتبر */ }
    return 'dark'; // تم پیش‌فرض سایت: تاریک و سینمایی
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0c12' : '#f6f1e8');
  }

  // اعمال فوری
  apply(read());

  window.NR = window.NR || {};
  window.NR.theme = {
    get: read,
    set(theme) {
      localStorage.setItem(KEY, JSON.stringify(theme));
      root.classList.add('theme-transition');
      apply(theme);
      window.setTimeout(() => root.classList.remove('theme-transition'), 450);
      document.dispatchEvent(new CustomEvent('nr:theme', { detail: theme }));
      this.syncToggles();
    },
    toggle() {
      this.set(read() === 'dark' ? 'light' : 'dark');
    },
    syncToggles() {
      document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        const dark = read() === 'dark';
        btn.setAttribute('aria-pressed', String(!dark));
        btn.setAttribute('aria-label', dark ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک');
        btn.setAttribute('title', dark ? 'حالت روشن' : 'حالت تاریک');
      });
    },
    init() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-theme-toggle]');
        if (btn) this.toggle();
      });
      this.syncToggles();
    }
  };
})();
