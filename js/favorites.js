/**
 * favorites.js
 * ---------------------------------------------------------------
 * سیستم علاقه‌مندی (Bookmark):
 *   - هندلر سراسری برای همه‌ی دکمه‌های [data-bookmark]
 *   - صفحه‌ی «رمان‌های ذخیره شده من»
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { qs } = NR.utils;

  function syncButtons(novelId, bookmarked) {
    document.querySelectorAll(`[data-bookmark="${novelId}"]`).forEach((btn) => {
      btn.classList.toggle('is-active', bookmarked);
      btn.setAttribute('aria-pressed', String(bookmarked));
      btn.setAttribute('aria-label', bookmarked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها');
      const label = btn.querySelector('[data-bookmark-label]');
      if (label) label.textContent = bookmarked ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها';
      btn.classList.remove('pop');
      void btn.offsetWidth; // ری‌استارت انیمیشن
      btn.classList.add('pop');
    });
  }

  NR.favorites = {
    async toggle(novelId) {
      if (!NR.auth.require('برای ذخیره‌ی رمان در علاقه‌مندی‌ها ابتدا وارد حساب کاربری خود شوید.')) return null;
      try {
        const { bookmarked } = await NR.api.bookmarks.toggle(novelId);
        syncButtons(novelId, bookmarked);
        NR.ui.toast(bookmarked ? 'رمان به علاقه‌مندی‌ها اضافه شد.' : 'رمان از علاقه‌مندی‌ها حذف شد.', bookmarked ? 'success' : 'info');
        document.dispatchEvent(new CustomEvent('nr:bookmark', { detail: { novelId, bookmarked } }));
        return bookmarked;
      } catch (err) {
        NR.ui.toast(err.message, 'error');
        return null;
      }
    }
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bookmark]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    NR.favorites.toggle(btn.dataset.bookmark);
  });

  /* ============================== صفحه علاقه‌مندی‌ها ============================== */
  NR.pages.favorites = async function () {
    if (!NR.auth.guardPage('برای مشاهده‌ی رمان‌های ذخیره‌شده ابتدا وارد حساب کاربری خود شوید.')) return;
    const grid = qs('#favoritesGrid');
    const count = qs('#favoritesCount');
    grid.innerHTML = NR.ui.skeletonCards(8);

    const render = (list) => {
      count.textContent = list.length ? `${NR.utils.toFa(list.length)} رمان ذخیره شده` : '';
      grid.classList.toggle('novel-grid', list.length > 0);
      grid.innerHTML = list.length
        ? list.map(NR.ui.novelCard).join('')
        : NR.ui.emptyState({ iconName: 'bookmark', title: 'هنوز رمانی ذخیره نکرده‌اید.', text: 'روی آیکون نشانک هر رمان بزنید تا اینجا برای همیشه منتظرتان بماند.', action: { label: 'کشف رمان‌ها', href: 'search.html', icon: 'search' } });
    };
    let list = await NR.api.bookmarks.list();
    render(list);

    // حذف فوری کارت از صفحه وقتی بوکمارک برداشته شد
    document.addEventListener('nr:bookmark', (e) => {
      if (e.detail.bookmarked) return;
      const card = grid.querySelector(`[data-novel-id="${e.detail.novelId}"]`);
      if (card) {
        card.classList.add('is-removing');
        setTimeout(() => {
          list = list.filter((n) => n.id !== e.detail.novelId);
          render(list);
        }, 260);
      }
    });
  };
})();
