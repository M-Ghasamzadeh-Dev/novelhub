/* ===================================================================
   NovelHub — Shared UI shell: header/footer injection, toasts,
   modals, mobile nav, skeleton helpers.
   =================================================================== */

const UI = {

  /* ---------------- Header / Footer ---------------- */
  renderHeader(){
    const mount = document.getElementById('site-header');
    if(!mount) return;
    const user = Auth.currentUser();
    const path = location.pathname.split('/').pop() || 'home.html';

    const navLinks = [
      {href:'home.html', label:'خانه'},
      {href:'categories.html', label:'دسته‌بندی‌ها'},
      {href:'categories.html', label:'رمان‌ها'},
      {href:'search.html?sort=newest', label:'رمان‌های جدید'},
      {href:'search.html?sort=popular', label:'محبوب‌ترین‌ها'}
    ];

    mount.innerHTML = `
      <div class="header-inner">
        <a href="home.html" class="brand">
          <span class="brand-mark">N</span>
          <span class="brand-name">Novel<span>Hub</span></span>
        </a>
        <nav class="main-nav" aria-label="ناوبری اصلی">
          ${navLinks.map(l=>`<a href="${l.href}" class="${path===l.href.split('?')[0] ? 'active':''}">${l.label}</a>`).join('')}
        </nav>
        <div class="header-actions">
          <a href="search.html" class="btn-icon header-search-btn" aria-label="جستجو" title="جستجو">جستجو</a>
          <button class="btn-icon" data-theme-toggle aria-label="تغییر پوسته" title="تغییر پوسته"></button>
          ${user ? `
            <div class="user-menu">
              <button class="avatar-btn" id="userMenuBtn" aria-haspopup="true" aria-label="منوی کاربر">
                <img src="${user.avatar}" alt="${user.username}">
              </button>
              <div class="dropdown" id="userDropdown">
                <a href="profile.html">پروفایل من</a>
                <a href="dashboard.html">پنل نویسنده</a>
                <a href="my-novels.html">رمان‌های من</a>
                <a href="favorites.html">علاقه‌مندی‌ها</a>
                <a href="notifications.html">اعلان‌ها</a>
                <hr>
                <button id="logoutBtn">خروج از حساب</button>
              </div>
            </div>` : `
            <a href="login.html" class="btn btn-ghost btn-sm">ورود</a>
            <a href="register.html" class="btn btn-primary btn-sm">ثبت‌نام</a>
          `}
          <button class="hamburger" id="hamburgerBtn" aria-label="باز کردن منو">☰</button>
        </div>
      </div>
      <div class="mobile-backdrop" id="mobileBackdrop"></div>
      <nav class="mobile-nav" id="mobileNav" aria-label="ناوبری موبایل">
        ${navLinks.map(l=>`<a href="${l.href}">${l.label}</a>`).join('')}
        <a href="search.html">جستجو</a>
        <hr style="border:none;border-top:1px solid var(--border-subtle);margin:8px 0;">
        ${user ? `
          <a href="profile.html">پروفایل من</a>
          <a href="dashboard.html">پنل نویسنده</a>
          <a href="favorites.html">علاقه‌مندی‌ها</a>
          <button id="mobileLogoutBtn">خروج از حساب</button>
        ` : `
          <a href="login.html">ورود</a>
          <a href="register.html">ثبت‌نام</a>
        `}
      </nav>
    `;

    Theme.apply(localStorage.getItem(DB_KEYS.THEME) || 'dark');

    const menuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    if(menuBtn){
      menuBtn.addEventListener('click', e=>{ e.stopPropagation(); dropdown.classList.toggle('open'); });
      document.addEventListener('click', ()=> dropdown.classList.remove('open'));
    }
    const logout = ()=>{ Auth.logout(); Toast.show('با موفقیت خارج شدید.'); setTimeout(()=>location.href='home.html', 500); };
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', logout);

    const hamburger = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const backdrop = document.getElementById('mobileBackdrop');
    hamburger?.addEventListener('click', ()=>{ mobileNav.classList.add('open'); backdrop.classList.add('open'); });
    backdrop?.addEventListener('click', ()=>{ mobileNav.classList.remove('open'); backdrop.classList.remove('open'); });

    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
      btn.addEventListener('click', ()=> Theme.toggle());
    });
  },

  renderFooter(){
    const mount = document.getElementById('site-footer');
    if(!mount) return;
    mount.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="brand" style="margin-bottom:12px;">
              <span class="brand-mark">N</span>
              <span class="brand-name">Novel<span>Hub</span></span>
            </div>
            <p style="max-width:280px;">خواندن و انتشار رمان و داستان فارسی.</p>
          </div>
          <div class="footer-col">
            <h4>صفحات</h4>
            <a href="about.html">درباره ما</a>
            <a href="contact.html">تماس با ما</a>
            <a href="rules.html">قوانین سایت</a>
            <a href="rules.html">حریم خصوصی</a>
          </div>
          <div class="footer-col">
            <h4>دسته‌بندی‌ها</h4>
            <a href="categories.html?g=romance">عاشقانه</a>
            <a href="categories.html?g=fantasy">فانتزی</a>
            <a href="categories.html?g=mystery">معمایی</a>
            <a href="categories.html">همه‌ی دسته‌ها</a>
          </div>
          <div class="footer-col">
            <h4>لینک‌های مهم</h4>
            <a href="create-novel.html">انتشار رمان</a>
            <a href="search.html">جستجوی پیشرفته</a>
            <a href="dashboard.html">پنل نویسنده</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© مهدی قسم زاده</span>
        </div>
      </div>
    `;
  },

  /* ---------------- Skeleton ---------------- */
  novelCardSkeleton(n=6){
    return Array.from({length:n}).map(()=>`
      <div class="novel-card">
        <div class="skeleton skel-card skel-cover"></div>
        <div class="novel-body">
          <div class="skeleton skel-line" style="width:80%"></div>
          <div class="skeleton skel-line" style="width:50%"></div>
        </div>
      </div>`).join('');
  },

  /* ---------------- Login-required modal ---------------- */
  openLoginRequiredModal(){
    Modal.open({
      icon:'',
      title:'ابتدا وارد حساب کاربری خود شوید',
      body:'برای استفاده از این قابلیت باید وارد حساب کاربری خود شوید یا ثبت‌نام کنید.',
      actions:[
        {label:'ادامه به‌صورت مهمان', kind:'ghost', onClick:()=>Modal.close()},
        {label:'ثبت‌نام', kind:'ghost', onClick:()=>location.href='register.html'},
        {label:'ورود', kind:'primary', onClick:()=>location.href='login.html'}
      ]
    });
  },

  timeAgo(iso){
    const diff = (Date.now() - new Date(iso).getTime())/1000;
    if(diff < 60) return 'همین الان';
    if(diff < 3600) return Math.floor(diff/60) + ' دقیقه پیش';
    if(diff < 86400) return Math.floor(diff/3600) + ' ساعت پیش';
    if(diff < 86400*30) return Math.floor(diff/86400) + ' روز پیش';
    return new Date(iso).toLocaleDateString('fa-IR');
  },

  formatNum(n){
    if(n >= 1000000) return (n/1000000).toFixed(1)+'م';
    if(n >= 1000) return (n/1000).toFixed(1)+'ه';
    return n;
  }
};

/* ---------------- Toast ---------------- */
const Toast = {
  stack(){
    let s = document.querySelector('.toast-stack');
    if(!s){ s = document.createElement('div'); s.className='toast-stack'; document.body.appendChild(s); }
    return s;
  },
  show(message, type=''){
    const stack = this.stack();
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.setAttribute('role','status');
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(()=>{
      el.classList.add('leaving');
      setTimeout(()=>el.remove(), 220);
    }, 2800);
  }
};

/* ---------------- Modal ---------------- */
const Modal = {
  open({icon='ℹ', iconClass='', title, body, actions=[]}){
    this.close();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.id = 'activeModal';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        
        <h3 id="modalTitle">${title}</h3>
        <p>${body}</p>
        <div class="modal-actions"></div>
      </div>`;
    const actionsWrap = backdrop.querySelector('.modal-actions');
    actions.forEach(a=>{
      const btn = document.createElement('button');
      btn.className = 'btn ' + (a.kind==='primary' ? 'btn-primary' : a.kind==='danger' ? 'btn-plum' : 'btn-ghost');
      btn.textContent = a.label;
      btn.addEventListener('click', a.onClick);
      actionsWrap.appendChild(btn);
    });
    backdrop.addEventListener('click', e=>{ if(e.target === backdrop) this.close(); });
    document.body.appendChild(backdrop);
  },
  close(){ document.getElementById('activeModal')?.remove(); }
};
