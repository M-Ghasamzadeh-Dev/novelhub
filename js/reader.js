/* ===================================================================
   NovelHub — Reader page logic (font size, width, theme, drawer)
   =================================================================== */

const Reader = {
  settingsKey: 'nh_reader_settings',

  getSettings(){
    return Object.assign({fontSize:19, width:720, theme:'dark'}, JSON.parse(localStorage.getItem(this.settingsKey)||'{}'));
  },
  saveSettings(s){ localStorage.setItem(this.settingsKey, JSON.stringify(s)); },

  applySettings(){
    const s = this.getSettings();
    document.documentElement.style.setProperty('--reader-font-size', s.fontSize+'px');
    document.documentElement.style.setProperty('--reader-width', s.width+'px');
    document.body.setAttribute('data-reader-theme', s.theme);
    document.querySelectorAll('.rs-theme-btns button').forEach(b=>{
      b.classList.toggle('active', b.dataset.rtheme === s.theme);
    });
  },

  changeFontSize(delta){
    const s = this.getSettings();
    s.fontSize = Math.min(28, Math.max(14, s.fontSize + delta));
    this.saveSettings(s);
    this.applySettings();
  },
  setWidth(width){
    const s = this.getSettings(); s.width = width; this.saveSettings(s); this.applySettings();
  },
  setTheme(theme){
    const s = this.getSettings(); s.theme = theme; this.saveSettings(s); this.applySettings();
  },

  markLastRead(novelId, chapterId){
    if(!Auth.isLoggedIn()) return;
    const u = Auth.currentUser();
    const key = 'nh_lastread_'+u.id;
    const map = JSON.parse(localStorage.getItem(key) || '{}');
    map[novelId] = chapterId;
    localStorage.setItem(key, JSON.stringify(map));
  },
  getLastRead(novelId){
    const u = Auth.currentUser();
    if(!u) return null;
    const map = JSON.parse(localStorage.getItem('nh_lastread_'+u.id) || '{}');
    return map[novelId] || null;
  }
};
