import { addMilkLog, deleteMilkLog, getUnclearedLogs } from '@/app/actions';
import { verifySession } from '@/lib/auth';
import { Milk, Calendar, Plus, Trash2, ReceiptText } from 'lucide-react';
import MilkClearClient from '@/components/MilkClearClient';

export default async function DoodhPage() {
  await verifySession();
  const { milk: milkLogs } = await getUnclearedLogs();

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
  const totalMilkLiters = milkLogs.reduce((acc: number, curr: any) => acc + parseFloat(curr.liters), 0);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-blue-500 via-blue-600 to-blue-700 p-6 pb-8 rounded-b-[2rem] shadow-xl shadow-blue-900/20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-white/20 rounded-xl"><Milk strokeWidth={2.5} size={24} /></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">दूध का हिसाब</h1>
              <p className="text-blue-200 text-[12px] font-medium">रोज़ का दूध लिखें, महीने का बिल बनाएँ</p>
            </div>
          </div>

          <div className="mt-6 bg-white/15 p-5 rounded-2xl backdrop-blur-md border border-white/15 flex justify-between items-end">
            <div>
              <p className="text-[12px] font-semibold text-blue-200 uppercase tracking-wide">बकाया दूध</p>
              <p className="text-[38px] font-black tracking-tight leading-none mt-1">{totalMilkLiters}</p>
              <p className="text-[13px] text-blue-100 font-medium">लीटर</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-right">
              <p className="text-[22px] font-bold">{milkLogs.length}</p>
              <p className="text-[11px] text-blue-200">दिन</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5 mt-5">
        {/* Add Milk Form */}
        <section className="bg-white p-5 rounded-[1.4rem] shadow-sm border border-slate-200/60 animate-fade-in-up">
          <h2 className="font-bold text-[15px] text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg"><Plus size={18} className="text-blue-500" /></div>
            दूध जोड़ें
          </h2>
          <form action={async (formData) => {
            "use server"
            const liters = formData.get("liters");
            const date = formData.get("date");
            if (liters && date) await addMilkLog(parseFloat(liters as string), date as string);
          }} className="flex flex-col gap-3">
            <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-300 items-center transition-all">
              <Calendar size={18} className="text-slate-400" />
              <input type="date" name="date" defaultValue={todayStr} required className="bg-transparent focus:outline-none text-[14px] font-medium text-slate-600 w-full" />
            </div>
            <div className="flex gap-2">
              <input
                type="number" step="0.5" name="liters" placeholder="जैसे 1.5 लीटर" required
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 text-[14px] transition-all"
              />
              <button type="submit" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all"><Plus size={20} /></button>
            </div>
          </form>
        </section>

        {/* Monthly Billing */}
        <section className="bg-slate-800 text-white rounded-[1.4rem] shadow-lg p-5 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 p-3 opacity-[0.06]"><ReceiptText size={80} /></div>
          <div className="relative z-10">
            <h2 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg"><ReceiptText size={18} className="text-blue-400" /></div>
              बिल चुकता करें
            </h2>
            {milkMonthOptions.length > 0 ? (
              <MilkClearClient monthOptions={milkMonthOptions} />
            ) : (
              <p className="text-[13px] text-blue-200/60 italic py-2">दूध का कोई बकाया नहीं।</p>
            )}
          </div>
        </section>

        {/* Entry List */}
        {milkLogs.length > 0 && (
          <section className="bg-white rounded-[1.4rem] shadow-sm border border-slate-200/60 p-5 animate-fade-in-up">
            <h2 className="text-[12px] font-bold text-slate-400 tracking-wider uppercase mb-3">बकाया एंट्री · {milkLogs.length}</h2>
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
              {milkLogs.map((log: any) => (
                <div key={log.id} className="flex justify-between items-center bg-slate-50 rounded-xl p-3.5 text-[14px] border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[12px] font-medium">{log.date}</span>
                    <strong className="text-blue-600 text-[15px]">{log.liters} लीटर</strong>
                  </div>
                  <form action={async () => {
                    "use server";
                    await deleteMilkLog(log.id);
                  }}>
                    <button type="submit" className="p-2 text-slate-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 size={16} />
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
