import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Deep Delete User API
 * يقوم بالحذف الكامل للمستخدم من جميع الخدمات المرتبطة:
 * - Supabase Auth (auth.users)
 * - Supabase Database (profiles, invoices, ...)
 * - Resend Audience (إن وُجد)
 * 
 * Requires: المستخدم يجب أن يكون أدمن
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 1. التحقق من أن الطالب أدمن
    const supabase = createServerSupabase();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 2. إنشاء Supabase Admin Client (بصلاحيات الخادم)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: Record<string, string> = {};

    // 3. حذف الفواتير
    const { error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('user_id', userId);
    results.invoices = invoicesError ? `❌ ${invoicesError.message}` : '✅ تم الحذف';

    // 4. حذف الـ Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    results.profile = profileError ? `❌ ${profileError.message}` : '✅ تم الحذف';

    // 5. حذف من Resend (إن كان مفعّلاً)
    if (email && process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      try {
        const resendRes = await fetch(
          `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
          }
        );
        results.resend = resendRes.ok ? '✅ تم الحذف' : `⚠️ ${resendRes.status}`;
      } catch (e: any) {
        results.resend = `⚠️ ${e.message}`;
      }
    } else {
      results.resend = '⏭️ غير مُفعّل';
    }

    // 6. حذف المستخدم من Supabase Auth (الخطوة الأهم — تمنعه من تسجيل الدخول)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    results.auth = authError ? `❌ ${authError.message}` : '✅ تم الحذف نهائياً';

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم من جميع الخدمات المرتبطة',
      results,
    });
  } catch (error: any) {
    console.error('Deep delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
