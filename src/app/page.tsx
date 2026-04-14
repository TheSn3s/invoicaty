import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-black text-white">i</div>
          <span className="text-lg font-bold text-white">Invoicaty</span>
        </div>
        <Link href="/login" className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/10">
          تسجيل الدخول
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 text-center pb-20">
        <div className="fade-in max-w-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20">
            📄
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            فواتيرك الاحترافية
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              بضغطة زر
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto">
            أنشئ وأدر فواتيرك باحترافية. تصميم أنيق، طباعة فورية،
            وإحصائيات ذكية لمتابعة أعمالك.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-500/20 transition-all">
              ابدأ مجاناً ←
            </Link>
            <Link href="/login" className="glass hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all">
              عندي حساب
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl fade-in">
          {[
            { icon: "⚡", title: "سريع وبسيط", desc: "أضف فاتورتك في ثوانٍ" },
            { icon: "🖨️", title: "طباعة احترافية", desc: "قالب جاهز بضغطة زر" },
            { icon: "📊", title: "إحصائيات ذكية", desc: "تابع دخلك ومصاريفك" },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-white text-sm mb-1">{f.title}</div>
              <div className="text-slate-400 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-slate-500 text-xs">
        Invoicaty © {new Date().getFullYear()} — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
