/* ===================================================================
   NovelHub — Theme switcher (dark / light)
   =================================================================== */

const Theme = {
  init(){
    const saved = localStorage.getItem(DB_KEYS.THEME) || 'dark';
    this.apply(saved);
  },
  apply(mode){
    if(mode === 'light'){ document.documentElement.setAttribute('data-theme','light'); }
    else{ document.documentElement.removeAttribute('data-theme'); }
    localStorage.setItem(DB_KEYS.THEME, mode);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
      btn.textContent = mode === 'light' ? '🌙' : '☀️';
      btn.setAttribute('aria-label', mode === 'light' ? 'فعال‌سازی حالت تیره' : 'فعال‌سازی حالت روشن');
    });
  },
  toggle(){
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    this.apply(isLight ? 'dark' : 'light');
  }
};
Theme.init();
