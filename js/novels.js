/* ===================================================================
   NovelHub — Novel card rendering + like/dislike/bookmark logic
   =================================================================== */

const Novels = {

  statusLabel(s){ return s === 'complete' ? 'تکمیل‌شده' : 'در حال انتشار'; },
  ageLabel(a){ return {general:'عمومی', '13':'+۱۳', '16':'+۱۶', '18':'+۱۸'}[a] || 'عمومی'; },

  isBookmarked(novelId){
    const u = Auth.currentUser();
    if(!u) return false;
    return Repo.bookmarks().some(b=>b.userId===u.id && b.novelId===novelId);
  },
  isLiked(novelId){
    const u = Auth.currentUser();
    if(!u) return false;
    return Repo.likes().some(l=>l.userId===u.id && l.novelId===novelId);
  },
  isDisliked(novelId){
    const u = Auth.currentUser();
    if(!u) return false;
    return Repo.dislikes().some(l=>l.userId===u.id && l.novelId===novelId);
  },

  toggleBookmark(novelId){
    if(!Auth.requireLogin()) return null;
    const u = Auth.currentUser();
    let bms = Repo.bookmarks();
    const exists = bms.some(b=>b.userId===u.id && b.novelId===novelId);
    if(exists){
      bms = bms.filter(b=>!(b.userId===u.id && b.novelId===novelId));
      Toast.show('از علاقه‌مندی‌ها حذف شد.');
    }else{
      bms.push({userId:u.id, novelId, date:new Date().toISOString()});
      Toast.show('به علاقه‌مندی‌ها اضافه شد.', 'success');
    }
    Repo.saveBookmarks(bms);
    return !exists;
  },

  toggleLike(novelId){
    if(!Auth.requireLogin()) return null;
    const u = Auth.currentUser();
    let likes = Repo.likes(), dislikes = Repo.dislikes();
    const novels = Repo.novels();
    const novel = novels.find(n=>n.id===novelId);
    const hadLike = likes.some(l=>l.userId===u.id && l.novelId===novelId);
    const hadDislike = dislikes.some(l=>l.userId===u.id && l.novelId===novelId);

    if(hadDislike){ dislikes = dislikes.filter(l=>!(l.userId===u.id && l.novelId===novelId)); novel.dislikes = Math.max(0, novel.dislikes-1); }
    if(hadLike){
      likes = likes.filter(l=>!(l.userId===u.id && l.novelId===novelId));
      novel.likes = Math.max(0, novel.likes-1);
    }else{
      likes.push({userId:u.id, novelId});
      novel.likes += 1;
      Toast.show('رمان لایک شد.', 'success');
    }
    Repo.saveLikes(likes); Repo.saveDislikes(dislikes); Repo.saveNovels(novels);
    return !hadLike;
  },

  toggleDislike(novelId){
    if(!Auth.requireLogin()) return null;
    const u = Auth.currentUser();
    let likes = Repo.likes(), dislikes = Repo.dislikes();
    const novels = Repo.novels();
    const novel = novels.find(n=>n.id===novelId);
    const hadLike = likes.some(l=>l.userId===u.id && l.novelId===novelId);
    const hadDislike = dislikes.some(l=>l.userId===u.id && l.novelId===novelId);

    if(hadLike){ likes = likes.filter(l=>!(l.userId===u.id && l.novelId===novelId)); novel.likes = Math.max(0, novel.likes-1); }
    if(hadDislike){
      dislikes = dislikes.filter(l=>!(l.userId===u.id && l.novelId===novelId));
      novel.dislikes = Math.max(0, novel.dislikes-1);
    }else{
      dislikes.push({userId:u.id, novelId});
      novel.dislikes += 1;
    }
    Repo.saveLikes(likes); Repo.saveDislikes(dislikes); Repo.saveNovels(novels);
    return !hadDislike;
  },

  cardHTML(n){
    const author = Repo.authorById(n.author);
    const bookmarked = this.isBookmarked(n.id);
    return `
    <article class="novel-card" data-novel-id="${n.id}">
      <div class="novel-cover">
        <a href="novel.html?id=${n.id}"><img src="${n.cover}" alt="جلد رمان ${n.title}" loading="lazy"></a>
        <span class="novel-status ${n.status==='complete'?'complete':''}">${this.statusLabel(n.status)}</span>
        ${n.ageRating!=='general' ? `<span class="novel-age">${this.ageLabel(n.ageRating)}</span>` : ''}
        <button class="novel-bookmark ${bookmarked?'active':''}" data-action="bookmark" data-id="${n.id}" aria-label="افزودن به علاقه‌مندی‌ها" title="افزودن به علاقه‌مندی‌ها">${bookmarked?'★':'☆'}</button>
      </div>
      <div class="novel-body">
        <span class="novel-genre-tag">${genreName(n.genres[0])}</span>
        <h3 class="novel-title"><a href="novel.html?id=${n.id}">${n.title}</a></h3>
        <span class="novel-author">${author ? author.name : ''}</span>
        <div class="novel-meta">
          <span>📖 ${n.chapterCount} فصل</span>
          <span>👁️ ${UI.formatNum(n.views)}</span>
          <span>👍 ${UI.formatNum(n.likes)}</span>
        </div>
      </div>
    </article>`;
  },

  renderGrid(mountEl, list){
    if(!mountEl) return;
    if(!list.length){
      mountEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">📭</div><h3>رمانی یافت نشد</h3><p>فیلترها یا جستجوی خود را تغییر دهید.</p>
      </div>`;
      return;
    }
    mountEl.innerHTML = list.map(n=>this.cardHTML(n)).join('');
  },

  bindCardEvents(mountEl){
    mountEl.addEventListener('click', e=>{
      const btn = e.target.closest('[data-action="bookmark"]');
      if(!btn) return;
      e.preventDefault();
      const result = this.toggleBookmark(btn.dataset.id);
      if(result !== null){ btn.classList.toggle('active', result); btn.textContent = result ? '★' : '☆'; }
    });
  },

  sortList(list, sort){
    const arr = [...list];
    if(sort==='popular') arr.sort((a,b)=>b.likes-a.likes);
    else if(sort==='views') arr.sort((a,b)=>b.views-a.views);
    else if(sort==='newest') arr.sort((a,b)=> new Date(b.published)-new Date(a.published));
    else if(sort==='complete') return arr.filter(n=>n.status==='complete');
    else if(sort==='ongoing') return arr.filter(n=>n.status==='ongoing');
    return arr;
  }
};
