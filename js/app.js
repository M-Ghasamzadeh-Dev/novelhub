/**
 * app.js
 * ---------------------------------------------------------------
 * هسته‌ی برنامه:
 *   1. NR.config   تنظیمات کلی
 *   2. NR.utils    توابع کمکی (فرمت اعداد، تاریخ، امنیت متن و…)
 *   3. NR.storage  لایه‌ی ذخیره‌سازی (localStorage / sessionStorage)
 *   4. NR.db       مدیریت کالکشن‌ها و Seed اولیه
 *   5. NR.api      لایه‌ی سرویس (Service Layer) — تنها نقطه‌ای که UI با داده
 *                  صحبت می‌کند. همه‌ی متدها Promise برمی‌گردانند تا بعداً
 *                  بدون تغییر UI، با fetch به API واقعی جایگزین شوند.
 *   6. NR.boot     راه‌اندازی صفحه بر اساس data-page روی <body>
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';

  const NR = (window.NR = window.NR || {});
  NR.pages = NR.pages || {};

  /* ============================== 1. Config ============================== */
  NR.config = {
    appName: 'شب‌نامه',
    storagePrefix: 'nr_',
    dataVersion: '1.0.0',
    /** تأخیر شبیه‌سازی‌شده‌ی شبکه برای نمایش Skeleton (میلی‌ثانیه) */
    apiDelay: 320,
    /** وقتی Backend آماده شد: true و آدرس API را تنظیم کنید */
    useRemoteApi: false,
    apiBaseUrl: '/api/v1'
  };

  /* ============================== 2. Utils ============================== */
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const utils = {
    qs: (sel, root = document) => root.querySelector(sel),
    qsa: (sel, root = document) => Array.from(root.querySelectorAll(sel)),

    /** جلوگیری از XSS هنگام درج متن کاربر در HTML */
    escapeHTML(str = '') {
      return String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    },

    toFa(value) {
      return String(value).replace(/\d/g, (d) => faDigits[d]);
    },

    /** فرمت اعداد: ۱۲٫۴ هزار / ۱٫۲ میلیون */
    formatNumber(num = 0) {
      const n = Number(num) || 0;
      if (n >= 1e6) return utils.toFa((n / 1e6).toFixed(1).replace(/\.0$/, '')).replace('.', '٫') + ' میلیون';
      if (n >= 1e3) return utils.toFa((n / 1e3).toFixed(1).replace(/\.0$/, '')).replace('.', '٫') + ' هزار';
      return utils.toFa(n);
    },

    formatDate(iso) {
      if (!iso) return '—';
      try {
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
      } catch (e) {
        return utils.toFa(new Date(iso).toLocaleDateString());
      }
    },

    timeAgo(iso) {
      const diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return 'همین حالا';
      const units = [[31536000, 'سال'], [2592000, 'ماه'], [604800, 'هفته'], [86400, 'روز'], [3600, 'ساعت'], [60, 'دقیقه']];
      for (const [sec, label] of units) {
        if (diff >= sec) return utils.toFa(Math.floor(diff / sec)) + ' ' + label + ' پیش';
      }
      return 'همین حالا';
    },

    uid(prefix = 'id') {
      return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    getParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    },

    setParams(params) {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) url.searchParams.delete(k);
        else url.searchParams.set(k, Array.isArray(v) ? v.join(',') : v);
      });
      window.history.replaceState(null, '', url);
    },

    debounce(fn, wait = 250) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    },

    /** یکسان‌سازی حروف فارسی/عربی برای جستجو */
    normalize(str = '') {
      return String(str)
        .toLowerCase()
        .replace(/[يى]/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/[\u200c\u200f]/g, ' ')
        .replace(/[\u064B-\u0652]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    },

    /** هش ساده برای رمز دمو (امنیتی نیست؛ فقط برای ذخیره نشدن متن خام) */
    hash(str) {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
      return 'h' + (h >>> 0).toString(16);
    },

    clone(obj) {
      return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
    },

    /** خواندن فایل تصویر و کوچک کردن آن (برای جا شدن در localStorage) */
    resizeImage(file, maxSize = 720, quality = 0.82) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) return reject(new Error('فایل انتخاب‌شده تصویر نیست.'));
        if (file.size > 8 * 1024 * 1024) return reject(new Error('حجم تصویر نباید بیشتر از ۸ مگابایت باشد.'));
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('خواندن فایل ممکن نشد.'));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error('تصویر معتبر نیست.'));
          img.onload = () => {
            const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    },

    ageLabel(age) {
      return { all: 'عمومی', 13: '+۱۳', 16: '+۱۶', 18: '+۱۸' }[age] || 'عمومی';
    },

    statusLabel(status) {
      return { ongoing: 'در حال انتشار', completed: 'تکمیل شده', draft: 'پیش‌نویس', published: 'منتشر شده' }[status] || status;
    }
  };
  NR.utils = utils;

  /* ============================== 3. Storage ============================== */
  NR.storage = {
    key: (k) => NR.config.storagePrefix + k,
    get(k, fallback = null, area = localStorage) {
      try {
        const raw = area.getItem(this.key(k));
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(k, value, area = localStorage) {
      try {
        area.setItem(this.key(k), JSON.stringify(value));
        return true;
      } catch (e) {
        // معمولاً QuotaExceededError به خاطر تصاویر حجیم
        const err = new Error('فضای ذخیره‌سازی مرورگر پر شده است. تصویر کوچک‌تری انتخاب کنید.');
        err.code = 'QUOTA';
        throw err;
      }
    },
    remove(k, area = localStorage) {
      area.removeItem(this.key(k));
    }
  };

  /* ============================== 4. DB (Local) ============================== */
  const COLLECTIONS = ['users', 'novels', 'chapters', 'comments', 'reactions', 'commentLikes', 'bookmarks', 'follows', 'notifications', 'activities', 'progress', 'messages'];

  NR.db = {
    init() {
      if (NR.storage.get('dataVersion') === NR.config.dataVersion) return;
      const s = NR.seed;
      const users = s.users.map((u) => {
        const { password, ...rest } = u;
        return { ...rest, passwordHash: utils.hash(password), avatar: null };
      });
      const data = {
        users,
        novels: s.novels.map((n) => ({ adult: false, cover: null, penName: '', visibility: 'published', ...n })),
        chapters: s.chapters,
        comments: s.comments,
        reactions: [],
        commentLikes: [],
        bookmarks: s.bookmarks,
        follows: s.follows,
        notifications: s.notifications,
        activities: s.activities,
        progress: [],
        messages: []
      };
      COLLECTIONS.forEach((c) => NR.storage.set('db_' + c, data[c] || []));
      NR.storage.set('dataVersion', NR.config.dataVersion);
    },
    all(name) {
      return NR.storage.get('db_' + name, []);
    },
    save(name, list) {
      NR.storage.set('db_' + name, list);
    },
    /** بازنشانی کامل داده‌های دمو */
    reset() {
      COLLECTIONS.forEach((c) => NR.storage.remove('db_' + c));
      NR.storage.remove('dataVersion');
      NR.storage.remove('session');
      NR.storage.remove('session', sessionStorage);
      this.init();
    }
  };

  /* ============================== 5. API (Service Layer) ============================== */
  /** شبیه‌سازی درخواست شبکه */
  function respond(fn, delay = NR.config.apiDelay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(utils.clone(fn()));
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  }

  function fail(message, code = 'ERROR') {
    const err = new Error(message);
    err.code = code;
    throw err;
  }

  /** کلاینت HTTP آماده برای اتصال به Backend واقعی */
  NR.http = async function (method, path, body) {
    const session = NR.api.auth.session();
    const res = await fetch(NR.config.apiBaseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(session && session.token ? { Authorization: 'Bearer ' + session.token } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) fail(data.message || 'خطا در ارتباط با سرور', res.status);
    return data;
  };

  const db = NR.db;
  const publicUser = (u) => {
    if (!u) return null;
    const { passwordHash, ...rest } = u;
    const follows = db.all('follows');
    const novels = db.all('novels').filter((n) => n.authorId === u.id && n.visibility === 'published');
    return {
      ...rest,
      followers: (u.followersBase || 0) + follows.filter((f) => f.authorId === u.id).length,
      following: (u.followingBase || 0) + follows.filter((f) => f.followerId === u.id).length,
      novelCount: novels.length
    };
  };

  function currentUserId() {
    const s = NR.api.auth.session();
    return s ? s.userId : null;
  }

  function requireUser() {
    const id = currentUserId();
    if (!id) fail('برای این کار باید وارد حساب شوید.', 'AUTH');
    return id;
  }

  function enrichNovel(n, ctx = {}) {
    const users = ctx.users || db.all('users');
    const chapters = ctx.chapters || db.all('chapters');
    const author = users.find((u) => u.id === n.authorId);
    const published = chapters.filter((c) => c.novelId === n.id && c.status === 'published');
    return {
      ...n,
      author: author ? { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar, color: author.color } : null,
      authorName: n.penName || (author ? author.displayName : 'ناشناس'),
      chapterCount: published.length,
      genresInfo: n.genres.map((g) => NR.seed.genres.find((x) => x.slug === g)).filter(Boolean)
    };
  }

  function pushNotification(userId, payload) {
    if (!userId) return;
    const list = db.all('notifications');
    list.unshift({ id: utils.uid('nt'), userId, read: false, createdAt: new Date().toISOString(), ...payload });
    db.save('notifications', list.slice(0, 200));
  }

  function logActivity(userId, type, novelId, text) {
    const list = db.all('activities');
    list.unshift({ id: utils.uid('a'), userId, type, novelId, text, createdAt: new Date().toISOString() });
    db.save('activities', list.slice(0, 300));
  }

  function sortNovels(list, sort) {
    const by = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      popular: (a, b) => b.likes - a.likes,
      views: (a, b) => b.views - a.views,
      rating: (a, b) => b.rating - a.rating
    }[sort || 'newest'];
    return by ? list.sort(by) : list;
  }

  NR.api = {
    /* ---------- احراز هویت ---------- */
    auth: {
      /** جلسه‌ی فعلی (همزمان؛ برای رندر سریع Header) */
      session() {
        return NR.storage.get('session') || NR.storage.get('session', null, sessionStorage);
      },
      currentUser() {
        const s = this.session();
        if (!s) return null;
        return publicUser(db.all('users').find((u) => u.id === s.userId));
      },
      login({ identifier, password, remember }) {
        return respond(() => {
          const id = utils.normalize(identifier);
          const user = db.all('users').find((u) => u.email.toLowerCase() === id || u.username.toLowerCase() === id);
          if (!user || user.passwordHash !== utils.hash(password)) fail('ایمیل/نام کاربری یا رمز عبور اشتباه است.', 'INVALID');
          const session = { userId: user.id, token: 'demo.' + utils.uid('t'), createdAt: new Date().toISOString() };
          NR.storage.remove('session');
          NR.storage.remove('session', sessionStorage);
          NR.storage.set('session', session, remember ? localStorage : sessionStorage);
          return publicUser(user);
        });
      },
      register({ username, email, password, avatar }) {
        return respond(() => {
          const users = db.all('users');
          const uname = username.trim().toLowerCase();
          if (!/^[a-z0-9_.]{3,20}$/.test(uname)) fail('نام کاربری باید ۳ تا ۲۰ حرف انگلیسی، عدد، _ یا . باشد.', 'VALIDATION');
          if (users.some((u) => u.username.toLowerCase() === uname)) fail('این نام کاربری قبلاً ثبت شده است.', 'DUPLICATE');
          if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) fail('این ایمیل قبلاً ثبت شده است.', 'DUPLICATE');
          const colors = ['#7b4fa8', '#8e2436', '#b8893a', '#2f7a7a', '#4f5fb0'];
          const user = {
            id: utils.uid('u'), username: uname, displayName: username.trim(), email: email.trim().toLowerCase(),
            passwordHash: utils.hash(password), avatar: avatar || null, bio: '', followersBase: 0, followingBase: 0,
            color: colors[users.length % colors.length], createdAt: new Date().toISOString()
          };
          users.push(user);
          db.save('users', users);
          pushNotification(user.id, { type: 'system', text: 'به شب‌نامه خوش آمدید! اولین رمان خود را بنویسید یا از میان قصه‌ها یکی را انتخاب کنید.' });
          NR.storage.set('session', { userId: user.id, token: 'demo.' + utils.uid('t'), createdAt: new Date().toISOString() });
          return publicUser(user);
        });
      },
      logout() {
        return respond(() => {
          NR.storage.remove('session');
          NR.storage.remove('session', sessionStorage);
          return true;
        }, 100);
      },
      forgotPassword(identifier) {
        return respond(() => {
          if (!identifier) fail('ایمیل یا نام کاربری را وارد کنید.');
          return true;
        });
      }
    },

    /* ---------- کاربران و نویسندگان ---------- */
    users: {
      get(idOrUsername) {
        return respond(() => {
          const u = db.all('users').find((x) => x.id === idOrUsername || x.username === idOrUsername);
          if (!u) fail('کاربر پیدا نشد.', 'NOT_FOUND');
          return publicUser(u);
        });
      },
      authors({ limit } = {}) {
        return respond(() => {
          const list = db.all('users').map(publicUser).filter((u) => u.novelCount > 0).sort((a, b) => b.followers - a.followers);
          return limit ? list.slice(0, limit) : list;
        });
      },
      updateProfile(data) {
        return respond(() => {
          const id = requireUser();
          const users = db.all('users');
          const user = users.find((u) => u.id === id);
          if (data.displayName !== undefined) {
            if (!data.displayName.trim()) fail('نام نمایشی نمی‌تواند خالی باشد.');
            user.displayName = data.displayName.trim();
          }
          if (data.bio !== undefined) user.bio = data.bio.trim().slice(0, 300);
          if (data.avatar !== undefined) user.avatar = data.avatar;
          if (data.newPassword) {
            if (user.passwordHash !== utils.hash(data.currentPassword || '')) fail('رمز عبور فعلی اشتباه است.');
            user.passwordHash = utils.hash(data.newPassword);
          }
          db.save('users', users);
          return publicUser(user);
        });
      },
      isFollowing(authorId) {
        const id = currentUserId();
        return !!id && db.all('follows').some((f) => f.followerId === id && f.authorId === authorId);
      },
      toggleFollow(authorId) {
        return respond(() => {
          const id = requireUser();
          if (id === authorId) fail('نمی‌توانید خودتان را دنبال کنید.');
          let follows = db.all('follows');
          const exists = follows.some((f) => f.followerId === id && f.authorId === authorId);
          if (exists) follows = follows.filter((f) => !(f.followerId === id && f.authorId === authorId));
          else {
            follows.push({ followerId: id, authorId, createdAt: new Date().toISOString() });
            const me = db.all('users').find((u) => u.id === id);
            pushNotification(authorId, { type: 'follow', actorId: id, novelId: null, text: `${me.displayName} شما را دنبال کرد.` });
          }
          db.save('follows', follows);
          const author = publicUser(db.all('users').find((u) => u.id === authorId));
          return { following: !exists, followers: author.followers };
        }, 150);
      },
      activities(userId) {
        return respond(() => db.all('activities').filter((a) => a.userId === userId).slice(0, 30));
      }
    },

    /* ---------- رمان‌ها ---------- */
    novels: {
      /**
       * فهرست رمان‌ها با فیلتر
       * @param {Object} f { q, genres[], status, age, sort, authorId, contentType, limit, includeDrafts }
       */
      list(f = {}) {
        return respond(() => {
          const ctx = { users: db.all('users'), chapters: db.all('chapters') };
          const me = currentUserId();
          let list = db.all('novels').filter((n) => n.visibility === 'published' || (f.includeDrafts && n.authorId === me));
          if (f.authorId) list = list.filter((n) => n.authorId === f.authorId);
          if (f.ids) list = list.filter((n) => f.ids.includes(n.id));
          if (f.genres && f.genres.length) list = list.filter((n) => f.genres.every((g) => n.genres.includes(g)));
          if (f.status) list = list.filter((n) => n.status === f.status);
          if (f.age) list = list.filter((n) => n.ageRating === f.age);
          if (f.contentType) list = list.filter((n) => n.contentType === f.contentType);
          let enriched = list.map((n) => enrichNovel(n, ctx));
          if (f.q) {
            const q = utils.normalize(f.q);
            const field = f.field || 'all';
            enriched = enriched.filter((n) => {
              const hay = {
                title: n.title,
                author: n.authorName + ' ' + (n.author ? n.author.username : ''),
                genre: n.genresInfo.map((g) => g.name).join(' '),
                tag: n.tags.join(' ')
              };
              const text = field === 'all' ? Object.values(hay).join(' ') + ' ' + n.summary : hay[field] || '';
              return q.split(' ').every((part) => utils.normalize(text).includes(part));
            });
          }
          enriched = sortNovels(enriched, f.sort);
          return f.limit ? enriched.slice(0, f.limit) : enriched;
        });
      },
      get(id) {
        return respond(() => {
          const n = db.all('novels').find((x) => x.id === id);
          if (!n || (n.visibility !== 'published' && n.authorId !== currentUserId())) fail('رمان مورد نظر پیدا نشد.', 'NOT_FOUND');
          const novel = enrichNovel(n);
          const me = currentUserId();
          const reaction = me ? db.all('reactions').find((r) => r.userId === me && r.novelId === id) : null;
          novel.userReaction = reaction ? reaction.type : null;
          novel.bookmarked = !!me && db.all('bookmarks').some((b) => b.userId === me && b.novelId === id);
          novel.commentCount = db.all('comments').filter((c) => c.novelId === id).length;
          novel.isOwner = me === n.authorId;
          return novel;
        });
      },
      /** ثبت بازدید (یک بار در هر نشست مرورگر) */
      view(id) {
        const seen = NR.storage.get('viewed', [], sessionStorage);
        if (seen.includes(id)) return Promise.resolve(false);
        seen.push(id);
        NR.storage.set('viewed', seen, sessionStorage);
        const novels = db.all('novels');
        const n = novels.find((x) => x.id === id);
        if (n) {
          n.views += 1;
          db.save('novels', novels);
        }
        return Promise.resolve(true);
      },
      validate(data) {
        if (!data.title || data.title.trim().length < 2) fail('عنوان رمان باید حداقل ۲ حرف باشد.', 'VALIDATION');
        if (!data.summary || data.summary.trim().length < 10) fail('توضیح کوتاه باید حداقل ۱۰ حرف باشد.', 'VALIDATION');
        if (!data.genres || !data.genres.length) fail('حداقل یک ژانر انتخاب کنید.', 'VALIDATION');
      },
      create(data) {
        return respond(() => {
          const id = requireUser();
          this.validate(data);
          const novels = db.all('novels');
          const adult = !!data.adult || data.ageRating === '18';
          const novel = {
            id: utils.uid('n'), authorId: id, title: data.title.trim(), summary: data.summary.trim(), description: (data.description || '').trim(),
            genres: data.genres, status: data.status || 'ongoing', ageRating: adult ? '18' : data.ageRating || 'all', adult,
            contentType: data.contentType || 'text', cover: data.cover || null, tags: data.tags || [], penName: (data.penName || '').trim(),
            visibility: data.visibility || 'published', motif: 'moon', palette: null, views: 0, likes: 0, dislikes: 0, rating: 0,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          };
          novels.unshift(novel);
          db.save('novels', novels);
          logActivity(id, 'create', novel.id, `رمان «${novel.title}» را ایجاد کرد.`);
          return enrichNovel(novel);
        }, 500);
      },
      update(novelId, data) {
        return respond(() => {
          const id = requireUser();
          this.validate(data);
          const novels = db.all('novels');
          const novel = novels.find((n) => n.id === novelId);
          if (!novel) fail('رمان پیدا نشد.', 'NOT_FOUND');
          if (novel.authorId !== id) fail('شما اجازه‌ی ویرایش این رمان را ندارید.', 'FORBIDDEN');
          const adult = !!data.adult || data.ageRating === '18';
          Object.assign(novel, {
            title: data.title.trim(), summary: data.summary.trim(), description: (data.description || '').trim(), genres: data.genres,
            status: data.status, ageRating: adult ? '18' : data.ageRating, adult, contentType: data.contentType, cover: data.cover || null,
            tags: data.tags || [], penName: (data.penName || '').trim(), visibility: data.visibility || novel.visibility, updatedAt: new Date().toISOString()
          });
          db.save('novels', novels);
          return enrichNovel(novel);
        }, 450);
      },
      remove(novelId) {
        return respond(() => {
          const id = requireUser();
          const novels = db.all('novels');
          const novel = novels.find((n) => n.id === novelId);
          if (!novel) fail('رمان پیدا نشد.', 'NOT_FOUND');
          if (novel.authorId !== id) fail('شما اجازه‌ی حذف این رمان را ندارید.', 'FORBIDDEN');
          db.save('novels', novels.filter((n) => n.id !== novelId));
          ['chapters', 'comments', 'reactions', 'bookmarks', 'progress'].forEach((c) => db.save(c, db.all(c).filter((x) => x.novelId !== novelId)));
          return true;
        });
      },
      /** لایک / دیس‌لایک (کلیک دوباره = برداشتن) */
      react(novelId, type) {
        return respond(() => {
          const id = requireUser();
          const novels = db.all('novels');
          const novel = novels.find((n) => n.id === novelId);
          if (!novel) fail('رمان پیدا نشد.', 'NOT_FOUND');
          let reactions = db.all('reactions');
          const prev = reactions.find((r) => r.userId === id && r.novelId === novelId);
          if (prev) {
            novel[prev.type === 'like' ? 'likes' : 'dislikes'] -= 1;
            reactions = reactions.filter((r) => r !== prev && !(r.userId === id && r.novelId === novelId));
          }
          let current = null;
          if (!prev || prev.type !== type) {
            reactions.push({ userId: id, novelId, type, createdAt: new Date().toISOString() });
            novel[type === 'like' ? 'likes' : 'dislikes'] += 1;
            current = type;
            if (type === 'like') {
              const me = db.all('users').find((u) => u.id === id);
              if (novel.authorId !== id) pushNotification(novel.authorId, { type: 'like', actorId: id, novelId, text: `${me.displayName} رمان «${novel.title}» شما را لایک کرد.` });
              logActivity(id, 'like', novelId, `رمان «${novel.title}» را پسندید.`);
            }
          }
          db.save('reactions', reactions);
          db.save('novels', novels);
          return { likes: novel.likes, dislikes: novel.dislikes, userReaction: current };
        }, 150);
      }
    },

    /* ---------- فصل‌ها ---------- */
    chapters: {
      list(novelId, { includeDrafts = false } = {}) {
        return respond(() => {
          const novel = db.all('novels').find((n) => n.id === novelId);
          const owner = novel && novel.authorId === currentUserId();
          return db.all('chapters')
            .filter((c) => c.novelId === novelId && (c.status === 'published' || (includeDrafts && owner)))
            .sort((a, b) => a.number - b.number)
            .map(({ blocks, ...meta }) => ({ ...meta, words: blocks.filter((b) => b.type === 'text').reduce((s, b) => s + b.text.split(/\s+/).length, 0) }));
        }, 200);
      },
      /** همه‌ی فصل‌های رمان‌های کاربر جاری (برای داشبورد) */
      mine() {
        return respond(() => {
          const id = requireUser();
          const myNovels = db.all('novels').filter((n) => n.authorId === id);
          return db.all('chapters')
            .filter((c) => myNovels.some((n) => n.id === c.novelId))
            .map(({ blocks, ...meta }) => ({ ...meta, novelTitle: myNovels.find((n) => n.id === meta.novelId).title }))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      },
      get(novelId, number) {
        return respond(() => {
          const ch = db.all('chapters').find((c) => c.novelId === novelId && c.number === Number(number));
          const novel = db.all('novels').find((n) => n.id === novelId);
          if (!ch || (ch.status !== 'published' && (!novel || novel.authorId !== currentUserId()))) fail('فصل پیدا نشد.', 'NOT_FOUND');
          return ch;
        });
      },
      save(novelId, data, publish = false) {
        return respond(() => {
          const id = requireUser();
          const novels = db.all('novels');
          const novel = novels.find((n) => n.id === novelId);
          if (!novel || novel.authorId !== id) fail('شما اجازه‌ی ویرایش این رمان را ندارید.', 'FORBIDDEN');
          const number = parseInt(data.number, 10);
          if (!number || number < 1) fail('شماره‌ی فصل معتبر نیست.', 'VALIDATION');
          if (!data.title || !data.title.trim()) fail('عنوان فصل را وارد کنید.', 'VALIDATION');
          const blocks = (data.blocks || []).filter((b) => (b.type === 'text' ? b.text.trim() : b.src));
          if (!blocks.length) fail('فصل باید حداقل یک بخش متن یا تصویر داشته باشد.', 'VALIDATION');
          const chapters = db.all('chapters');
          if (chapters.some((c) => c.novelId === novelId && c.number === number && c.id !== data.id)) fail(`فصل ${utils.toFa(number)} قبلاً وجود دارد.`, 'DUPLICATE');
          const now = new Date().toISOString();
          let ch = data.id ? chapters.find((c) => c.id === data.id) : null;
          const wasPublished = ch && ch.status === 'published';
          if (!ch) {
            ch = { id: utils.uid('ch'), novelId, createdAt: now, publishedAt: null, status: 'draft' };
            chapters.push(ch);
          }
          Object.assign(ch, { number, title: data.title.trim(), blocks, updatedAt: now });
          if (publish) {
            ch.status = 'published';
            ch.publishedAt = ch.publishedAt || now;
          }
          db.save('chapters', chapters);
          novel.updatedAt = now;
          db.save('novels', novels);
          if (publish && !wasPublished) {
            logActivity(id, 'chapter', novelId, `فصل ${utils.toFa(number)} رمان «${novel.title}» را منتشر کرد.`);
            db.all('bookmarks').filter((b) => b.novelId === novelId && b.userId !== id).forEach((b) =>
              pushNotification(b.userId, { type: 'chapter', actorId: id, novelId, text: `فصل جدید رمان مورد علاقه‌ی شما «${novel.title}» منتشر شد.` })
            );
          }
          return ch;
        }, 400);
      },
      remove(chapterId) {
        return respond(() => {
          const id = requireUser();
          const chapters = db.all('chapters');
          const ch = chapters.find((c) => c.id === chapterId);
          const novel = ch && db.all('novels').find((n) => n.id === ch.novelId);
          if (!ch || !novel || novel.authorId !== id) fail('اجازه‌ی حذف این فصل را ندارید.', 'FORBIDDEN');
          db.save('chapters', chapters.filter((c) => c.id !== chapterId));
          return true;
        });
      },
      nextNumber(novelId) {
        const nums = db.all('chapters').filter((c) => c.novelId === novelId).map((c) => c.number);
        return nums.length ? Math.max(...nums) + 1 : 1;
      }
    },

    /* ---------- پیشرفت مطالعه ---------- */
    progress: {
      get(novelId) {
        const uid = currentUserId() || 'guest';
        return db.all('progress').find((p) => p.userId === uid && p.novelId === novelId) || null;
      },
      set(novelId, chapterNumber, percent = 0) {
        const uid = currentUserId() || 'guest';
        const list = db.all('progress').filter((p) => !(p.userId === uid && p.novelId === novelId));
        list.unshift({ userId: uid, novelId, chapterNumber, percent, updatedAt: new Date().toISOString() });
        db.save('progress', list.slice(0, 200));
      },
      recent(limit = 6) {
        const uid = currentUserId() || 'guest';
        return db.all('progress').filter((p) => p.userId === uid).slice(0, limit);
      }
    },

    /* ---------- نظرات ---------- */
    comments: {
      list(novelId, sort = 'newest') {
        return respond(() => {
          const me = currentUserId();
          const users = db.all('users');
          const novel = db.all('novels').find((n) => n.id === novelId);
          const likes = db.all('commentLikes');
          const all = db.all('comments').filter((c) => c.novelId === novelId).map((c) => {
            const u = users.find((x) => x.id === c.userId);
            return {
              ...c,
              user: u ? { id: u.id, username: u.username, displayName: u.displayName, avatar: u.avatar, color: u.color } : { displayName: 'کاربر حذف‌شده' },
              isAuthor: novel && c.userId === novel.authorId,
              likedByMe: !!me && likes.some((l) => l.userId === me && l.commentId === c.id),
              canDelete: !!me && (c.userId === me || (novel && novel.authorId === me))
            };
          });
          const roots = all.filter((c) => !c.parentId);
          roots.sort((a, b) => (sort === 'top' ? b.likes - a.likes : sort === 'oldest' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)));
          return roots.map((r) => ({ ...r, replies: all.filter((c) => c.parentId === r.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) }));
        }, 250);
      },
      add(novelId, text, parentId = null) {
        return respond(() => {
          const id = requireUser();
          const clean = (text || '').trim();
          if (clean.length < 2) fail('متن نظر خیلی کوتاه است.', 'VALIDATION');
          if (clean.length > 1500) fail('متن نظر حداکثر ۱۵۰۰ حرف می‌تواند باشد.', 'VALIDATION');
          const comments = db.all('comments');
          const parent = parentId ? comments.find((c) => c.id === parentId) : null;
          const comment = { id: utils.uid('c'), novelId, userId: id, parentId: parent ? parent.parentId || parent.id : null, text: clean, likes: 0, createdAt: new Date().toISOString() };
          comments.push(comment);
          db.save('comments', comments);
          const novel = db.all('novels').find((n) => n.id === novelId);
          const me = db.all('users').find((u) => u.id === id);
          if (novel && novel.authorId !== id) pushNotification(novel.authorId, { type: 'comment', actorId: id, novelId, text: `${me.displayName} روی رمان «${novel.title}» شما کامنت گذاشت.` });
          if (parent && parent.userId !== id) pushNotification(parent.userId, { type: 'reply', actorId: id, novelId, text: `${me.displayName} به نظر شما پاسخ داد.` });
          logActivity(id, 'comment', novelId, `روی «${novel ? novel.title : ''}» نظر داد.`);
          return comment;
        }, 300);
      },
      toggleLike(commentId) {
        return respond(() => {
          const id = requireUser();
          const comments = db.all('comments');
          const c = comments.find((x) => x.id === commentId);
          if (!c) fail('نظر پیدا نشد.', 'NOT_FOUND');
          let likes = db.all('commentLikes');
          const liked = likes.some((l) => l.userId === id && l.commentId === commentId);
          if (liked) {
            likes = likes.filter((l) => !(l.userId === id && l.commentId === commentId));
            c.likes = Math.max(0, c.likes - 1);
          } else {
            likes.push({ userId: id, commentId });
            c.likes += 1;
          }
          db.save('commentLikes', likes);
          db.save('comments', comments);
          return { liked: !liked, likes: c.likes };
        }, 120);
      },
      remove(commentId) {
        return respond(() => {
          const id = requireUser();
          const comments = db.all('comments');
          const c = comments.find((x) => x.id === commentId);
          const novel = c && db.all('novels').find((n) => n.id === c.novelId);
          if (!c || (c.userId !== id && (!novel || novel.authorId !== id))) fail('اجازه‌ی حذف این نظر را ندارید.', 'FORBIDDEN');
          db.save('comments', comments.filter((x) => x.id !== commentId && x.parentId !== commentId));
          return true;
        });
      },
      /** نظرات روی رمان‌های کاربر جاری (داشبورد نویسنده) */
      onMyNovels() {
        return respond(() => {
          const id = requireUser();
          const myNovels = db.all('novels').filter((n) => n.authorId === id);
          const users = db.all('users');
          return db.all('comments')
            .filter((c) => myNovels.some((n) => n.id === c.novelId) && c.userId !== id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((c) => {
              const u = users.find((x) => x.id === c.userId);
              return { ...c, novelTitle: myNovels.find((n) => n.id === c.novelId).title, user: u ? { displayName: u.displayName, username: u.username, avatar: u.avatar, color: u.color } : {} };
            });
        });
      }
    },

    /* ---------- علاقه‌مندی‌ها ---------- */
    bookmarks: {
      has(novelId) {
        const id = currentUserId();
        return !!id && db.all('bookmarks').some((b) => b.userId === id && b.novelId === novelId);
      },
      toggle(novelId) {
        return respond(() => {
          const id = requireUser();
          let list = db.all('bookmarks');
          const exists = list.some((b) => b.userId === id && b.novelId === novelId);
          if (exists) list = list.filter((b) => !(b.userId === id && b.novelId === novelId));
          else {
            list.unshift({ userId: id, novelId, createdAt: new Date().toISOString() });
            const novel = db.all('novels').find((n) => n.id === novelId);
            logActivity(id, 'bookmark', novelId, `«${novel ? novel.title : ''}» را به علاقه‌مندی‌ها افزود.`);
          }
          db.save('bookmarks', list);
          return { bookmarked: !exists };
        }, 150);
      },
      list(userId) {
        return respond(() => {
          const id = userId || requireUser();
          const ids = db.all('bookmarks').filter((b) => b.userId === id).map((b) => b.novelId);
          const ctx = { users: db.all('users'), chapters: db.all('chapters') };
          return ids.map((nid) => db.all('novels').find((n) => n.id === nid && n.visibility === 'published')).filter(Boolean).map((n) => enrichNovel(n, ctx));
        });
      }
    },

    /* ---------- اعلان‌ها ---------- */
    notifications: {
      unreadCount() {
        const id = currentUserId();
        return id ? db.all('notifications').filter((n) => n.userId === id && !n.read).length : 0;
      },
      list() {
        return respond(() => {
          const id = requireUser();
          const users = db.all('users');
          return db.all('notifications')
            .filter((n) => n.userId === id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((n) => ({ ...n, actor: users.find((u) => u.id === n.actorId) ? publicUser(users.find((u) => u.id === n.actorId)) : null }));
        });
      },
      markRead(notificationId) {
        return respond(() => {
          const id = requireUser();
          const list = db.all('notifications');
          list.forEach((n) => {
            if (n.userId === id && (!notificationId || n.id === notificationId)) n.read = true;
          });
          db.save('notifications', list);
          return true;
        }, 80);
      },
      remove(notificationId) {
        return respond(() => {
          const id = requireUser();
          db.save('notifications', db.all('notifications').filter((n) => !(n.userId === id && n.id === notificationId)));
          return true;
        }, 80);
      }
    },

    /* ---------- داشبورد نویسنده ---------- */
    dashboard: {
      stats() {
        return respond(() => {
          const id = requireUser();
          const ctx = { users: db.all('users'), chapters: db.all('chapters') };
          const novels = db.all('novels').filter((n) => n.authorId === id).map((n) => enrichNovel(n, ctx));
          const comments = db.all('comments').filter((c) => novels.some((n) => n.id === c.novelId));
          const me = publicUser(db.all('users').find((u) => u.id === id));
          return {
            novels,
            totals: {
              novels: novels.length,
              views: novels.reduce((s, n) => s + n.views, 0),
              likes: novels.reduce((s, n) => s + n.likes, 0),
              comments: comments.length,
              followers: me.followers,
              chapters: ctx.chapters.filter((c) => novels.some((n) => n.id === c.novelId)).length
            }
          };
        });
      }
    },

    /* ---------- تماس با ما ---------- */
    contact: {
      send(data) {
        return respond(() => {
          const list = db.all('messages');
          list.push({ id: utils.uid('m'), ...data, createdAt: new Date().toISOString() });
          db.save('messages', list);
          return true;
        }, 500);
      }
    },

    genres() {
      return NR.seed.genres;
    }
  };

  /* ============================== 6. Boot ============================== */
  NR.boot = function () {
    NR.db.init();
    if (NR.theme) NR.theme.init();
    if (NR.ui) NR.ui.renderLayout();
    const page = document.body.dataset.page;
    const init = NR.pages[page];
    if (typeof init === 'function') {
      Promise.resolve(init()).catch((err) => {
        console.error(err);
        NR.ui && NR.ui.toast(err.message || 'خطایی رخ داد.', 'error');
      });
    }
    document.body.classList.add('is-ready');
  };

  document.addEventListener('DOMContentLoaded', () => NR.boot());
})();
