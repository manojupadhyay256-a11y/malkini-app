import { getShoppingList, addShoppingItem, toggleShoppingStatus, deleteShoppingItem } from '@/app/actions';
import { verifySession } from '@/lib/auth';
import { ShoppingCart, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default async function BazaarPage() {
  await verifySession();
  const items = await getShoppingList();
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const purchasedCount = items.filter(i => i.status === 'purchased').length;

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 pb-8 rounded-b-[2rem] shadow-xl shadow-emerald-900/20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-white/20 rounded-xl"><ShoppingCart strokeWidth={2.5} size={24} /></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">बाज़ार का सामान</h1>
              <p className="text-emerald-100 text-[12px] font-medium">क्या लाना है, क्या हो गया — सब यहाँ</p>
            </div>
          </div>

          <div className="mt-6 bg-white/15 p-5 rounded-2xl backdrop-blur-md border border-white/15 flex justify-between items-end">
            <div>
              <p className="text-[12px] font-semibold text-emerald-100 uppercase tracking-wide">बाकी सामान</p>
              <p className="text-[38px] font-black tracking-tight leading-none mt-1">{pendingCount}</p>
              <p className="text-[13px] text-emerald-100 font-medium">चीज़ें</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-right">
              <p className="text-[22px] font-bold">{purchasedCount}</p>
              <p className="text-[11px] text-emerald-200">खरीदा ✓</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5 mt-5">
        {/* Add item form */}
        <section className="bg-white rounded-[1.4rem] p-5 shadow-sm border border-slate-200/60 animate-fade-in-up">
          <form action={async (formData) => {
            "use server";
            const item = formData.get("item") as string;
            if (item) await addShoppingItem(item, "1");
          }} className="flex gap-3">
            <input
              name="item"
              placeholder="सामान जोड़ें..."
              required
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-300 text-[14px] transition-all"
            />
            <button type="submit" className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all">
              <Plus strokeWidth={3} size={22} />
            </button>
          </form>
        </section>

        {/* List items */}
        <section className="bg-white rounded-[1.4rem] shadow-sm border border-slate-200/60 p-5 animate-fade-in-up">
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {items.map((item) => (
              <div key={item.id} className="group flex gap-2 items-center">
                <form className="flex-1" action={async () => {
                  "use server"
                  await toggleShoppingStatus(item.id, item.status);
                }}>
                  <button
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                      item.status === 'purchased'
                        ? 'bg-slate-50/80 border-transparent text-slate-400 opacity-60'
                        : 'bg-white border-slate-200 hover:border-emerald-200 shadow-sm hover:shadow'
                    }`}
                  >
                    <span className={`font-medium text-[14px] tracking-tight ${item.status === 'purchased' ? 'line-through' : ''}`}>
                      {item.itemName}
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full ml-2">x{item.quantity}</span>
                    </span>
                    {item.status === 'purchased' ? (
                      <CheckCircle2 className="text-emerald-500" strokeWidth={2.5} size={22} />
                    ) : (
                      <Circle className="text-slate-300" strokeWidth={2} size={22} />
                    )}
                  </button>
                </form>
                <form action={async () => {
                  "use server";
                  await deleteShoppingItem(item.id);
                }}>
                  <button type="submit" className="shrink-0 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart size={44} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-[14px] font-medium">सब हो गया! लिस्ट खाली है।</p>
                <p className="text-slate-300 text-[12px] mt-1">ऊपर से सामान जोड़ें</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
