/**
 * data.js
 * ---------------------------------------------------------------
 * داده‌های نمایشی (Seed Data) پلتفرم «شب‌نامه».
 * این فایل فقط «داده اولیه» را تعریف می‌کند. در اولین اجرا، لایه‌ی
 * داده (app.js) این اطلاعات را در localStorage کپی می‌کند و از آن به بعد
 * همه‌ی تغییرات روی نسخه‌ی ذخیره‌شده انجام می‌شود.
 * وقتی Backend واقعی آماده شد، این فایل فقط برای Seed کردن دیتابیس
 * یا تست‌ها کاربرد خواهد داشت.
 * ---------------------------------------------------------------
 */
(function () {
  'use strict';

  /** ژانرها (دسته‌بندی‌ها) */
  const genres = [
    { slug: 'romance', name: 'عاشقانه', desc: 'داستان‌هایی از دل‌بستگی، انتظار و عشق', colors: ['#5b1830', '#1a0b14'] },
    { slug: 'drama', name: 'درام', desc: 'روایت‌های عمیق از انتخاب‌ها و پیامدها', colors: ['#3d2a55', '#120d1a'] },
    { slug: 'sad', name: 'غمگین', desc: 'قصه‌هایی که بعد از بستن کتاب هم می‌مانند', colors: ['#27344a', '#0c1018'] },
    { slug: 'social', name: 'اجتماعی', desc: 'آینه‌ای از جامعه و آدم‌هایش', colors: ['#4a3b22', '#15110a'] },
    { slug: 'fantasy', name: 'فانتزی', desc: 'جهان‌های جادویی و موجودات افسانه‌ای', colors: ['#2f2468', '#0e0b20'] },
    { slug: 'crime', name: 'جنایی', desc: 'پرونده‌ها، کارآگاه‌ها و حقیقت‌های تاریک', colors: ['#4d1414', '#140606'] },
    { slug: 'mystery', name: 'معمایی', desc: 'رازهایی که باید کشف شوند', colors: ['#1f3a3a', '#081212'] },
    { slug: 'horror', name: 'ترسناک', desc: 'برای شب‌هایی که چراغ روشن می‌ماند', colors: ['#2a1010', '#050303'] },
    { slug: 'thriller', name: 'هیجانی', desc: 'نفس‌گیر، سریع و غیرقابل پیش‌بینی', colors: ['#5a2a12', '#170a04'] },
    { slug: 'scifi', name: 'علمی تخیلی', desc: 'آینده، فضا و فناوری', colors: ['#13365a', '#050d18'] },
    { slug: 'historical', name: 'تاریخی', desc: 'سفر به روزگاران دور', colors: ['#5a4618', '#171106'] },
    { slug: 'comedy', name: 'طنز', desc: 'لبخند میان سطرها', colors: ['#56501a', '#161407'] },
    { slug: 'motivational', name: 'انگیزشی', desc: 'قصه‌هایی برای دوباره برخاستن', colors: ['#1d4a36', '#07140e'] },
    { slug: 'adventure', name: 'ماجراجویی', desc: 'سفر، کشف و خطر', colors: ['#1c4450', '#061216'] },
    { slug: 'teen', name: 'نوجوان', desc: 'دنیای پرشور نوجوانی', colors: ['#4a2458', '#140a18'] },
    { slug: 'adult', name: 'بزرگسال / +18', desc: 'مخصوص خوانندگان بزرگسال', colors: ['#3a0d1c', '#0c0307'], adult: true }
  ];

  /**
   * کاربران نمایشی. رمزها فقط برای دمو هستند و در app.js هش ساده می‌شوند.
   * حساب نمایشی اصلی: demo@novel.ir / demo1234
   */
  const users = [
    { id: 'u1', username: 'sara_mehr', displayName: 'سارا مهرآیین', email: 'demo@novel.ir', password: 'demo1234', bio: 'نویسنده‌ی رمان‌های عاشقانه و درام. معتقدم هر شب، قصه‌ای برای گفتن دارد.', followersBase: 12840, followingBase: 86, color: '#7b4fa8', createdAt: '2025-03-12T10:00:00Z' },
    { id: 'u2', username: 'arash_nik', displayName: 'آرش نیک‌نام', email: 'arash@novel.ir', password: 'demo1234', bio: 'طنزنویس و عاشق قهوه. از آدم‌های معمولی قصه‌های غیرمعمولی می‌سازم.', followersBase: 6310, followingBase: 140, color: '#b8893a', createdAt: '2025-05-02T10:00:00Z' },
    { id: 'u3', username: 'niloufar_azar', displayName: 'نیلوفر آذر', email: 'niloufar@novel.ir', password: 'demo1234', bio: 'معما، خانه‌های قدیمی و رازهای خانوادگی.', followersBase: 9420, followingBase: 52, color: '#2f7a7a', createdAt: '2025-01-20T10:00:00Z' },
    { id: 'u4', username: 'kaveh_rostami', displayName: 'کاوه رستمی', email: 'kaveh@novel.ir', password: 'demo1234', bio: 'تاریخ را دوست دارم و پرونده‌های جنایی را بیشتر.', followersBase: 7770, followingBase: 33, color: '#8e2436', createdAt: '2025-02-08T10:00:00Z' },
    { id: 'u5', username: 'mahsa_tehrani', displayName: 'مهسا تهرانی', email: 'mahsa@novel.ir', password: 'demo1234', bio: 'فانتزی و ماجراجویی؛ و گاهی نقاشی برای قصه‌هایم.', followersBase: 10230, followingBase: 210, color: '#4f5fb0', createdAt: '2025-04-15T10:00:00Z' },
    { id: 'u6', username: 'behrad_shayan', displayName: 'بهراد شایان', email: 'behrad@novel.ir', password: 'demo1234', bio: 'آینده‌ای که هنوز نیامده را می‌نویسم.', followersBase: 5120, followingBase: 71, color: '#2b6aa8', createdAt: '2025-06-01T10:00:00Z' },
    { id: 'u7', username: 'reader', displayName: 'خواننده‌ی نمایشی', email: 'reader@novel.ir', password: 'reader1234', bio: 'فقط می‌خوانم… فعلاً!', followersBase: 3, followingBase: 12, color: '#6d6a75', createdAt: '2026-01-10T10:00:00Z' }
  ];

  /** رمان‌های نمایشی */
  const novels = [
    { id: 'n1', title: 'شب‌های بی‌ماه', authorId: 'u1', genres: ['romance', 'drama'], status: 'ongoing', ageRating: '16', contentType: 'text', motif: 'moon', palette: ['#4a1330', '#120812'], views: 48210, likes: 3120, dislikes: 41, rating: 4.8, tags: ['عشق', 'تهران', 'انتظار'], summary: 'دختری که هر شب منتظر نامه‌ای است که هرگز نمی‌رسد؛ تا شبی که ماه ناپدید می‌شود.', description: 'ترانه سال‌هاست در خانه‌ای قدیمی در شمال تهران زندگی می‌کند و هر شب پشت پنجره منتظر می‌ماند. شبی که ماه در آسمان نیست، غریبه‌ای در می‌زند و نامه‌ای می‌آورد که دست‌خط آشنایی دارد. «شب‌های بی‌ماه» روایت عشقی است که میان گذشته و حال گیر افتاده و رازهایی که یک خانواده سال‌ها پنهان کرده است.', createdAt: '2026-02-10T18:00:00Z', updatedAt: '2026-09-26T18:00:00Z' },
    { id: 'n2', title: 'خانه‌ای در انتهای کوچه‌ی بید', authorId: 'u3', genres: ['mystery', 'horror'], status: 'completed', ageRating: '16', contentType: 'text', motif: 'house', palette: ['#15302e', '#040a0a'], views: 39150, likes: 2840, dislikes: 66, rating: 4.7, tags: ['خانه‌ی قدیمی', 'راز خانوادگی'], summary: 'ارثیه‌ای که هیچ‌کس نمی‌خواست و خانه‌ای که هیچ‌وقت خالی نبود.', description: 'بعد از مرگ مادربزرگ، نازنین کلید خانه‌ای را به ارث می‌برد که خانواده سال‌ها از آن حرف نمی‌زد. در انتهای کوچه‌ای باریک، میان درختان بید، خانه‌ای ایستاده که دیوارهایش چیزهایی را به خاطر دارند که آدم‌ها فراموش کرده‌اند.', createdAt: '2025-11-02T18:00:00Z', updatedAt: '2026-05-14T18:00:00Z' },
    { id: 'n3', title: 'سایه‌های اصفهان', authorId: 'u4', genres: ['historical', 'adventure'], status: 'ongoing', ageRating: 'all', contentType: 'text', motif: 'dome', palette: ['#4d3a12', '#120d04'], views: 27400, likes: 1960, dislikes: 22, rating: 4.6, tags: ['صفوی', 'نقشه‌ی گنج'], summary: 'اصفهان عصر صفوی، یک نقشه‌ی گمشده و شاگرد جوانی که بیش از حد می‌داند.', description: 'میرزا یحیی، شاگرد کاشی‌کاری در میدان نقش جهان، روی یکی از کاشی‌ها نشانه‌ای می‌بیند که نباید می‌دید. از آن لحظه، سایه‌هایی در کوچه‌های اصفهان دنبالش می‌کنند و او باید پیش از آن‌که دیر شود، راز نقشه را کشف کند.', createdAt: '2026-04-01T18:00:00Z', updatedAt: '2026-09-20T18:00:00Z' },
    { id: 'n4', title: 'نامه‌هایی که نرسید', authorId: 'u1', genres: ['sad', 'romance'], status: 'completed', ageRating: '13', contentType: 'text', motif: 'letter', palette: ['#2a3550', '#0b0e18'], views: 52300, likes: 4210, dislikes: 38, rating: 4.9, tags: ['نامه', 'جنگ', 'انتظار'], summary: 'صد و دوازده نامه که در صندوقچه‌ای چوبی ماند و هیچ‌وقت به مقصد نرسید.', description: 'مهتاب در زیرزمین خانه‌ی پدری، صندوقچه‌ای پر از نامه پیدا می‌کند؛ نامه‌هایی که پدربزرگش در سال‌های جنگ برای زنی نوشته بود که هرگز آن‌ها را نخواند. او تصمیم می‌گیرد نامه‌ها را به صاحبش برساند، حتی اگر چهل سال دیر شده باشد.', createdAt: '2025-08-22T18:00:00Z', updatedAt: '2026-01-30T18:00:00Z' },
    { id: 'n5', title: 'کد صفر', authorId: 'u6', genres: ['scifi', 'thriller'], status: 'ongoing', ageRating: '13', contentType: 'text', motif: 'circuit', palette: ['#0f3354', '#030a14'], views: 21880, likes: 1540, dislikes: 57, rating: 4.4, tags: ['هوش مصنوعی', 'آینده'], summary: 'تهران ۱۴۵۰؛ هوش مصنوعی شهر یک پیام عجیب برای یک برنامه‌نویس جوان می‌فرستد.', description: 'در تهرانی که همه‌چیزش را یک هوش مصنوعی مرکزی اداره می‌کند، رها پیامی دریافت می‌کند که فقط یک خط دارد: «کد صفر را پیدا کن». حالا او و دوستانش باید پیش از خاموشی بزرگ، راز آن را کشف کنند.', createdAt: '2026-06-18T18:00:00Z', updatedAt: '2026-09-27T18:00:00Z' },
    { id: 'n6', title: 'قهوه‌خانه‌ی خیابان منوچهری', authorId: 'u2', genres: ['comedy', 'social'], status: 'completed', ageRating: 'all', contentType: 'text', motif: 'cup', palette: ['#4a3a1a', '#120e06'], views: 18760, likes: 1720, dislikes: 19, rating: 4.5, tags: ['طنز', 'تهران قدیم'], summary: 'یک قهوه‌خانه، هفت مشتری همیشگی و صاحب‌کاری که هیچ‌وقت چای را به موقع نمی‌آورد.', description: 'آقا مرتضی قهوه‌خانه‌ای کوچک در خیابان منوچهری دارد که پاتوق عجیب‌ترین آدم‌های شهر است. وقتی شهرداری تصمیم می‌گیرد قهوه‌خانه را تعطیل کند، مشتری‌ها نقشه‌ای می‌کشند که فقط از خودشان برمی‌آید.', createdAt: '2025-10-05T18:00:00Z', updatedAt: '2026-03-01T18:00:00Z' },
    { id: 'n7', title: 'پرونده‌ی شماره‌ی هفت', authorId: 'u4', genres: ['crime', 'mystery'], status: 'ongoing', ageRating: '16', contentType: 'text', motif: 'file', palette: ['#4a1111', '#110404'], views: 33620, likes: 2380, dislikes: 71, rating: 4.6, tags: ['کارآگاه', 'قتل'], summary: 'شش پرونده حل شده بود. پرونده‌ی هفتم، کارآگاه را حل کرد.', description: 'سرگرد فرهادی سال‌ها پیش بازنشسته شده، اما وقتی بسته‌ای بی‌نام با شماره‌ی هفت به دستش می‌رسد، می‌فهمد پرونده‌ای که فکر می‌کرد بسته شده، هنوز باز است. قاتل برگشته و این بار بازی را از خود او شروع کرده است.', createdAt: '2026-03-15T18:00:00Z', updatedAt: '2026-09-24T18:00:00Z' },
    { id: 'n8', title: 'دختری که با باد رفت', authorId: 'u5', genres: ['fantasy', 'adventure'], status: 'ongoing', ageRating: '13', contentType: 'mixed', motif: 'wind', palette: ['#2a2366', '#0a0820'], views: 29940, likes: 2650, dislikes: 30, rating: 4.7, tags: ['جادو', 'رمان تصویری', 'سفر'], summary: 'رمانی مصور درباره‌ی دختری که می‌تواند صدای باد را بشنود.', description: 'آوا در دهکده‌ای کوهستانی زندگی می‌کند و تنها کسی است که صدای باد را می‌فهمد. وقتی بادها از خاموشی سرزمین خبر می‌دهند، او سفری را آغاز می‌کند که او را تا لبه‌ی دنیا می‌برد. این رمان با تصویرسازی‌های نویسنده همراه است.', createdAt: '2026-05-05T18:00:00Z', updatedAt: '2026-09-28T09:00:00Z' },
    { id: 'n9', title: 'بلندتر از کوه', authorId: 'u2', genres: ['motivational', 'drama'], status: 'completed', ageRating: 'all', contentType: 'text', motif: 'mountain', palette: ['#173f30', '#05110c'], views: 15200, likes: 1310, dislikes: 12, rating: 4.5, tags: ['امید', 'کوهنوردی'], summary: 'پسری که هیچ‌وقت کوه ندیده بود، تصمیم می‌گیرد به قله‌ی دماوند برسد.', description: 'امید بعد از یک تصادف، پزشکان را ناامید کرده اما خودش را نه. او تصمیم گرفته به قله‌ای برسد که پدرش هرگز نتوانست. قصه‌ای درباره‌ی اراده، خانواده و قدم‌های کوچکی که کوه را جابه‌جا می‌کنند.', createdAt: '2025-09-10T18:00:00Z', updatedAt: '2026-02-11T18:00:00Z' },
    { id: 'n10', title: 'مدرسه‌ی نیمه‌شب', authorId: 'u5', genres: ['teen', 'fantasy'], status: 'ongoing', ageRating: '13', contentType: 'text', motif: 'moon', palette: ['#3d1f55', '#0e0716'], views: 24100, likes: 2210, dislikes: 44, rating: 4.5, tags: ['مدرسه', 'جادو', 'دوستی'], summary: 'مدرسه‌ای که فقط بعد از نیمه‌شب درهایش را باز می‌کند.', description: 'نیما یک شب دعوت‌نامه‌ای پیدا می‌کند که او را به مدرسه‌ای مخفی فرا می‌خواند؛ جایی که درس‌هایش در هیچ کتابی نیست. اما هر مدرسه‌ای قانونی دارد و قانون این مدرسه ساده است: قبل از طلوع برگرد.', createdAt: '2026-07-01T18:00:00Z', updatedAt: '2026-09-25T18:00:00Z' },
    { id: 'n11', title: 'زخم‌های پنهان', authorId: 'u3', genres: ['social', 'drama'], status: 'completed', ageRating: '16', contentType: 'text', motif: 'wave', palette: ['#3a2a44', '#0e0a12'], views: 19870, likes: 1590, dislikes: 27, rating: 4.6, tags: ['خانواده', 'رهایی'], summary: 'سه خواهر، یک خانه و سکوتی که بیست سال طول کشید.', description: 'وقتی پدر خانواده بیمار می‌شود، سه خواهر بعد از سال‌ها دوری دوباره زیر یک سقف جمع می‌شوند. هر کدام زخمی پنهان دارد و این بار، سکوت دیگر جواب نمی‌دهد.', createdAt: '2025-12-12T18:00:00Z', updatedAt: '2026-06-02T18:00:00Z' },
    { id: 'n12', title: 'شعله و خاکستر', authorId: 'u6', genres: ['adult', 'romance', 'drama'], status: 'ongoing', ageRating: '18', adult: true, contentType: 'text', motif: 'flame', palette: ['#5a1414', '#140404'], views: 14320, likes: 1180, dislikes: 49, rating: 4.3, tags: ['بزرگسال', 'درام عاشقانه'], summary: 'درامی تند و بی‌پرده درباره‌ی رابطه‌ای که هر دو را می‌سوزاند.', description: 'روایتی بزرگسالانه از دو آدم زخم‌خورده که در بدترین زمان ممکن به هم می‌رسند. این اثر شامل مضامین و موقعیت‌های مناسب خوانندگان بالای ۱۸ سال است.', createdAt: '2026-08-02T18:00:00Z', updatedAt: '2026-09-22T18:00:00Z' },
    { id: 'n13', title: 'آخرین قطار به تبریز', authorId: 'u1', genres: ['thriller', 'historical'], status: 'ongoing', ageRating: 'all', contentType: 'text', motif: 'train', palette: ['#3a2c1a', '#0e0a06'], views: 12650, likes: 980, dislikes: 14, rating: 4.4, tags: ['قطار', 'دهه‌ی بیست'], summary: 'زمستان ۱۳۲۴، قطاری که هیچ‌وقت به مقصد نرسید.', description: 'در زمستان سرد ۱۳۲۴، مسافران آخرین قطار تهران به تبریز در میانه‌ی راه در برف گرفتار می‌شوند. وقتی یکی از مسافران ناپدید می‌شود، روزنامه‌نگاری جوان باید بفهمد چه کسی دروغ می‌گوید.', createdAt: '2026-08-20T18:00:00Z', updatedAt: '2026-09-28T18:00:00Z' },
    { id: 'n14', title: 'جزیره‌ی فراموشی', authorId: 'u5', genres: ['adventure', 'mystery'], status: 'completed', ageRating: 'all', contentType: 'text', motif: 'wave', palette: ['#123e4a', '#030f12'], views: 22400, likes: 1870, dislikes: 25, rating: 4.6, tags: ['جزیره', 'حافظه'], summary: 'پنج نفر در ساحل جزیره‌ای به هوش می‌آیند و هیچ‌کدام اسم خود را به یاد ندارند.', description: 'کشتی‌ای غرق شده، پنج غریبه در ساحلی ناشناخته و جزیره‌ای که انگار حافظه‌ی آدم‌ها را می‌بلعد. آن‌ها باید پیش از آن‌که همه‌چیز را فراموش کنند، راه فرار را پیدا کنند.', createdAt: '2025-07-14T18:00:00Z', updatedAt: '2025-12-20T18:00:00Z' }
  ];

  /** بندهای ادبی برای ساخت متن فصل‌های نمایشی */
  const paragraphs = [
    'باران از نیمه‌شب شروع شده بود و هنوز بند نیامده بود. قطره‌ها با ریتمی آرام به شیشه‌ی پنجره می‌خوردند، انگار کسی از آن سوی تاریکی می‌خواست چیزی را به یادش بیاورد که سال‌ها پیش فراموش کرده بود.',
    'کوچه خلوت بود. چراغ‌های زردرنگ تیر برق، سایه‌های بلندی روی سنگفرش خیس می‌انداختند و صدای قدم‌هایش در سکوت شب چند برابر شنیده می‌شد. برای لحظه‌ای ایستاد و به پشت سر نگاه کرد؛ هیچ‌کس نبود، اما حس می‌کرد تنها نیست.',
    '«تو هنوز هم همان‌قدر لجبازی که بودی.» صدایش آرام بود، اما در همان آرامش چیزی می‌لرزید. سرش را بالا آورد و برای اولین بار بعد از آن همه سال، مستقیم در چشم‌هایش نگاه کرد.',
    'خانه بوی کتاب‌های کهنه و چای تازه‌دم می‌داد. قفسه‌ها تا سقف بالا رفته بودند و روی هر کدام، ردیفی از جلدهای رنگ‌ورورفته کنار هم ایستاده بودند؛ مثل شاهدانی خاموش که همه‌چیز را دیده بودند و چیزی نمی‌گفتند.',
    'نامه را چند بار خواند. خط‌ها کج بودند و جوهر در بعضی جاها پخش شده بود، انگار نویسنده‌اش هنگام نوشتن گریه کرده باشد. در پایان فقط یک جمله نوشته شده بود: «اگر روزی برگشتی، در باغ را باز بگذار.»',
    'آن شب هیچ‌کدام نخوابیدند. تا صبح کنار پنجره نشستند و از روزهایی گفتند که گذشته بود؛ از آدم‌هایی که رفته بودند و قول‌هایی که هیچ‌وقت عملی نشد. وقتی آسمان رنگ گرفت، چیزی میانشان عوض شده بود.',
    'شهر از بالای تپه شبیه دریایی از نور بود. باد سردی می‌وزید و لبه‌ی شالش را به بازی گرفته بود. فکر کرد شاید همه‌ی جواب‌هایی که دنبالشان می‌گشت، همین‌جا، در همین سکوت پنهان شده باشند.',
    'در قدیمی با صدای جیرجیری طولانی باز شد. داخل اتاق تاریک بود و فقط باریکه‌ای از نور ماه از لای پرده‌ها به داخل می‌تابید. روی میز، دفترچه‌ای چرمی قرار داشت که اسم او با حروف طلایی روی جلدش حک شده بود.',
    '«هر آدمی رازی دارد که حاضر است برای حفظش هر کاری بکند.» پیرمرد این را گفت و به فنجان خالی‌اش خیره ماند. «سؤال این نیست که راز تو چیست؛ سؤال این است که تا کجا حاضری برای پنهان کردنش پیش بروی.»',
    'قلبش تندتر می‌زد. می‌دانست اگر همین حالا تصمیم نگیرد، فرصت دیگری نخواهد داشت. نفس عمیقی کشید، دستش را روی دستگیره گذاشت و برای اولین بار در زندگی‌اش، از ترس جلوتر رفت.',
    'صبح که شد، همه‌چیز عادی به نظر می‌رسید: صدای گنجشک‌ها، بوی نان تازه از نانوایی سر کوچه، و همهمه‌ی آدم‌هایی که با عجله به سر کار می‌رفتند. اما او می‌دانست که دیگر هیچ‌چیز مثل قبل نخواهد بود.',
    'چشم‌هایش را بست و به صدای دریا گوش داد. موج‌ها می‌آمدند و می‌رفتند، مثل خاطره‌هایی که هرچه تلاش می‌کرد فراموششان کند، دوباره با قدرت بیشتری برمی‌گشتند.',
    'روی دیوار، عکسی قدیمی آویزان بود؛ خانواده‌ای که کنار حوض آبی ایستاده بودند و به دوربین لبخند می‌زدند. اما در گوشه‌ی عکس، چهره‌ای دیده می‌شد که هیچ‌کس او را نمی‌شناخت.',
    '«فکر می‌کنی می‌شود از گذشته فرار کرد؟» پرسید. جوابی نشنید. فقط صدای تیک‌تاک ساعت دیواری بود که انگار با هر ضربه، ثانیه‌ای از فرصتشان را می‌بلعید.',
    'جاده پیچ می‌خورد و در مه گم می‌شد. چراغ‌های ماشین فقط چند متر جلوتر را روشن می‌کردند و باقی دنیا در سفیدی مطلقی فرو رفته بود. نمی‌دانست به کجا می‌رود، فقط می‌دانست که نمی‌تواند برگردد.',
    'آن لحظه فهمید که بعضی داستان‌ها پایان ندارند؛ فقط فصلی تمام می‌شود تا فصل دیگری آغاز شود. کتاب را بست، لبخند زد و چراغ را خاموش کرد.'
  ];

  const chapterTitles = [
    'شروع یک اتفاق عجیب', 'ملاقات', 'راز پنهان', 'نامه‌ی بی‌نشان', 'شبی که باران آمد', 'در آستانه‌ی تصمیم',
    'سایه‌ای پشت پنجره', 'بازگشت', 'حقیقت تلخ', 'پلی میان دو دنیا', 'آخرین فرصت', 'طلوع'
  ];

  /** تعداد فصل‌های منتشرشده‌ی هر رمان نمایشی */
  const chapterCounts = { n1: 8, n2: 12, n3: 6, n4: 10, n5: 5, n6: 9, n7: 7, n8: 5, n9: 8, n10: 6, n11: 10, n12: 4, n13: 3, n14: 11 };

  /** تصویرسازی ساده‌ی SVG برای رمان مصور نمایشی */
  function sceneSVG(seed) {
    const skies = [['#2a2366', '#c9a45c'], ['#10243f', '#7b4fa8'], ['#3a1030', '#e0a36a'], ['#0c2a2e', '#9fd0c8']];
    const [a, b] = skies[seed % skies.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="${560 - seed * 60}" cy="120" r="46" fill="#fff4d6" opacity=".85"/><path d="M0 330 L160 210 L290 300 L420 170 L560 290 L680 220 L800 300 L800 450 L0 450Z" fill="#0b0a14" opacity=".75"/><path d="M0 380 Q200 330 400 370 T800 360 L800 450 L0 450Z" fill="#07060c"/><path d="M90 150 Q220 110 330 150 T560 140" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/><path d="M140 190 Q260 160 380 190 T620 185" stroke="#fff" stroke-opacity=".2" stroke-width="2" fill="none"/></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /** ساخت فصل‌های نمایشی به صورت قطعی (Deterministic) */
  function buildChapters() {
    const list = [];
    novels.forEach((novel, ni) => {
      const count = chapterCounts[novel.id] || 5;
      const start = new Date(novel.createdAt).getTime();
      const end = new Date(novel.updatedAt).getTime();
      for (let c = 1; c <= count; c++) {
        const blocks = [];
        const size = 7 + ((ni + c) % 3);
        for (let p = 0; p < size; p++) {
          blocks.push({ type: 'text', text: paragraphs[(ni * 3 + c * 5 + p * 7) % paragraphs.length] });
        }
        // رمان مصور: هر فصل دو تصویر میان متن دارد
        if (novel.contentType !== 'text') {
          blocks.splice(2, 0, { type: 'image', src: sceneSVG(c), caption: 'تصویرسازی: ' + 'مهسا تهرانی' });
          blocks.splice(6, 0, { type: 'image', src: sceneSVG(c + 1), caption: 'باد از شمال می‌آمد…' });
        }
        const date = new Date(start + ((end - start) * (c - 1)) / Math.max(1, count - 1)).toISOString();
        list.push({
          id: `${novel.id}_c${c}`,
          novelId: novel.id,
          number: c,
          title: chapterTitles[(c - 1 + ni) % chapterTitles.length],
          blocks,
          status: 'published',
          createdAt: date,
          updatedAt: date,
          publishedAt: date
        });
      }
    });
    // فصل اول «شب‌های بی‌ماه» با عنوان‌های نمونه‌ی درخواستی
    ['شروع یک اتفاق عجیب', 'ملاقات', 'راز پنهان'].forEach((t, i) => {
      const ch = list.find((x) => x.id === `n1_c${i + 1}`);
      if (ch) ch.title = t;
    });
    // یک فصل پیش‌نویس برای نمایش بخش پیش‌نویس‌ها در داشبورد
    list.push({ id: 'n1_c9', novelId: 'n1', number: 9, title: 'ماه برمی‌گردد', blocks: [{ type: 'text', text: paragraphs[15] }], status: 'draft', createdAt: '2026-09-27T20:00:00Z', updatedAt: '2026-09-27T20:00:00Z', publishedAt: null });
    return list;
  }

  const comments = [
    { id: 'c1', novelId: 'n1', userId: 'u3', parentId: null, text: 'فصل سوم فوق‌العاده بود. توصیف باران و خانه آن‌قدر زنده بود که حس کردم خودم پشت آن پنجره نشسته‌ام.', likes: 42, createdAt: '2026-09-21T19:30:00Z' },
    { id: 'c2', novelId: 'n1', userId: 'u1', parentId: 'c1', text: 'ممنونم نیلوفر عزیز، این فصل را واقعاً با عشق نوشتم.', likes: 18, createdAt: '2026-09-21T21:02:00Z' },
    { id: 'c3', novelId: 'n1', userId: 'u5', parentId: null, text: 'کی فصل بعدی منتشر می‌شود؟ دیگر طاقت ندارم!', likes: 27, createdAt: '2026-09-25T08:15:00Z' },
    { id: 'c4', novelId: 'n1', userId: 'u2', parentId: null, text: 'پایان فصل هشتم را اصلاً انتظار نداشتم. آن نامه از طرف چه کسی بود؟', likes: 11, createdAt: '2026-09-27T12:40:00Z' },
    { id: 'c5', novelId: 'n4', userId: 'u4', parentId: null, text: 'یکی از بهترین رمان‌هایی که این سال‌ها خوانده‌ام. آخرش گریه کردم.', likes: 64, createdAt: '2026-02-03T17:00:00Z' },
    { id: 'c6', novelId: 'n7', userId: 'u1', parentId: null, text: 'فضای نوآر داستان عالی است. سرگرد فرهادی را دوست دارم.', likes: 19, createdAt: '2026-09-24T22:10:00Z' },
    { id: 'c7', novelId: 'n8', userId: 'u6', parentId: null, text: 'تصویرها حس داستان را چند برابر کرده‌اند. کار بی‌نظیری است.', likes: 33, createdAt: '2026-09-28T10:00:00Z' },
    { id: 'c8', novelId: 'n13', userId: 'u4', parentId: null, text: 'فضای دهه‌ی بیست را خیلی خوب درآورده‌اید. منتظر ادامه‌اش هستم.', likes: 7, createdAt: '2026-09-28T20:00:00Z' }
  ];

  const notifications = [
    { id: 'nt1', userId: 'u1', type: 'like', actorId: 'u3', novelId: 'n1', text: 'نیلوفر آذر رمان «شب‌های بی‌ماه» شما را لایک کرد.', read: false, createdAt: '2026-09-28T19:20:00Z' },
    { id: 'nt2', userId: 'u1', type: 'comment', actorId: 'u2', novelId: 'n1', text: 'آرش نیک‌نام روی رمان «شب‌های بی‌ماه» شما کامنت گذاشت.', read: false, createdAt: '2026-09-27T12:40:00Z' },
    { id: 'nt3', userId: 'u1', type: 'chapter', actorId: 'u5', novelId: 'n8', text: 'فصل جدید رمان مورد علاقه‌ی شما «دختری که با باد رفت» منتشر شد.', read: false, createdAt: '2026-09-28T09:00:00Z' },
    { id: 'nt4', userId: 'u1', type: 'follow', actorId: 'u4', novelId: null, text: 'کاوه رستمی شما را دنبال کرد.', read: true, createdAt: '2026-09-24T22:12:00Z' },
    { id: 'nt5', userId: 'u1', type: 'comment', actorId: 'u4', novelId: 'n13', text: 'کاوه رستمی روی رمان «آخرین قطار به تبریز» شما کامنت گذاشت.', read: true, createdAt: '2026-09-28T20:00:00Z' }
  ];

  const bookmarks = [
    { userId: 'u1', novelId: 'n8', createdAt: '2026-09-10T10:00:00Z' },
    { userId: 'u1', novelId: 'n2', createdAt: '2026-08-01T10:00:00Z' },
    { userId: 'u1', novelId: 'n7', createdAt: '2026-09-18T10:00:00Z' }
  ];

  const follows = [
    { followerId: 'u1', authorId: 'u5', createdAt: '2026-06-01T10:00:00Z' },
    { followerId: 'u1', authorId: 'u3', createdAt: '2026-05-01T10:00:00Z' }
  ];

  const activities = [
    { id: 'a1', userId: 'u1', type: 'chapter', novelId: 'n13', text: 'فصل ۳ رمان «آخرین قطار به تبریز» را منتشر کرد.', createdAt: '2026-09-28T18:00:00Z' },
    { id: 'a2', userId: 'u1', type: 'bookmark', novelId: 'n8', text: '«دختری که با باد رفت» را به علاقه‌مندی‌ها افزود.', createdAt: '2026-09-10T10:00:00Z' },
    { id: 'a3', userId: 'u1', type: 'comment', novelId: 'n7', text: 'روی «پرونده‌ی شماره‌ی هفت» نظر داد.', createdAt: '2026-09-24T22:10:00Z' }
  ];

  window.NR = window.NR || {};
  window.NR.seed = {
    version: '1.0.0',
    genres,
    users,
    novels,
    chapters: buildChapters(),
    comments,
    notifications,
    bookmarks,
    follows,
    activities
  };
})();
