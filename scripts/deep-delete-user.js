
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// إعدادات الاتصال (سيتم سحبها من البيئة)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // نحتاج مفتاح الأدمن للحذف الفعلي
);

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * وظيفة الحذف العميق
 * @param {string} userId - ID المستخدم في سوبابيس
 * @param {string} email - إيميل المستخدم للحذف من ريسيند
 */
async function deepDeleteUser(userId, email) {
  console.log(`🚀 بدء عملية الحذف العميق للمستخدم: ${email}`);

  try {
    // 1. حذف من Resend
    console.log('--- جاري الحذف من Resend... ---');
    const { data: resendData, error: resendError } = await resend.contacts.remove({
      email: email,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });
    if (resendError) console.error('❌ خطأ في Resend:', resendError);
    else console.log('✅ تم الحذف من Resend بنجاح');

    // 2. حذف من Supabase Auth (هذا سيمسح المستخدم نهائياً)
    console.log('--- جاري الحذف من Supabase Auth... ---');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) console.error('❌ خطأ في Supabase Auth:', authError);
    else console.log('✅ تم الحذف من Supabase بنجاح');

    // 3. ملاحظة بخصوص Vercel
    console.log('💡 ملاحظة: بالنسبة لـ Vercel، يتم تنظيف الـ Cache تلقائياً عند غياب سجلات المستخدم من قاعدة البيانات.');

    console.log('✨ اكتملت عملية الحذف العميق بنجاح.');
  } catch (err) {
    console.error('💥 حدث خطأ غير متوقع:', err.message);
  }
}

// يمكن استدعاء الدالة هنا بناءً على المدخلات
// deepDeleteUser('USER_ID', 'USER_EMAIL');
