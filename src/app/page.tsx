import {
  addExpense, getMonthlySpend, getShoppingList, toggleShoppingStatus, addShoppingItem,
  addMilkLog, addLaundryLog, getUnclearedLogs, clearMilkLogs, clearLaundryLogs, logout
} from '@/app/actions';
import { verifySession } from '@/lib/auth';
import { CheckCircle2, Circle, Plus, Milk, Shirt, ReceiptText, Calendar } from 'lucide-react';
import MilkClearClient from '@/components/MilkClearClient';
import LaundryClearClient from '@/components/LaundryClearClient';

export default async function Home() {
  const session = await verifySession();

  const totalSpend = await getMonthlySpend();
  const items = await getShoppingList();
  const { milk: milkLogs, laundry: laundryLogs } = await getUnclearedLogs();

  function getMonthOptions(logs: any[]) {
    const months = new Set<string>();
    logs.forEach(log => months.add(log.date.substring(0, 7)));
    return Array.from(months).sort().reverse().map(val => {
      const [year, month] = val.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const name = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      return { label: name, value: val };
    });
  }

  const milkMonthOptions = getMonthOptions(milkLogs);
  const laundryMonthOptions = getMonthOptions(laundryLogs);

  const totalMilkLiters = milkLogs.reduce((acc, curr) => acc + parseFloat(curr.liters), 0);
  const totalLaundryEntries = laundryLogs.length;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-neutral-100 text-slate-800 pb-20 font-sans">
      {/* Mobile-first Header Component */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-b-[2.5rem] shadow-lg text-white">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-xl font-bold tracking-tight">Malkini App</h1>
          {session?.userName && (
            <div className="flex items-center gap-2">
              <span className="text-indigo-100 text-sm font-medium opacity-80">नमस्ते, {session.userName}</span>
              <form action={logout}>
                <button type="submit" className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg backdrop-blur-sm text-xs border border-white/10 transition-colors shadow-sm active:scale-95">
                  लॉगआउट
                </button>
              </form>
            </div>
          )}
        </div>
        <p className="text-indigo-100 text-sm font-medium">घर और खर्च का आसान हिसाब</p>

        <div className="mt-8 bg-white/20 p-5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
          <p className="text-sm font-medium text-indigo-50">कुल खर्च (इस महीने)</p>
          <p className="text-4xl font-extrabold mt-1 tracking-tight">₹{totalSpend}</p>
        </div>
      </div>

      <div className="p-5 space-y-8 mt-2">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-700">रोज़ का हिसाब</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Milk Logger Wrapper */}
            <div className="bg-white p-5 rounded-4xl shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3 mb-4 text-indigo-600">
                <div className="p-2.5 bg-indigo-50 rounded-full"><Milk strokeWidth={2.5} size={24} /></div>
                <h3 className="font-bold text-lg">दूध का हिसाब</h3>
              </div>
              <form action={async (formData) => {
                "use server"
                const liters = formData.get("liters");
                const date = formData.get("date");
                if (liters && date) await addMilkLog(parseFloat(liters as string), date as string);
              }} className="flex flex-col gap-3">
                <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 items-center">
                  <Calendar size={18} className="text-slate-400" />
                  <input type="date" name="date" defaultValue={todayStr} required className="bg-transparent focus:outline-none text-sm font-medium text-slate-600 w-full" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number" step="0.5" name="liters" placeholder="जैसे 1.5 लीटर" required
                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" className="shrink-0 bg-indigo-600 text-white p-3 rounded-2xl shadow-sm active:scale-95 transition-transform"><Plus /></button>
                </div>
              </form>
            </div>

            {/* Laundry Logger Wrapper */}
            <div className="bg-white p-5 rounded-4xl shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3 mb-4 text-orange-500">
                <div className="p-2.5 bg-orange-50 rounded-full"><Shirt strokeWidth={2.5} size={24} /></div>
                <h3 className="font-bold text-lg">प्रेस के कपड़े का हिसाब</h3>
              </div>
              <form action={async (formData) => {
                "use server"
                const desc = formData.get("description");
                const date = formData.get("date");
                if (desc && date) await addLaundryLog(desc as string, date as string);
              }} className="flex flex-col gap-3">
                <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-orange-500 items-center">
                  <Calendar size={18} className="text-slate-400" />
                  <input type="date" name="date" defaultValue={todayStr} required className="bg-transparent focus:outline-none text-sm font-medium text-slate-600 w-full" />
                </div>
                <textarea
                  name="description" placeholder="जैसे 4 शर्ट, 3 पैंट" required rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-medium text-sm"
                />
                <button type="submit" className="w-full bg-orange-500 text-white font-semibold py-3 rounded-2xl shadow-sm active:scale-95 transition-transform">सेव करें</button>
              </form>
            </div>

          </div>
        </section>

        {/* Month-End Billing Tracker */}
        <section className="bg-slate-800 text-white rounded-4xl shadow-md p-6 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ReceiptText size={100} /></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <ReceiptText size={22} className="text-indigo-400" /> महीने का बिल
            </h2>

            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl flex flex-col gap-4 backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">दूध का बकाया</p>
                    <p className="text-2xl font-black">{totalMilkLiters} लीटर</p>
                    <p className="text-xs text-slate-300 mt-1">{milkLogs.length} दिन</p>
                  </div>
                </div>
                {/* Clear Form */}
                {milkMonthOptions.length > 0 ? (
                  <MilkClearClient monthOptions={milkMonthOptions} />
                ) : (
                  <p className="text-xs text-indigo-200/60 mt-3 italic border-t border-white/10 pt-4">दूध का कोई बकाया नहीं।</p>
                )}
              </div>

              <div className="bg-white/10 p-4 rounded-2xl flex justify-between items-center backdrop-blur-sm border border-white/5 mx-1 mt-6">
                <div>
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">प्रेस के कपड़े (बकाया)</p>
                  <p className="text-2xl font-black">{totalLaundryEntries} एंट्री</p>
                </div>
                {laundryMonthOptions.length > 0 ? (
                  <LaundryClearClient monthOptions={laundryMonthOptions} />
                ) : (
                  <p className="text-xs text-orange-200/60 italic align-bottom">कोई बकाया नहीं</p>
                )}
              </div>
            </div>

            {/* Individual Entry Reports */}
            {(milkLogs.length > 0 || laundryLogs.length > 0) && (
              <div className="mt-8 pt-6 border-t border-white/10 space-y-5">
                <h3 className="text-sm font-bold text-indigo-200 tracking-wide uppercase">बकाया हिसाब की रिपोर्ट</h3>

                {milkLogs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">दूध की एंट्री:</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20">
                      {milkLogs.map((log) => (
                        <div key={log.id} className="flex justify-between items-center bg-white/5 rounded-lg p-2.5 text-sm">
                          <span className="text-slate-200">{log.date}</span>
                          <strong className="text-indigo-200">{log.liters} लीटर</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {laundryLogs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">प्रेस के कपड़ों की एंट्री:</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20">
                      {laundryLogs.map((log) => (
                        <div key={log.id} className="flex flex-col bg-white/5 rounded-lg p-3 text-sm gap-1">
                          <span className="text-slate-300 text-xs font-medium">{log.date}</span>
                          <span className="text-orange-100">{log.itemsDescription}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

        {/* Miscellaneous Expense Logger */}
        <section className="bg-white rounded-4xl p-5 shadow-sm border border-slate-200/60">
          <h2 className="text-md font-bold mb-3 text-slate-700">अन्य खर्च</h2>
          <form action={async (formData) => {
            "use server"
            const category = formData.get("category") as string;
            const amount = formData.get("amount") as string;
            if (category && amount) await addExpense(category, parseFloat(amount));
          }} className="flex flex-col gap-3">
            <input
              type="text"
              name="category"
              placeholder="क्या?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                placeholder="₹"
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                required
              />
              <button
                type="submit"
                className="shrink-0 bg-slate-800 text-white px-6 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </form>
        </section>


        {/* Shopping List Section */}
        <section className="bg-white rounded-4xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-slate-700">बाज़ार का सामान</h2>
          </div>

          {/* Add item form */}
          <form action={async (formData) => {
            "use server";
            const item = formData.get("item") as string;
            if (item) await addShoppingItem(item, "1");
          }} className="flex gap-3 mb-6">
            <input
              name="item"
              placeholder="सामान जोड़ें..."
              required
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
            <button type="submit" className="shrink-0 bg-indigo-600 text-white p-3 rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
              <Plus strokeWidth={3} size={24} />
            </button>
          </form>

          {/* List items */}
          <div className="space-y-3">
            {items.map((item) => (
              <form key={item.id} action={async () => {
                "use server"
                await toggleShoppingStatus(item.id, item.status);
              }}>
                <button
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${item.status === 'purchased' ? 'bg-slate-50 border-transparent text-slate-400 opacity-60' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                >
                  <span className={`font-medium tracking-tight ${item.status === 'purchased' ? 'line-through' : ''}`}>
                    {item.itemName} <span className="text-xs font-bold bg-slate-100 text-slate-500 py-1 px-2 rounded-full ml-2">x{item.quantity}</span>
                  </span>
                  {item.status === 'purchased' ? (
                    <CheckCircle2 className="text-emerald-500" strokeWidth={2.5} size={24} />
                  ) : (
                    <Circle className="text-slate-300" strokeWidth={2.5} size={24} />
                  )}
                </button>
              </form>
            ))}
            {items.length === 0 && (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm font-medium">सब हो गया! लिस्ट खाली है।</p>
              </div>
            )}
          </div>
        </section>
      </div >
    </main >
  );
}
