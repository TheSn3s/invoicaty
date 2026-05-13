"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AppHeader from "@/components/AppHeader";
import CreateMenu from "@/components/CreateMenu";
import AppFooter from "@/components/AppFooter";
import RichTextEditor from "@/components/RichTextEditor";
import Link from "next/link";
import { printDraft, sanitizeDraftHtml } from "@/lib/print-draft";

export const dynamic = "force-dynamic";

interface Draft {
  id: string;
  serial: string;
  date: string;
  client: string;
  project: string;
  title: string;
  summary: string;
  content_html: string;
  status: string;
  deleted_at?: string | null;
}

interface Profile {
  full_name: string;
  business_name: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  bank_account?: string;
  bank_iban?: string;
  bank_holder?: string;
  brand_color: string;
  logo_url?: string;
  invoice_template?: "modern" | "classic" | "minimal" | null;
  role?: string;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editDraft, setEditDraft] = useState<Draft | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t, lang } = useI18n();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setEditDraft(null);
      setShowModal(true);
      router.replace("/drafts", { scroll: false });
    }
  }, [router]);

  const loadData = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) { router.push("/login"); return; }
    const [{ data: d }, { data: prof }] = await Promise.all([
      supabase.from("drafts").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);
    setDrafts((d || []).filter(item => !item.deleted_at && item.status !== "Deleted"));
    setProfile(prof || null);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (data: Partial<Draft>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      date: data.date,
      client: data.client,
      project: data.project,
      title: data.title,
      summary: data.summary || "",
      content_html: sanitizeDraftHtml(data.content_html || ""),
      status: data.status || "Draft",
    };
    if (editDraft) {
      await supabase.from("drafts").update(payload).eq("id", editDraft.id);
    } else {
      const maxSerial = drafts.reduce((max, d) => {
        const n = parseInt(d.serial.replace(/^D/i, ""));
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      await supabase.from("drafts").insert({ user_id: user.id, serial: `D${String(maxSerial + 1).padStart(3, "0")}`, ...payload });
    }
    setShowModal(false);
    setEditDraft(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("drafts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Failed to soft-delete draft", error);
      alert(lang === 'ar' ? 'تعذر حذف المسودة. تحقق من صلاحية قاعدة البيانات أو قيود الحقول.' : 'Failed to delete draft. Check database constraints or permissions.');
      return;
    }

    loadData();
  };

  const filtered = drafts.filter(d => !search || d.client.toLowerCase().includes(search.toLowerCase()) || d.project.toLowerCase().includes(search.toLowerCase()) || d.title.toLowerCase().includes(search.toLowerCase()) || d.serial.includes(search));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <AppHeader
        showBack
        backHref="/dashboard"
        icon="📝"
        title={t("draft.title")}
        showNav
        rightSlot={(
          <CreateMenu
            onNewInvoice={() => router.push("/dashboard?new=1")}
            onNewQuotation={() => router.push("/quotations?new=1")}
            onNewDraft={() => { setEditDraft(null); setShowModal(true); }}
            align={lang === 'ar' ? 'left' : 'right'}
          />
        )}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("draft.search")}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-slate-400 text-sm">{t("draft.noDrafts")}</p>
            <p className="text-slate-500 text-xs mt-1">{t("draft.noDraftsDesc")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(d => (
              <div key={d.id} className="glass rounded-xl p-4 fade-in">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-inter text-blue-400 font-bold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">{d.serial}</span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full border bg-slate-500/15 border-slate-500/20 text-slate-300">{d.status}</span>
                    </div>
                    <div className="font-bold text-white text-sm">{d.title}</div>
                    <div className="text-slate-400 text-xs">{d.client} — {d.project}</div>
                  </div>
                  <span className="font-inter text-slate-500 text-[11px]">{d.date}</span>
                </div>
                {d.summary && <div className="text-slate-400 text-xs mb-3 line-clamp-2">{d.summary}</div>}
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => printDraft(d, profile, lang)} className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95">📄 {t("draft.print")}</button>
                  <button onClick={() => { setEditDraft(d); setShowModal(true); }} className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95">✏️ {t("invoice.edit")}</button>
                  <button onClick={() => handleDelete(d.id)} className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95">🗑 {t("invoice.delete")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateMenu
        variant="fab"
        onNewInvoice={() => router.push("/dashboard?new=1")}
        onNewQuotation={() => router.push("/quotations?new=1")}
        onNewDraft={() => { setEditDraft(null); setShowModal(true); }}
        align={lang === 'ar' ? 'right' : 'left'}
      />

      {showModal && <DraftModal draft={editDraft} onSave={handleSave} onClose={() => { setShowModal(false); setEditDraft(null); }} brandColor={profile?.brand_color} />}

      <AppFooter compact />
    </div>
  );
}

function DraftModal({ draft, onSave, onClose, brandColor }: { draft: Draft | null; onSave: (d: Partial<Draft>) => void; onClose: () => void; brandColor?: string; }) {
  const { t, lang } = useI18n();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState("Draft");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft) {
      setDate(draft.date);
      setClient(draft.client);
      setProject(draft.project);
      setTitle(draft.title);
      setSummary(draft.summary || "");
      setContentHtml(draft.content_html || "");
      setStatus(draft.status || "Draft");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setClient("");
      setProject("");
      setTitle("");
      setSummary("");
      setContentHtml(`<p>${lang === 'ar' ? 'ابدأ كتابة المسودة هنا...' : 'Start writing your draft here...'}</p>`);
      setStatus("Draft");
    }
  }, [draft, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.trim() || !project.trim() || !title.trim()) return;
    setSaving(true);
    await onSave({ date, client, project, title, summary, content_html: contentHtml, status });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">{draft ? `✏️ ${t("draft.edit")} ${draft.serial}` : `📝 ${t("draft.add")}`}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl w-9 h-9 rounded-xl hover:bg-slate-700/50 flex items-center justify-center transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("draft.date")}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("draft.status")}</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/40 outline-none">
                <option value="Draft">{t("draft.draft")}</option>
                <option value="Sent">{t("draft.sent")}</option>
                <option value="Approved">{t("draft.approved")}</option>
                <option value="Archived">{t("draft.archived")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("draft.client")}</label>
              <input type="text" value={client} onChange={e => setClient(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("draft.project")}</label>
              <input type="text" value={project} onChange={e => setProject(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("draft.docTitle")}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("draft.summary")}</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-2">{t("draft.content")}</label>
            <RichTextEditor value={contentHtml} onChange={setContentHtml} brandColor={brandColor} />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 text-base mt-2">
            {saving ? t("settings.saving") : `💾 ${t("invoice.save")}`}
          </button>
        </form>
      </div>
    </div>
  );
}
