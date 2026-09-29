# شب‌نامه | پلتفرم انتشار و مطالعه رمان (نسخه Front-End)

پروتوتایپ کامل و قابل استفاده با **HTML5 + CSS3 + JavaScript Vanilla**، بدون فریم‌ورک، بدون Backend. تمام داده‌ها با یک لایه‌ی سرویس (`NR.api`) در `localStorage` ذخیره می‌شوند و این لایه بعداً بدون تغییر UI با API واقعی جایگزین می‌شود.

## اجرا
فایل‌ها را روی یک سرور محلی اجرا کنید (باز کردن مستقیم با file:// هم کار می‌کند، اما سرور توصیه می‌شود):

```bash
cd project
python -m http.server 8080      # یا: npx serve .   یا افزونه‌ی Live Server در VS Code
```
سپس `http://localhost:8080` را باز کنید؛ `index.html` به `pages/home.html` هدایت می‌کند.

## حساب‌های دمو
| نقش | ایمیل | رمز |
|---|---|---|
| نویسنده (۳ رمان، پیش‌نویس، اعلان) | demo@novel.ir | demo1234 |
| خواننده (بدون رمان، حالت‌های خالی) | reader@novel.ir | reader1234 |

ورود با نام کاربری (`sara_mehr`) هم ممکن است. ثبت‌نام جدید هم کامل کار می‌کند.

## ساختار
```
project/
├── index.html            ریدایرکت به صفحه‌ی اصلی
├── .htaccess             صفحه‌ی 404 روی Apache
├── pages/                ۱۹ صفحه (home, categories, novel, reader, search, login, register,
│                         profile, favorites, dashboard, my-novels, create-novel, edit-novel,
│                         notifications, authors, about, contact, rules, 404)
├── css/
│   ├── style.css         توکن‌ها، تم تیره/روشن، لایه‌بندی، Header/Footer، کارت‌ها
│   ├── components.css    دکمه، فرم، Modal، Toast، Skeleton، Empty State، تب، آپلودر
│   ├── reader.css        تجربه‌ی مطالعه (فونت، عرض، تم سپیا، حالت تمرکز)
│   ├── dashboard.css     پنل نویسنده، فرم‌ها و ویرایشگر فصل
│   └── responsive.css    تبلت/موبایل، منوی همبرگری، Bottom Navigation
├── js/
│   ├── theme.js          تم (در head برای جلوگیری از چشمک)
│   ├── data.js           داده‌های دمو: ۱۶ ژانر، ۷ کاربر، ۱۴ رمان، فصل‌ها، نظرات، اعلان‌ها
│   ├── app.js            NR.config / utils / storage / db / api / http / boot
│   ├── ui.js             Header، Footer، Toast، Modal، Skeleton، کارت‌ها، آپلود تصویر
│   ├── auth.js           ورود، ثبت‌نام، خروج، گارد صفحات، Modal «ورود لازم است»
│   ├── favorites.js      علاقه‌مندی‌ها
│   ├── comments.js       نظرات، پاسخ، لایک و حذف نظر
│   ├── search.js         جستجوی Real-Time و فیلترها
│   ├── novels.js         خانه، دسته‌بندی، نویسندگان، جزئیات، ایجاد/ویرایش رمان، ویرایشگر فصل
│   ├── reader.js         صفحه‌ی مطالعه، تنظیمات، پیشرفت مطالعه، میانبرهای کیبورد
│   └── dashboard.js      داشبورد، رمان‌های من، پروفایل، اعلان‌ها
└── assets/ icons/ images/
```

## ذخیره‌سازی داده‌ها
| کلید | محتوا |
|---|---|
| `nr_db_users`, `nr_db_novels`, `nr_db_chapters`, `nr_db_comments`, `nr_db_reactions`, `nr_db_bookmarks`, `nr_db_follows`, `nr_db_notifications`, `nr_db_activities`, `nr_db_progress` | «جداول» دمو |
| `nr_session` | جلسه‌ی ورود (localStorage اگر «مرا به خاطر بسپار» فعال باشد، وگرنه sessionStorage) |
| `nr_theme` | تم سایت |
| `nr_reader` | تنظیمات مطالعه |
| `nr_dataVersion` | نسخه‌ی داده‌ی اولیه |
| sessionStorage: `nr_adult_ok`, `nr_viewed_*` | تأیید +۱۸ و شمارش بازدید |

بازنشانی: دکمه‌ی «بازنشانی داده‌های دمو» در Footer یا `NR.db.reset()` در کنسول.

## اتصال به Backend
همه‌ی صفحات فقط از `NR.api.*` استفاده می‌کنند و همه‌ی متدها Promise برمی‌گردانند. برای اتصال:
1. در `js/app.js` مقدار `NR.config.useRemoteApi = true` و `apiBaseUrl` را تنظیم کنید.
2. بدنه‌ی هر متد را با `NR.http` جایگزین کنید، مثلاً:
   ```js
   login: (body) => NR.http.post('/auth/login', body),
   list:  (f)    => NR.http.get('/novels', f),
   ```
3. پیشنهاد Endpointها:
   - `POST /auth/login`، `POST /auth/register`، `POST /auth/logout`، `GET /me`
   - `GET /novels?q=&genre=&status=&age=&sort=`، `GET/PUT/DELETE /novels/:id`، `POST /novels`
   - `POST /novels/:id/reaction` {type: like|dislike}
   - `GET/POST /novels/:id/chapters`، `PUT/DELETE /chapters/:id`
   - `GET/POST /novels/:id/comments`، `POST /comments/:id/like`، `DELETE /comments/:id`
   - `GET/POST/DELETE /bookmarks/:novelId`، `POST /users/:id/follow`
   - `GET /notifications`، `PATCH /notifications/:id`، `GET /dashboard/stats`
4. جداول پیشنهادی: users, novels, novel_genres, tags, chapters, chapter_blocks, comments, reactions, bookmarks, follows, notifications, reading_progress.
5. تصاویر فعلاً DataURL هستند؛ در نسخه‌ی واقعی با `multipart/form-data` به `/uploads` (یا S3/Object Storage) بفرستید و فقط URL را ذخیره کنید.
6. توکن JWT را در `NR.http` به هدر `Authorization` اضافه کنید و بررسی دسترسی (نویسنده‌ی رمان، +۱۸) را در سرور هم تکرار کنید.
