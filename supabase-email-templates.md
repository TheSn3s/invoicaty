# Invoicaty — Email Templates (Supabase Auth)

انسخ هذه القوالب إلى:
**Supabase Dashboard → Authentication → Email Templates**

## ✅ الفوائد

- 🎨 هوية بصرية احترافية (لون البراند، شعار، تنسيق)
- 🛡️ يقلل دخول الإيميلات للـSpam
- 📱 responsive على الجوال
- 🌐 يدعم العربية + الإنجليزية في نفس الإيميل
- 🔒 Call-to-action واضح بدل الرابط العاري

---

## 1️⃣ Confirm Signup (تأكيد التسجيل)

**Subject:** `Welcome to Invoicaty — Confirm your email ✨`

**HTML Body:**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your Invoicaty account</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.06);">

          <!-- Header with brand color -->
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Invoicaty</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;font-weight:500;">Professional Invoicing</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:700;line-height:1.3;">Welcome! 👋</h2>
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7;">
                Hi there,
              </p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">
                Thanks for signing up for Invoicaty. Please confirm your email address to activate your account and start creating professional invoices.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.2px;">
                      Confirm My Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;color:#3b82f6;font-size:12px;word-break:break-all;line-height:1.5;">
                {{ .ConfirmationURL }}
              </p>

              <!-- Arabic version -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
              <div dir="rtl" style="text-align:right;">
                <h3 style="margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:700;">مرحباً بك في Invoicaty 👋</h3>
                <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.8;">
                  شكراً لتسجيلك. فعّل حسابك بالضغط على الزر أعلاه لتبدأ في إنشاء فواتير احترافية.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;color:#64748b;font-size:12px;line-height:1.6;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">
                © 2026 Invoicaty. All rights reserved.<br>
                <a href="https://invoicaty.com" style="color:#3b82f6;text-decoration:none;">invoicaty.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2️⃣ Reset Password (إعادة تعيين كلمة المرور)

**Subject:** `Reset your Invoicaty password 🔐`

**HTML Body:**

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.06);">
<tr><td style="background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);padding:40px 40px 32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">Invoicaty</h1>
</td></tr>
<tr><td style="padding:40px;">
<h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:700;">Password Reset Request 🔐</h2>
<p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">
We received a request to reset the password for your Invoicaty account. Click the button below to choose a new password.
</p>
<table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:8px 0 24px;">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">Reset Password</a>
</td></tr></table>
<p style="margin:0 0 8px;color:#64748b;font-size:13px;">Or paste this into your browser:</p>
<p style="margin:0 0 24px;color:#3b82f6;font-size:12px;word-break:break-all;">{{ .ConfirmationURL }}</p>
<div style="background:#fef3c7;border-radius:8px;padding:16px;margin-top:24px;">
<p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
⚠️ This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.
</p>
</div>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
<div dir="rtl" style="text-align:right;">
<h3 style="margin:0 0 12px;color:#0f172a;font-size:18px;">طلب إعادة تعيين كلمة المرور 🔐</h3>
<p style="margin:0;color:#334155;font-size:14px;line-height:1.8;">
تلقينا طلباً لإعادة تعيين كلمة مرور حسابك. اضغط الزر أعلاه لاختيار كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة فقط.
</p>
</div>
</td></tr>
<tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 Invoicaty · <a href="https://invoicaty.com" style="color:#3b82f6;text-decoration:none;">invoicaty.com</a></p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>
```

---

## 3️⃣ Magic Link (تسجيل دخول بدون كلمة مرور)

**Subject:** `Your Invoicaty login link 🔑`

**HTML Body:** (استخدم نفس هيكل Confirm Signup مع تغيير النصوص)

---

## 📋 كيف تطبّق هذه القوالب في Supabase

### الخطوات:

1. افتح:
```
Supabase Dashboard → Authentication → Email Templates
```

2. اختر النوع: **Confirm signup**

3. الصق:
   - **Subject Heading** → ضع الـSubject من الأعلى
   - **Message body** → ضع الـHTML كاملاً

4. اضغط **Save**

5. كرر لـ:
   - Reset Password
   - Magic Link
   - Invite (إن وجد)

6. اختبر بتسجيل مستخدم جديد!

---

## ✅ الفوائد المباشرة

| قبل (القالب الافتراضي) | بعد (قالبك) |
|------------------------|--------------|
| ❌ نص عادي بدون تنسيق | ✅ تصميم احترافي |
| ❌ رابط عاري `supabase.co` | ✅ زر واضح + نص شفاف |
| ❌ يصل لـSpam بسرعة | ✅ Spam score أقل بكثير |
| ❌ بالإنجليزي فقط | ✅ عربي + إنجليزي |
| ❌ لا يمثّل هويتك | ✅ Invoicaty brand واضح |
