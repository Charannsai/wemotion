import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center text-white font-bold tracking-tighter">
            We
          </div>
          <span className="font-semibold text-lg tracking-tight">WeMotion</span>
        </div>
        
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-slate-900">Projects</Link>
          <Link href="/templates" className="text-slate-500 hover:text-slate-900 transition-colors">Templates</Link>
          <Link href="/settings" className="text-slate-500 hover:text-slate-900 transition-colors">Settings</Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 hidden sm:block">
            Admin
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-medium">
            A
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
