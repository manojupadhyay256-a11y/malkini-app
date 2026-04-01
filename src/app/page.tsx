import { getMonthlySpend, addExpense, logout, getMonthlyExpenses, deleteExpense } from '@/app/actions';
import { verifySession } from '@/lib/auth';
import { Milk, Shirt, ShoppingCart, Flame, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const session = await verifySession();
  const totalSpend = await getMonthlySpend();
  const monthlyExpenses = await getMonthlyExpenses();

  const quickLinks = [
    { href: '/doodh', label: 'दूध का हिसाब', subtitle: 'रोज़ का दूध', icon: Milk, color: 'from-blue-500 to-blue-600', iconBg: 'bg-white/20' },
    { href: '/press', label: 'प्रेस के कपड़े', subtitle: 'धुलाई का हिसाब', icon: Shirt, color: 'from-orange-400 to-orange-500', iconBg: 'bg-white/20' },
    { href: '/bazaar', label: 'बाज़ार का सामान', subtitle: 'खरीददारी की लिस्ट', icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600', iconBg: 'bg-white/20' },
    { href: '/panchang', label: 'आज का पंचांग', subtitle: 'वैदिक कैलेंडर', icon: Calendar, color: 'from-amber-500 to-amber-600', iconBg: 'bg-white/20' },
    { href: '/cylinder', label: 'सिलेंडर', subtitle: 'गैस सिलेंडर', icon: Flame, color: 'from-teal-500 to-teal-600', iconBg: 'bg-white/20' },
  ];

  const currentMonth = new Date().toLocaleString('hi-IN', { month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 pb-8 rounded-b-[2rem] shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Malkini App</h1>
              <p className="text-indigo-200 text-[13px] font-medium mt-0.5">घर और खर्च का आसान हिसाब</p>
            </div>
            {session?.userName && (
              <div className="flex items-center gap-2">
                <span className="text-indigo-200 text-[13px] font-medium">नमस्ते, {session.userName}</span>
                <form action={logout}>
                  <button type="submit" className="bg-white/10 hover:bg-white/20 py-1.5 px-3 rounded-xl backdrop-blur-sm text-[11px] font-semibold border border-white/15 transition-all active:scale-95">
                    लॉगआउट
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-7 bg-white/15 p-5 rounded-2xl backdrop-blur-md border border-white/15">
            <p className="text-[13px] font-semibold text-indigo-200">{currentMonth} — कुल खर्च</p>
            <p className="text-[42px] font-black mt-0.5 tracking-tight leading-none">₹{totalSpend}</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-7 mt-5">
        {/* Quick Access Grid */}
        <section className="animate-fade-in-up">
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`bg-linear-to-br ${link.color} text-white p-5 rounded-[1.4rem] shadow-lg card-hover relative overflow-hidden`}
                >
                  {/* Subtle glow */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="relative z-10">
                    <div className={`${link.iconBg} w-11 h-11 rounded-xl flex items-center justify-center mb-3`}>
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-[14px] leading-snug">{link.label}</p>
                    <p className="text-[11px] text-white/70 mt-0.5 font-medium">{link.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Miscellaneous Expense Logger */}
        <section className="bg-white rounded-[1.4rem] p-5 shadow-sm border border-slate-200/60 animate-fade-in-up">
          <h2 className="text-[15px] font-bold mb-4 text-slate-700 flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Wallet size={18} className="text-slate-500" />
            </div>
            अन्य खर्च जोड़ें
          </h2>
          <form action={async (formData) => {
            "use server"
            const category = formData.get("category") as string;
            const amount = formData.get("amount") as string;
            if (category && amount) await addExpense(category, parseFloat(amount));
          }} className="flex flex-col gap-3">
            <input
              type="text"
              name="category"
              placeholder="किस चीज़ पर खर्च?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-[14px] transition-all"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                placeholder="₹ रकम"
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-[14px] transition-all"
                required
              />
              <button
                type="submit"
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-lg"
              >
                +
              </button>
            </div>
          </form>
        </section>

        {/* Expenses List */}
        {monthlyExpenses.length > 0 && (
          <section className="bg-white rounded-[1.4rem] p-5 shadow-sm border border-slate-200/60 animate-fade-in-up">
             <h2 className="text-[15px] font-bold mb-4 text-slate-700">इस महीने का खर्च ({monthlyExpenses.length})</h2>
             <div className="space-y-3">
               {monthlyExpenses.map((expense) => (
                 <div key={expense.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-[14px]">{expense.category}</span>
                        <span className="font-extrabold text-indigo-600 text-[15px]">₹{expense.amount}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(expense.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        {expense.description && (
                            <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[150px]">{expense.description}</span>
                        )}
                      </div>
                    </div>
                    <form action={async () => {
                        "use server"
                        await deleteExpense(expense.id);
                      }}
                      className="ml-3 border-l border-slate-200 pl-3"
                    >
                      <button type="submit" className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </form>
                 </div>
               ))}
             </div>
          </section>
        )}
      </div>
    </main>
  );
}
