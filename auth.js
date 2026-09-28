/* ===================================================================
   NovelHub — Authentication (demo, localStorage-backed)
   Replace Auth.login/register/logout bodies with real API calls
   when a backend is connected; keep the same function names.
   =================================================================== */

const Auth = {
  currentUser(){
    try{ return JSON.parse(localStorage.getItem(DB_KEYS.SESSION)); }catch(e){ return null; }
  },
  isLoggedIn(){ return !!this.currentUser(); },

  register({username, email, password, avatar}){
    const users = Repo.users();
    if(users.some(u=>u.email===email)){
      return {ok:false, error:'این ایمیل قبلاً ثبت شده است.'};
    }
    if(users.some(u=>u.username===username)){
      return {ok:false, error:'این نام کاربری قبلاً استفاده شده است.'};
    }
    const user = {
      id:'u_'+Date.now(),
      username, email, password, // demo only — never store plaintext passwords in a real backend
      avatar: avatar || 'https://i.pravatar.cc/150?u='+encodeURIComponent(email),
      bio:'', followers:0, following:0, createdAt:new Date().toISOString()
    };
    users.push(user);
    Repo.saveUsers(users);
    this._setSession(user);
    return {ok:true, user};
  },

  login({identifier, password}){
    const users = Repo.users();
    const user = users.find(u => (u.email===identifier || u.username===identifier) && u.password===password);
    if(!user) return {ok:false, error:'نام کاربری/ایمیل یا رمز عبور اشتباه است.'};
    this._setSession(user);
    return {ok:true, user};
  },

  logout(){
    localStorage.removeItem(DB_KEYS.SESSION);
  },

  _setSession(user){
    const {password, ...safe} = user;
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(safe));
  },

  updateProfile(patch){
    const cur = this.currentUser();
    if(!cur) return;
    const users = Repo.users();
    const idx = users.findIndex(u=>u.id===cur.id);
    if(idx>-1){
      users[idx] = {...users[idx], ...patch};
      Repo.saveUsers(users);
      this._setSession(users[idx]);
    }
  },

  /** Guards an action; if guest, opens the login-required modal and returns false. */
  requireLogin(){
    if(this.isLoggedIn()) return true;
    UI.openLoginRequiredModal();
    return false;
  }
};
