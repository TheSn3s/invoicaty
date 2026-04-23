import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export const revalidate = 86400;

export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('countries')
    .select('code, name_en, name_ar, default_currency, default_tax_rate, phone_code, flag_emoji')
    .order('name_en');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ countries: data ?? [] });
}
