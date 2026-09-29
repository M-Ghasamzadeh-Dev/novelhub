/**
 * comments.js
 * ---------------------------------------------------------------
 * سیستم نظرات: ارسال، پاسخ (Reply)، لایک و حذف نظر.
 * استفاده: NR.comments.mount(containerElement, novel)
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';
  const NR = window.NR;
  const { escapeHTML: esc, toFa, timeAgo, formatDate } = NR.utils;
  const icon = (n) => NR.ui.icon(n);

  function commentHTML(c, isReply = false) {
    const userLink = c.user && c.user.username ? `profile.html?user=${esc(c.user.username)}` : '#';
    return `
      <li class="comment${isReply ? ' comment--reply' : ''}" id="comment-${c.id}" data-comment-id="${c.id}">
        <a href="${userLink}" class="comment__avatar" tabindex="-1" aria-hidden="true">${NR.ui.avatar(c.user, isReply ? 34 : 44)}</a>
        <div class="comment__main">
          <header class="comment__head">
            <a href="${userLink}" class="comment__name">${esc(c.user.displayName)}</a>
            ${c.isAuthor ? '<span class="chip chip--gold chip--xs">نویسنده</span>' : ''}
            <time datetime="${c.createdAt}" title="${formatDate(c.createdAt)}">${timeAgo(c.createdAt)}</time>
          </header>
          <p class="comment__text">${esc(c.text).replace(/\n/g, '<br>')}</p>
          <footer class="comment__actions">
            <button type="button" class="comment__btn${c.likedByMe ? ' is-active' : ''}" data-comment-like="${c.id}" aria-pressed="${c.likedByMe}" aria-label="پسندیدن نظر">${icon('heart')}<span>${toFa(c.likes)}</span></button>
            <button type="button" class="comment__btn" data-comment-reply="${c.id}" data-reply-name="${esc(c.user.displayName)}">${icon('reply')}<span>پاسخ</span></button>
            ${c.canDelete ? `<button type="button" class="comment__btn comment__btn--danger" data-comment-delete="${c.id}">${icon('trash')}<span>حذف</span></button>` : ''}
          </footer>
          <div class="comment__reply-slot"></div>
          ${!isReply && c.replies && c.replies.length ? `<ul class="comment__replies">${c.replies.map((r) => commentHTML(r, true)).join('')}</ul>` : ''}
        </div>
      </li>`;
  }

  function formHTML({ placeholder = 'نظر خود را درباره‌ی این رمان بنویسید…', reply = null } = {}) {
    const user = NR.auth.user();
    return `
      <form class="comment-form${reply ? ' comment-form--reply' : ''}" novalidate>
        ${NR.ui.avatar(user || { displayName: 'مهمان', color: '#4a4452' }, reply ? 34 : 44)}
        <div class="comment-form__field">
          ${reply ? `<p class="comment-form__replying">${icon('reply')}در پاسخ به <strong>${esc(reply)}</strong></p>` : ''}
          <label class="sr-only" for="${reply ? 'replyText' : 'commentText'}">${reply ? 'متن پاسخ' : 'متن نظر'}</label>
          <textarea id="${reply ? 'replyText' : 'commentText'}" class="input" rows="${reply ? 2 : 3}" maxlength="1500" placeholder="${user ? placeholder : 'برای نوشتن نظر وارد حساب شوید…'}"></textarea>
          <div class="comment-form__foot">
            <span class="comment-form__counter" aria-live="polite">۰ / ۱۵۰۰</span>
            <div class="btn-row">
              ${reply ? '<button type="button" class="btn btn--ghost btn--sm" data-cancel-reply>انصراف</button>' : ''}
              <button type="submit" class="btn btn--primary btn--sm">${icon('send')}${reply ? 'ارسال پاسخ' : 'ثبت نظر'}</button>
            </div>
          </div>
        </div>
      </form>`;
  }

  NR.comments = {
    async mount(root, novel) {
      let sort = 'newest';
      root.innerHTML = `
        <div class="section-head">
          <h2 class="section-title">نظرات <span class="muted" id="commentCount"></span></h2>
          <label class="select-wrap"><span class="sr-only">مرتب‌سازی نظرات</span>
            <select id="commentSort" class="input input--sm"><option value="newest">جدیدترین</option><option value="top">محبوب‌ترین</option><option value="oldest">قدیمی‌ترین</option></select>
          </label>
        </div>
        <div id="commentFormHost">${formHTML()}</div>
        <ul class="comment-list" id="commentList" aria-live="polite">${NR.ui.skeletonLines(4)}</ul>`;

      const list = root.querySelector('#commentList');
      const countEl = root.querySelector('#commentCount');

      const load = async () => {
        const items = await NR.api.comments.list(novel.id, sort);
        const total = items.reduce((s, c) => s + 1 + c.replies.length, 0);
        countEl.textContent = `(${toFa(total)})`;
        list.innerHTML = items.length ? items.map((c) => commentHTML(c)).join('') : `<li class="comment-empty">${icon('message')}<p>هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد.</p></li>`;
      };

      const bindForm = (form, parentId = null) => {
        const ta = form.querySelector('textarea');
        const counter = form.querySelector('.comment-form__counter');
        ta.addEventListener('focus', () => { if (!NR.auth.isLoggedIn()) { ta.blur(); NR.auth.require('برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.'); } });
        ta.addEventListener('input', () => {
          counter.textContent = `${toFa(ta.value.length)} / ۱۵۰۰`;
          ta.style.height = 'auto';
          ta.style.height = ta.scrollHeight + 'px';
        });
        ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) form.requestSubmit(); });
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!NR.auth.require('برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.')) return;
          const btn = form.querySelector('[type="submit"]');
          NR.ui.setLoading(btn, true, 'در حال ارسال…');
          try {
            await NR.api.comments.add(novel.id, ta.value, parentId);
            ta.value = '';
            counter.textContent = '۰ / ۱۵۰۰';
            NR.ui.toast(parentId ? 'پاسخ شما ثبت شد.' : 'کامنت شما ثبت شد.', 'success');
            await load();
          } catch (err) {
            NR.ui.toast(err.message, 'error');
          } finally {
            NR.ui.setLoading(btn, false);
          }
        });
        const cancel = form.querySelector('[data-cancel-reply]');
        if (cancel) cancel.addEventListener('click', () => form.remove());
      };

      bindForm(root.querySelector('#commentFormHost form'));
      root.querySelector('#commentSort').addEventListener('change', (e) => { sort = e.target.value; load(); });

      list.addEventListener('click', async (e) => {
        const likeBtn = e.target.closest('[data-comment-like]');
        const replyBtn = e.target.closest('[data-comment-reply]');
        const delBtn = e.target.closest('[data-comment-delete]');
        if (likeBtn) {
          if (!NR.auth.require('برای پسندیدن نظر ابتدا وارد حساب کاربری خود شوید.')) return;
          try {
            const res = await NR.api.comments.toggleLike(likeBtn.dataset.commentLike);
            likeBtn.classList.toggle('is-active', res.liked);
            likeBtn.setAttribute('aria-pressed', String(res.liked));
            likeBtn.querySelector('span').textContent = toFa(res.likes);
            likeBtn.classList.remove('pop'); void likeBtn.offsetWidth; likeBtn.classList.add('pop');
          } catch (err) { NR.ui.toast(err.message, 'error'); }
        }
        if (replyBtn) {
          if (!NR.auth.require('برای پاسخ دادن ابتدا وارد حساب کاربری خود شوید.')) return;
          list.querySelectorAll('.comment-form--reply').forEach((f) => f.remove());
          const slot = replyBtn.closest('.comment__main').querySelector('.comment__reply-slot');
          slot.innerHTML = formHTML({ reply: replyBtn.dataset.replyName });
          const form = slot.querySelector('form');
          bindForm(form, replyBtn.dataset.commentReply);
          form.querySelector('textarea').focus();
        }
        if (delBtn) {
          const ok = await NR.ui.confirm({ title: 'حذف نظر', text: 'این نظر و پاسخ‌های آن برای همیشه حذف می‌شوند.', confirmText: 'حذف نظر', danger: true });
          if (!ok) return;
          try {
            await NR.api.comments.remove(delBtn.dataset.commentDelete);
            NR.ui.toast('نظر حذف شد.', 'info');
            load();
          } catch (err) { NR.ui.toast(err.message, 'error'); }
        }
      });

      await load();
      if (location.hash.startsWith('#comment-')) {
        const target = document.querySelector(location.hash);
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.add('is-highlighted'); }
      }
    }
  };
})();
