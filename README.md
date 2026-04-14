# Invoicaty — منصة إدارة الفواتير

منصة إدارة فواتير احترافية. أنشئ، عدّل، واطبع فواتيرك بضغطة زر.

## التقنيات
- **Next.js 14** + TypeScript
- **Tailwind CSS 3**
- **Supabase** (Auth + PostgreSQL)
- **Vercel** للاستضافة

## الإعداد

### 1. إنشاء مشروع Supabase
اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروع جديد.

### 2. إعداد قاعدة البيانات
شغّل الأمر SQL الموجود في `supabase-schema.sql` في SQL Editor.

### 3. متغيرات البيئة
```bash
cp .env.local.example .env.local
# أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. التشغيل
```bash
npm install
npm run dev
```

## النشر على Vercel
1. اربط الـ repo بـ Vercel
2. أضف متغيرات البيئة في Settings → Environment Variables
3. انشر!
