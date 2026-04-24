# Invoicaty — Changelog

> التحديثات من **23 أبريل 2026** إلى **24 أبريل 2026**
> المستودع: [TheSn3s/invoicaty](https://github.com/TheSn3s/invoicaty)

---

## 🗓️ 2026-04-24 — Professional Polish Day

### 🎨 Invoice Templates (جديد كلياً)
اختيار شكل الفاتورة من 3 قوالب احترافية — **الميزة الأكبر في هذا اليوم.**

- **Modern** (افتراضي) — شريط جانبي بلون العلامة، شعار يسار، رقم ضخم يمين، مجموع في كبسولة ملوّنة. خط Inter نظيف.
- **Classic** — Layout مُمَوْسَط بخطوط فاصلة، عنوان Serif فاخر (Playfair Display)، ألوان أحادية مع لمسة لون للمجموع، signature block.
- **Minimal** — شعار صغير، رقم فاتورة بحجم 56px مع خط ملون رفيع تحته، أبيض/أسود تقريباً، whitespace كثير.

**تبويب "Template" في Settings:**
- Thumbnails مصغّرة (CSS خالص) لكل قالب — تتلوّن تلقائياً بحسب Brand Color
- زر **🔍 Live Preview** يفتح فاتورة تجريبية بالقالب المختار + بياناتك الحقيقية
- حفظ فوري في DB عند الاختيار (fallback محلي لو لم يُضف العمود)
- إعادة هيكلة `print-invoice.ts` إلى modules منفصلة تحت `src/lib/print-templates/`
- ملف Migration: `supabase-invoice-template-migration.sql`

---

### 🖼️ Logo Management
- **Onboarding:** إصلاح التعليق الأبدي عند رفع الشعار — timeout 15 ثانية + رسائل خطأ مفصّلة (صلاحيات، شبكة، نوع ملف، حجم).
- **Settings:** كارد جديد لإدارة الشعار في تبويب Profile — معاينة فورية + زر **تغيير** + زر **حذف** (يحذف من Storage + DB).

---

### 🏗️ Architecture & UX Improvements

| الميزة | الوصف |
|--------|-------|
| **Multi-line items** | إضافة عدة خدمات/منتجات في فاتورة واحدة (مع qty × unit_price لكل سطر) + حفظ السطور عند تحويل Quotation → Invoice |
| **Create Menu** | قائمة موحّدة "جديد" تفتح خيارات Invoice + Quotation (بديل الزرين المنفصلين). خلفية صلبة لسهولة القراءة |
| **Unified Footer** | Footer ثابت في كل الصفحات مع Developer Info (اسم، سنة، روابط تواصل) |
| **Data Tab** | تبويب جديد في Settings: Export CSV، Backup JSON، Import — منقول من Dashboard header |
| **Contact Support** | روابط دعم موحّدة عبر التطبيق |
| **Security Tab** | فصل Change Password في تبويب مستقل بجانب Profile |

---

### 🎨 UI Polish & Bug Fixes

- **Settings tabs:** إزالة الـ horizontal scrollbar — كل التبويبات الـ5 تتسع في صف واحد
- **Mobile FAB (+):** إصلاح زر الإضافة في Dashboard — القائمة تفتح بشكل صحيح الآن
- **Mobile typography:** إصلاح خط الـ hero title + fallback للخطوط + line-height عربي أفضل
- **Home page:** تحسين spacing بين الـ header والعنوان على الموبايل + 2-line title + وصف أقصر
- **Quotations:** زر "طباعة/PDF" بارز مع SVG icon بدل الـ emoji

---

## 🗓️ 2026-04-23 — Foundation Day

### 🌍 i18n + Multi-Currency (الإنجاز الأكبر)
النظام بالكامل أصبح ثنائي اللغة + عالمي.

- **194 دولة سيادية** + **157 عملة نشطة** مع معدلات ضريبة افتراضية
- **3 Batches i18n:**
  - Batch 1: infrastructure (types، currency helpers، profile hook)
  - Batch 2: translations + Provider + Language Switcher
  - Batch 3: تفعيل i18n في كل الصفحات والمكونات + تبويب Region في Settings
- **اللغة الأساسية:** الإنجليزية (مع دعم كامل للعربية + RTL)
- **Currency fallback:** يتبع لغة UI + العملات العربية تظهر رمزها في AR و ISO code في EN
- **Database migration v2:** إضافة `country_code`, `default_currency`, `tax_rate`, `preferred_language`, `business_type`

---

### 🧙 Onboarding Wizard (3 خطوات)
- Step 1: Country + Business Type (2-column grid على الموبايل)
- Step 2: Business Info (name, phone, email, bank details)
- Step 3: Logo upload + Brand Color + Preview
- نص مُرَكَّز، أيقونات مُرَكَّزة، copy محسّن
- إصلاح Supabase logo upload bug

---

### 🧾 Invoices — Tax & Discount
- **Batch 4:** إضافة حقلَي Tax Rate + Discount في UI (إنشاء + تعديل)
- PDF محسّن يعرض: Subtotal / Discount / Tax / Total
- إخفاء حقل Tax تلقائياً للدول ذات ضريبة 0%

---

### 📋 Quotations System (جديد كلياً)
- **Batch 5:** نظام عروض أسعار مستقل مع صفحة مخصصة
- Serial numbers منفصلة (Q-001 بدل INV-001)
- حقل "Valid Until" (تاريخ انتهاء الصلاحية)
- تحويل Quotation → Invoice بضغطة واحدة
- PDF مخصص لعروض الأسعار

---

### 🔐 Security
- إصلاح Password Recovery flow + middleware guard
- Email-based reset password link صحيح

---

## 📊 الإحصائيات

| المقياس | القيمة |
|---------|-------|
| **عدد Commits** | 43 |
| **اللغات المدعومة** | 2 (EN + AR) |
| **الدول** | 194 |
| **العملات** | 157 |
| **قوالب الفاتورة** | 3 |
| **الصفحات الرئيسية** | Home, Dashboard, Settings, Onboarding, Login, Register, Reset Password, Update Password, Quotations |

---

## 🚀 الخطوة التالية المقترحة

- ⏳ تشغيل `supabase-invoice-template-migration.sql` في Supabase لحفظ تفضيل القالب بشكل دائم
- 💡 اختبار القوالب الجديدة على فواتير حقيقية
- 🎨 إضافة قوالب إضافية لاحقاً (Corporate, Receipt, Statement) عند الطلب

---

*Generated 2026-04-24 · Invoicaty by Atef*
