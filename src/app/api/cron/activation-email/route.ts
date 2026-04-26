import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// Lifecycle Activation Email Cron
// Runs every hour via Vercel Cron
// Finds users who signed up > 24h ago with 0 invoices
// Sends them a single activation email via Resend
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || '';

// HTML email templates
function getEmailHtml(name: string, lang: string, unsubscribeUrl: string) {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const greeting = isAr ? `مرحباً ${name || ''}` : `Hi ${name || 'there'}`;
  const subject = isAr
    ? 'جاهز لأول فاتورة؟ 🧾'
    : 'Ready for your first invoice? 🧾';

  const body = isAr
    ? `
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        لاحظنا أنك سجّلت في <strong>Invoicaty</strong> لكن لم تُنشئ فاتورتك الأولى بعد.
      </p>
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        الأمر لا يستغرق أكثر من <strong>٦٠ ثانية</strong> — فقط أدخل اسم العميل والمبلغ وأرسل فاتورة PDF احترافية فوراً.
      </p>
    `
    : `
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        We noticed you signed up for <strong>Invoicaty</strong> but haven't created your first invoice yet.
      </p>
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        It takes less than <strong>60 seconds</strong> — just enter a client name, amount, and send a professional PDF invoice instantly.
      </p>
    `;

  const ctaText = isAr ? 'أنشئ أول فاتورة الآن ←' : 'Create Your First Invoice →';
  const footer = isAr
    ? 'إذا لم تعد ترغب في استقبال هذه الرسائل'
    : "If you no longer wish to receive these emails";
  const unsubText = isAr ? 'إلغاء الاشتراك' : 'unsubscribe';
  const teamSign = isAr ? 'فريق Invoicaty' : 'The Invoicaty Team';

  return {
    subject,
    html: `
<!DOCTYPE html>
<html dir="${dir}" lang="${isAr ? 'ar' : 'en'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans Arabic',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 40px;text-align:center;">
          <img src="https://www.invoicaty.com/logo-dark.png" alt="Invoicaty" width="48" height="60" style="margin-bottom:12px;">
          <h1 style="color:#ffffff;font-size:22px;margin:0;">${greeting} 👋</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;direction:${dir};">
          ${body}

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td align="center">
              <a href="https://www.invoicaty.com/dashboard?new=1"
                style="display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:#ffffff;font-weight:bold;font-size:17px;padding:16px 40px;border-radius:14px;text-decoration:none;box-shadow:0 4px 14px rgba(22,163,74,0.3);">
                ${ctaText}
              </a>
            </td></tr>
          </table>

          <!-- Features -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:28px;margin-bottom:4px;">⚡</div>
                <div style="color:#64748b;font-size:12px;">${isAr ? 'أقل من دقيقة' : 'Under 1 minute'}</div>
              </td>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:28px;margin-bottom:4px;">📄</div>
                <div style="color:#64748b;font-size:12px;">${isAr ? 'PDF احترافي' : 'Professional PDF'}</div>
              </td>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:28px;margin-bottom:4px;">💰</div>
                <div style="color:#64748b;font-size:12px;">${isAr ? 'تتبع المدفوعات' : 'Payment tracking'}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">${teamSign}</p>
          <p style="color:#cbd5e1;font-size:11px;margin:0;">
            ${footer} — <a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">${unsubText}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Get all users who signed up between 24h and 7d ago
    const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 500 });
    if (usersErr) throw usersErr;

    const allUsers = usersData?.users || [];
    const eligibleUsers = allUsers.filter((u: { created_at: string; id: string }) => {
      const created = new Date(u.created_at);
      return created.toISOString() <= twentyFourHoursAgo && created.toISOString() >= sevenDaysAgo;
    });

    if (eligibleUsers.length === 0) {
      return NextResponse.json({ message: 'No eligible users', sent: 0 });
    }

    // 2. Get profiles for these users (check activation_email_sent_at + unsubscribe)
    const userIds = eligibleUsers.map(u => u.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, preferred_language, activation_email_sent_at, email_unsubscribed_at, unsubscribe_token')
      .in('id', userIds);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No profiles found', sent: 0 });
    }

    // 3. Get users who already have invoices
    const { data: invoiceUsers } = await supabase
      .from('invoices')
      .select('user_id')
      .in('user_id', userIds);

    const usersWithInvoices = new Set((invoiceUsers || []).map(i => i.user_id));

    // 4. Filter: no invoice + no activation email sent + not unsubscribed
    const toEmail = profiles.filter(p =>
      !usersWithInvoices.has(p.id) &&
      !p.activation_email_sent_at &&
      !p.email_unsubscribed_at &&
      p.email
    );

    if (toEmail.length === 0) {
      return NextResponse.json({ message: 'All eligible users already emailed or have invoices', sent: 0 });
    }

    // 5. Send emails via Resend
    let sent = 0;
    const errors: string[] = [];

    for (const profile of toEmail) {
      const lang = profile.preferred_language || 'ar';
      const unsubscribeUrl = `https://www.invoicaty.com/unsubscribe?token=${profile.unsubscribe_token || ''}`;
      const { subject, html } = getEmailHtml(profile.full_name || '', lang, unsubscribeUrl);

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Invoicaty <support@invoicaty.com>',
            to: [profile.email],
            subject,
            html,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          }),
        });

        const result = await res.json();

        if (result.id) {
          // Mark as sent
          await supabase.from('profiles')
            .update({ activation_email_sent_at: now.toISOString() })
            .eq('id', profile.id);

          // Log it
          await supabase.from('email_logs').insert({
            user_id: profile.id,
            email: profile.email,
            email_type: 'activation',
            resend_id: result.id,
            status: 'sent',
          });

          sent++;
        } else {
          errors.push(`${profile.email}: ${JSON.stringify(result)}`);

          await supabase.from('email_logs').insert({
            user_id: profile.id,
            email: profile.email,
            email_type: 'activation',
            status: 'failed',
            error: JSON.stringify(result),
          });
        }
      } catch (err) {
        errors.push(`${profile.email}: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Rate limiting: 50ms between emails
      await new Promise(r => setTimeout(r, 50));
    }

    return NextResponse.json({
      message: `Activation emails sent`,
      eligible: toEmail.length,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Activation email cron error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
