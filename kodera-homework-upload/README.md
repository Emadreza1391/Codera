# سیستم جداگانه ارسال تکالیف کُدرا

این پروژه مستقل از سایت اصلی کُدرا است.

## ساختار

- `frontend/` صفحه‌ای که لینک آن را به دانشجویان می‌دهی.
- `worker/worker.js` API امن برای دریافت فایل و ذخیره آن در GitHub.
- فایل‌های ارسالی داخل Repository در پوشه `homework/` قرار می‌گیرند.

## راه‌اندازی

### 1. ساخت Repository

یک Repository جدا برای تکالیف بساز؛ مثلاً:

`kodera-homework`

### 2. ساخت GitHub Token

یک Fine-grained Personal Access Token بساز که فقط به همان Repository دسترسی داشته باشد و برای Contents حداقل مجوز لازم را داشته باشد.

**توکن را هرگز داخل frontend قرار نده.**

### 3. Deploy کردن Worker

فایل `worker/worker.js` را به عنوان Cloudflare Worker Deploy کن.

بعد این Secretها را روی Worker قرار بده:

```text
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
```

مقادیر نمونه:

```text
GITHUB_OWNER = نام کاربری GitHub تو
GITHUB_REPO  = kodera-homework
```

### 4. اتصال صفحه

بعد از Deploy، آدرس Worker را در:

`frontend/config.js`

قرار بده:

```js
const API_URL = "https://YOUR-WORKER.workers.dev";
```

### 5. انتشار صفحه

پوشه `frontend` را می‌توانی در یک Repository جدا روی GitHub Pages منتشر کنی.

مثلاً:

```text
https://USERNAME.github.io/kodera-homework-form/
```

این لینک را می‌توانی فقط خودت داشته باشی یا فقط به دانشجویان موردنظر بدهی.

## فایل‌ها کجا می‌آیند؟

بعد از ارسال:

```text
kodera-homework/
└── homework/
    ├── دوره-پایتون/
    │   ├── تاریخ_نام-دانشجو_تکلیف.pdf
    │   └── تاریخ_نام-دانشجو_تکلیف.pdf.json
    └── دوره-html/
        └── ...
```

## محدودیت‌ها

- حداکثر حجم هر فایل: 10MB
- PDF، ZIP، RAR، Word، PowerPoint، JPG، PNG و TXT
- اطلاعات دانشجو در کنار فایل به صورت JSON ذخیره می‌شود.

برای استفاده عمومی‌تر، در آینده بهتر است CAPTCHA/Cloudflare Turnstile و محدودیت تعداد درخواست هم اضافه شود.
