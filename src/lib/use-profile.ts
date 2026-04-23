'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile, Currency, Country } from '@/lib/types';

export interface ProfileBundle {
  profile: Profile | null;
  currency: Currency | null;
  country: Country | null;
}

/**
 * Loads the current user's profile alongside their default currency and country.
 * Returns nulls for guests or missing data; the caller decides how to react.
 */
export function useProfile() {
  const [data, setData] = useState<ProfileBundle>({ profile: null, currency: null, country: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData({ profile: null, currency: null, country: null });
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileErr) throw profileErr;

      let currency: Currency | null = null;
      let country: Country | null = null;

      if (profile?.default_currency) {
        const { data: c } = await supabase
          .from('currencies')
          .select('*')
          .eq('code', profile.default_currency)
          .single();
        currency = c as Currency | null;
      }

      if (profile?.country_code) {
        const { data: co } = await supabase
          .from('countries')
          .select('*')
          .eq('code', profile.country_code)
          .single();
        country = co as Country | null;
      }

      setData({ profile: profile as Profile, currency, country });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  return { ...data, loading, error, reload };
}
