/* ===================================================================
   NovelHub — Demo data + storage-backed "repository" layer.
   This module is the ONLY place that talks to localStorage for domain
   data. To connect a real backend later, replace the body of each
   Repo function with a fetch() call to your API — nothing else in
   the app needs to change (see README section 6).
   =================================================================== */

const DB_KEYS = {
  NOVELS: 'nh_novels',
  AUTHORS: 'nh_authors',
  CHAPTERS: 'nh_chapters',
  COMMENTS: 'nh_comments',
  USERS: 'nh_users',
  SESSION: 'nh_session',
  BOOKMARKS: 'nh_bookmarks',
  LIKES: 'nh_likes',
  DISLIKES: 'nh_dislikes',
  NOTIFS: 'nh_notifications',
  THEME: 'nh_theme',
  SEEDED: 'nh_seeded_v1'
};

const GENRES = [
  {id:'romance', name:'عاشقانه', icon:'💜'},
  {id:'drama', name:'درام', icon:'🎭'},
  {id:'sad', name:'غمگین', icon:'🌧️'},
  {id:'social', name:'اجتماعی', icon:'🏙️'},
  {id:'fantasy', name:'فانتزی', icon:'🐉'},
  {id:'crime', name:'جنایی', icon:'🔪'},
  {id:'mystery', name:'معمایی', icon:'🕵️'},
  {id:'horror', name:'ترسناک', icon:'👻'},
  {id:'thriller', name:'هیجانی', icon:'⚡'},
  {id:'scifi', name:'علمی‌تخیلی', icon:'🛰️'},
  {id:'historical', name:'تاریخی', icon:'🏛️'},
  {id:'comedy', name:'طنز', icon:'😄'},
  {id:'motivational', name:'انگیزشی', icon:'🌱'},
  {id:'adventure', name:'ماجراجویی', icon:'🧭'},
  {id:'teen', name:'نوجوان', icon:'🎒'},
  {id:'adult', name:'بزرگسال (+۱۸)', icon:'🔞'}
];

function genreName(id){ const g = GENRES.find(x=>x.id===id); return g ? g.name : id; }

function seedDatabase(){
  if(localStorage.getItem(DB_KEYS.SEEDED)) return;

  const authors = [
    {id:'a1', name:'سارا امیری', avatar:'https://i.pravatar.cc/150?img=47', bio:'نویسنده‌ی رمان‌های عاشقانه و اجتماعی', followers:2840},
    {id:'a2', name:'رضا نجفی', avatar:'https://i.pravatar.cc/150?img=12', bio:'داستان‌نویس ژانر جنایی و معمایی', followers:4120},
    {id:'a3', name:'مریم کاظمی', avatar:'https://i.pravatar.cc/150?img=32', bio:'رمان‌های فانتزی و ماجراجویی می‌نویسم', followers:6710},
    {id:'a4', name:'امیرحسین رادفر', avatar:'https://i.pravatar.cc/150?img=15', bio:'علمی‌تخیلی و آینده‌نگری', followers:3390},
    {id:'a5', name:'نگار حسینی', avatar:'https://i.pravatar.cc/150?img=44', bio:'داستان‌های کوتاهِ غمگین و اجتماعی', followers:1980},
    {id:'a6', name:'کیوان صادقی', avatar:'https://i.pravatar.cc/150?img=53', bio:'طنزنویس و راوی داستان‌های نوجوان', followers:2560}
  ];

  const covers = [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80',
    'https://images.unsplash.com/photo-1531901599143-df5010ab9438?w=500&q=80',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&q=80',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=500&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80'
  ];

  const titles = [
    {t:'در سایه‌ی باران', g:['romance','drama'], a:'a1'},
    {t:'خط قرمز', g:['crime','mystery'], a:'a2'},
    {t:'افسانه‌ی تاج شکسته', g:['fantasy','adventure'], a:'a3'},
    {t:'مدار هفتم', g:['scifi','thriller'], a:'a4'},
    {t:'برگ‌های خزان', g:['sad','social'], a:'a5'},
    {t:'خنده‌های ممنوع', g:['comedy','teen'], a:'a6'},
    {t:'سایه‌های تهران قدیم', g:['historical','drama'], a:'a2'},
    {t:'ملکه‌ی مه', g:['fantasy','romance'], a:'a3'},
    {t:'صدای خاموش', g:['mystery','thriller'], a:'a2'},
    {t:'ستاره‌ای برای فردا', g:['motivational','social'], a:'a5'},
    {t:'شب‌های بی‌ماه', g:['horror','thriller'], a:'a4'},
    {t:'قلب‌های آهنی', g:['adult','drama'], a:'a1'}
  ];

  const novels = titles.map((x,i)=>({
    id:'n'+(i+1),
    title:x.t,
    author:x.a,
    cover:covers[i],
    genres:x.g,
    shortDesc:'داستانی پر از احساس، رمز و رازهایی که تا آخرین صفحه رهایتان نمی‌کند.',
    fullDesc:'این رمان روایتگر زندگی شخصیت‌هایی‌ست که در دل حوادث روزمره با تصمیم‌های بزرگ روبه‌رو می‌شوند. نویسنده با نثری روان و ریتمی جذاب، خواننده را به دنیای داستان دعوت می‌کند تا همراه شخصیت‌ها فراز و فرودهای زندگی را تجربه کند.',
    status: i%3===0 ? 'complete' : 'ongoing',
    ageRating: x.g.includes('adult') ? '18' : (i%5===0 ? '16' : (i%4===0?'13':'general')),
    views: Math.floor(1200 + Math.random()*48000),
    likes: Math.floor(80 + Math.random()*3200),
    dislikes: Math.floor(2+Math.random()*90),
    chapterCount: 4 + (i%6),
    published: new Date(Date.now() - i*86400000*9).toISOString(),
    updated: new Date(Date.now() - i*86400000*2).toISOString(),
    tags:['احساسی','پرکشش','ایرانی'],
    createdBy: null
  }));

  const chapters = [];
  novels.forEach(n=>{
    for(let c=1;c<=n.chapterCount;c++){
      chapters.push({
        id:n.id+'-c'+c,
        novelId:n.id,
        number:c,
        title:'فصل '+c+' — ' + ['شروع یک اتفاق عجیب','ملاقات','راز پنهان','طوفان پیش‌رو','بازگشت','نقطه‌ی پایان'][c%6],
        content: Array.from({length:6}).map((_,p)=>'این بخشی از متن فصل «'+c+'» رمان «'+n.title+'» است. نثر داستان به‌گونه‌ای نوشته شده که خواننده را در فضای داستان همراه کند و او را تا انتهای فصل با خود ببرد. شخصیت‌ها در این بخش با چالش‌های تازه‌ای روبه‌رو می‌شوند که مسیر داستان را دگرگون می‌کند.').join('\n\n'),
        published: new Date(Date.now() - (n.chapterCount-c)*86400000*3).toISOString()
      });
    }
  });

  localStorage.setItem(DB_KEYS.AUTHORS, JSON.stringify(authors));
  localStorage.setItem(DB_KEYS.NOVELS, JSON.stringify(novels));
  localStorage.setItem(DB_KEYS.CHAPTERS, JSON.stringify(chapters));
  localStorage.setItem(DB_KEYS.COMMENTS, JSON.stringify([
    {id:'cm1', novelId:'n1', userId:'demo', userName:'الهام رستمی', avatar:'https://i.pravatar.cc/100?img=25', text:'عالی بود! منتظر فصل بعدی هستم.', date:new Date(Date.now()-86400000).toISOString(), likes:12, parentId:null},
    {id:'cm2', novelId:'n1', userId:'demo', userName:'حسین طاهری', avatar:'https://i.pravatar.cc/100?img=8', text:'نویسنده خیلی قشنگ فضاسازی کرده.', date:new Date(Date.now()-3600000*5).toISOString(), likes:4, parentId:null}
  ]));
  localStorage.setItem(DB_KEYS.NOTIFS, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.SEEDED, '1');
}

/* ---------------- Generic repo helpers ---------------- */
const Repo = {
  _get(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } },
  _set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },

  novels(){ return this._get(DB_KEYS.NOVELS); },
  saveNovels(list){ this._set(DB_KEYS.NOVELS, list); },
  novelById(id){ return this.novels().find(n=>n.id===id); },

  authors(){ return this._get(DB_KEYS.AUTHORS); },
  authorById(id){ return this.authors().find(a=>a.id===id); },

  chapters(novelId){ return this._get(DB_KEYS.CHAPTERS).filter(c=>c.novelId===novelId).sort((a,b)=>a.number-b.number); },
  allChapters(){ return this._get(DB_KEYS.CHAPTERS); },
  saveChapters(list){ this._set(DB_KEYS.CHAPTERS, list); },

  comments(novelId){ return this._get(DB_KEYS.COMMENTS).filter(c=>c.novelId===novelId); },
  saveComments(list){ this._set(DB_KEYS.COMMENTS, list); },

  bookmarks(){ return this._get(DB_KEYS.BOOKMARKS); },
  saveBookmarks(list){ this._set(DB_KEYS.BOOKMARKS, list); },

  likes(){ return this._get(DB_KEYS.LIKES); },
  saveLikes(list){ this._set(DB_KEYS.LIKES, list); },
  dislikes(){ return this._get(DB_KEYS.DISLIKES); },
  saveDislikes(list){ this._set(DB_KEYS.DISLIKES, list); },

  notifications(){ return this._get(DB_KEYS.NOTIFS); },
  saveNotifications(list){ this._set(DB_KEYS.NOTIFS, list); },

  users(){ return this._get(DB_KEYS.USERS); },
  saveUsers(list){ this._set(DB_KEYS.USERS, list); }
};

seedDatabase();
