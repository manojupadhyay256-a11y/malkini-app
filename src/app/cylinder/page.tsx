import { addCylinderLog, deleteCylinderLog, getCylinderLogs } from '@/app/actions';
import { verifySession } from '@/lib/auth';
import { Flame, Calendar, Trash2 } from 'lucide-react';

export default async function CylinderPage() {
  await verifySession();
  const cylinderLogsList = await getCylinderLogs();
  const todayStr = new Date().toISOString().split('T')[0];

  let currentDays = 0;
  let prevDuration: number | null = null;
  let latestDate: Date | null = null;

  if (cylinderLogsList.length > 0) {
    const latest = cylinderLogsList[0];
    latestDate = new Date(latest.installedDate);
    const today = new Date();
    currentDays = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    if (cylinderLogsList.length > 1) {
      const prev = cylinderLogsList[1];
      const prevDate = new Date(prev.installedDate);
      prevDuration = Math.floor((latestDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-teal-500 via-teal-600 to-teal-700 p-6 pb-8 rounded-b-[2rem] shadow-xl shadow-teal-900/20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-white/20 rounded-xl"><Flame strokeWidth={2.5} size={24} /></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">सिलेंडर का हिसाब</h1>
              <p className="text-teal-100 text-[12px] font-medium">कब लगा, कितने दिन चला — सब यहाँ</p>
            </div>
          </div>

          {cylinderLogsList.length > 0 ? (
            <div className="mt-6 bg-white/15 p-5 rounded-2xl backdrop-blur-md border border-white/15">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[12px] font-semibold text-teal-200 uppercase tracking-wide">चालू सिलेंडर</p>
                  <p className="text-[42px] font-black tracking-tight leading-none mt-1">{currentDays}</p>
                  <p className="text-[13px] text-teal-100 font-medium">दिन हो गए</p>
                  <p className="text-[12px] text-teal-200 mt-1">
                    लगा: {latestDate!.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {cylinderLogsList[0].notes && (
                    <p className="text-[12px] text-teal-200/80 mt-1 italic">📝 {cylinderLogsList[0].notes}</p>
                  )}
                </div>
                <div className="bg-white/15 rounded-xl px-3 py-2.5 text-center min-w-[80px]">
                  <p className="text-[10px] text-teal-200 font-medium">पिछला</p>
                  <p className="text-[20px] font-bold leading-tight">{prevDuration !== null ? prevDuration : '—'}</p>
                  <p className="text-[10px] text-teal-200">दिन चला</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-white/15 p-6 rounded-2xl backdrop-blur-md border border-white/15 text-center">
              <Flame size={36} className="mx-auto mb-2 text-teal-200/60" />
              <p className="text-teal-100 text-[14px] font-medium">अभी कोई सिलेंडर नहीं जोड़ा</p>
              <p className="text-teal-200/60 text-[12px] mt-1">नीचे नया सिलेंडर जोड़ें</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 space-y-5 mt-5">
        {/* Add New Cylinder Form */}
        <section className="bg-white p-5 rounded-[1.4rem] shadow-sm border border-slate-200/60 animate-fade-in-up">
          <h2 className="font-bold text-[15px] text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-teal-50 rounded-lg"><Flame size={18} className="text-teal-600" /></div>
            नया सिलेंडर लगाएं
          </h2>
          <form action={async (formData) => {
            "use server"
            const dateVal = formData.get("installed_date");
            const notes = formData.get("notes");
            if (dateVal) await addCylinderLog(dateVal as string, (notes as string) || '');
          }} className="space-y-3">
            <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:border-teal-300 items-center transition-all">
              <Calendar size={18} className="text-slate-400" />
              <input type="date" name="installed_date" defaultValue={todayStr} required className="bg-transparent focus:outline-none text-[14px] font-medium text-slate-600 w-full" />
            </div>
            <input
              type="text" name="notes" placeholder="नोट (जैसे HP गैस, ₹950)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 text-[14px] placeholder-slate-400 transition-all"
            />
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all text-[14px]">
              + नया सिलेंडर लगाया
            </button>
          </form>
        </section>

        {/* Cylinder History */}
        {cylinderLogsList.length > 0 && (
          <section className="bg-white rounded-[1.4rem] shadow-sm border border-slate-200/60 p-5 animate-fade-in-up">
            <h2 className="text-[12px] font-bold text-slate-400 tracking-wider uppercase mb-3">सिलेंडर का इतिहास · {cylinderLogsList.length}</h2>
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
              {cylinderLogsList.map((log: any, index: number) => {
                const logDate = new Date(log.installedDate);
                let duration: number | null = null;
                if (index < cylinderLogsList.length - 1) {
                  const nextLog = cylinderLogsList[index + 1];
                  const nextDate = new Date(nextLog.installedDate);
                  duration = Math.floor((logDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
                }
                return (
                  <div key={log.id} className="flex justify-between items-center bg-slate-50 rounded-xl p-3.5 text-[14px] border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-700 font-semibold text-[14px]">
                        {logDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {duration !== null && (
                        <span className="text-teal-600 text-[12px] font-medium">⏱ {duration} दिन चला</span>
                      )}
                      {log.notes && <span className="text-slate-400 text-[12px]">📝 {log.notes}</span>}
                    </div>
                    <form action={async () => {
                      "use server";
                      await deleteCylinderLog(log.id);
                    }}>
                      <button type="submit" className="p-2 text-slate-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
