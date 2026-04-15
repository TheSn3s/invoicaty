"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase";

export default function DebugPage() {
  const [info, setInfo] = useState<string>("جاري الفحص...");
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!user) { setInfo("❌ مو مسجل دخول"); return; }

      const { data: profile, error: profErr } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();

      setInfo(JSON.stringify({
        user_id: user.id,
        user_email: user.email,
        profile: profile,
        profile_error: profErr?.message,
        has_role: profile ? 'role' in profile : false,
        role_value: profile?.role,
      }, null, 2));
    })();
  }, [supabase]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-white text-lg font-bold mb-4">🔍 Admin Debug</h1>
      <pre className="bg-slate-800 text-green-400 p-4 rounded-xl text-xs overflow-auto whitespace-pre-wrap font-inter" dir="ltr">
        {info}
      </pre>
    </div>
  );
}
