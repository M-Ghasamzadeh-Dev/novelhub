/* ===================================================================
   NovelHub — Comments UI (list, reply, like)
   =================================================================== */

const Comments = {
  likedKey(commentId){ return 'nh_cm_like_'+commentId; },

  render(novelId, mountEl){
    const all = Repo.comments(novelId).filter(c=>!c.parentId);
    const replies = Repo.comments(novelId).filter(c=>c.parentId);
    if(!all.length){
      mountEl.innerHTML = `<p class="text-muted" style="padding:20px 0;">هنوز کامنتی ثبت نشده. اولین نفری باشید که نظر می‌دهد!</p>`;
      return;
    }
    mountEl.innerHTML = all.map(c=>this.commentHTML(c, replies.filter(r=>r.parentId===c.id))).join('');
  },

  commentHTML(c, childReplies){
    const likedIds = JSON.parse(localStorage.getItem('nh_liked_comments')||'[]');
    const liked = likedIds.includes(c.id);
    return `
    <div class="comment" data-comment-id="${c.id}">
      <div class="comment-avatar"><img src="${c.avatar}" alt="${c.userName}"></div>
      <div class="comment-body">
        <div class="comment-head"><b>${c.userName}</b><time>${UI.timeAgo(c.date)}</time></div>
        <p class="comment-text">${this.escape(c.text)}</p>
        <div class="comment-actions">
          <button data-action="like-comment" data-id="${c.id}" class="${liked?'liked':''}">${c.likes}</button>
          <button data-action="reply-comment" data-id="${c.id}">↩ پاسخ</button>
        </div>
        <div class="reply-form-slot" data-slot="${c.id}"></div>
        ${childReplies.length ? `<div class="comment-replies">${childReplies.map(r=>`
          <div class="comment" data-comment-id="${r.id}">
            <div class="comment-avatar"><img src="${r.avatar}" alt="${r.userName}"></div>
            <div class="comment-body">
              <div class="comment-head"><b>${r.userName}</b><time>${UI.timeAgo(r.date)}</time></div>
              <p class="comment-text">${this.escape(r.text)}</p>
            </div>
          </div>`).join('')}</div>` : ''}
      </div>
    </div>`;
  },

  escape(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; },

  bind(novelId, mountEl, formEl){
    formEl?.addEventListener('submit', e=>{
      e.preventDefault();
      if(!Auth.requireLogin()) return;
      const textarea = formEl.querySelector('textarea');
      const text = textarea.value.trim();
      if(!text) return;
      const u = Auth.currentUser();
      const all = Repo._get(DB_KEYS.COMMENTS);
      all.push({id:'cm_'+Date.now(), novelId, userId:u.id, userName:u.username, avatar:u.avatar, text, date:new Date().toISOString(), likes:0, parentId:null});
      Repo.saveComments(all);
      textarea.value = '';
      this.render(novelId, mountEl);
      Toast.show('کامنت شما ثبت شد.', 'success');
    });

    mountEl.addEventListener('click', e=>{
      const likeBtn = e.target.closest('[data-action="like-comment"]');
      if(likeBtn){
        if(!Auth.requireLogin()) return;
        const id = likeBtn.dataset.id;
        const all = Repo._get(DB_KEYS.COMMENTS);
        const c = all.find(x=>x.id===id);
        let likedIds = JSON.parse(localStorage.getItem('nh_liked_comments')||'[]');
        if(likedIds.includes(id)){
          c.likes = Math.max(0,c.likes-1);
          likedIds = likedIds.filter(x=>x!==id);
        }else{
          c.likes += 1;
          likedIds.push(id);
        }
        localStorage.setItem('nh_liked_comments', JSON.stringify(likedIds));
        Repo.saveComments(all);
        this.render(novelId, mountEl);
        return;
      }
      const replyBtn = e.target.closest('[data-action="reply-comment"]');
      if(replyBtn){
        if(!Auth.requireLogin()) return;
        const id = replyBtn.dataset.id;
        const slot = mountEl.querySelector(`.reply-form-slot[data-slot="${id}"]`);
        if(slot.innerHTML){ slot.innerHTML=''; return; }
        slot.innerHTML = `
          <form class="comment-form" data-reply-to="${id}" style="margin-top:10px;">
            <textarea rows="1" placeholder="پاسخ خود را بنویسید..." required></textarea>
            <button class="btn btn-primary btn-sm" type="submit">ارسال</button>
          </form>`;
        slot.querySelector('form').addEventListener('submit', ev=>{
          ev.preventDefault();
          const ta = ev.target.querySelector('textarea');
          const text = ta.value.trim();
          if(!text) return;
          const u = Auth.currentUser();
          const all = Repo._get(DB_KEYS.COMMENTS);
          all.push({id:'cm_'+Date.now(), novelId, userId:u.id, userName:u.username, avatar:u.avatar, text, date:new Date().toISOString(), likes:0, parentId:id});
          Repo.saveComments(all);
          this.render(novelId, mountEl);
          Toast.show('پاسخ شما ثبت شد.', 'success');
        });
      }
    });
  }
};
