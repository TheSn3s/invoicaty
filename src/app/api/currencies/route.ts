import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// Cache for 24h — currencies rarely change
export const revalidate = 86400;

export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('currencies')
    .select('code, name_en, name_ar, symbol, decimal_places')
    .order('code');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ currencies: data ?? [] });
}
