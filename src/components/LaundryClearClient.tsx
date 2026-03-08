'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clearLaundryLogs, calculateLaundryBill } from '@/app/actions';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

type Option = { label: string; value: string; }

export default function LaundryClearClient({ monthOptions }: { monthOptions: Option[] }) {
    const [month, setMonth] = useState('');
    const [showModal, setShowModal] = useState<{
        title: string,
        message: React.ReactNode,
        isSuccess: boolean,
        onConfirm?: () => void
    } | null>(null);

    useEffect(() => {
        if (monthOptions.length > 0 && !month) {
            setMonth(monthOptions[0].value);
        }
    }, [monthOptions, month]);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!month) return;

        const res = await calculateLaundryBill(month);

        if (res?.success && res.totalEntries && res.totalEntries > 0) {
            const selectedLabel = monthOptions.find(m => m.value === month)?.label || month;
            setShowModal({
                isSuccess: false,
                title: "रुपये पक्के करें",
                message: (
                    <div className="space-y-3 text-sm text-slate-600">
                        <p>आप <strong className="text-slate-800">{selectedLabel}</strong> की <strong>{res.totalEntries} प्रेस के कपड़े की एंट्री</strong> चुकता कर रहे हैं।</p>
                        <p className="text-[14px] leading-tight text-slate-800 font-bold mt-2 text-center">क्या आपने इसका हिसाब कर दिया है?</p>
                    </div>
                ),
                onConfirm: async () => {
                    await executeClear(month, selectedLabel);
                }
            });
        } else {
            setShowModal({
                isSuccess: false,
                title: "कोई बकाया नहीं",
                message: <p className="text-slate-600 text-sm">इस महीने का प्रेस के कपड़ों का कोई बकाया नहीं है।</p>
            });
        }
    };

    const executeClear = async (finalMonth: string, label: string) => {
        const res = await clearLaundryLogs(finalMonth);

        if (res?.success) {
            setShowModal({
                isSuccess: true,
                title: "हिसाब चुकता हो गया!",
                message: (
                    <div className="space-y-3 text-sm text-slate-600">
                        <p><strong className="text-slate-800">{label}</strong> के सभी बकाया कपड़े चुकता कर दिए गए हैं।</p>
                    </div>
                )
            });
        }
    };

    if (monthOptions.length === 0 && !showModal) return null;

    return (
        <>
            {monthOptions.length > 0 && (
                <form onSubmit={handleCalculate} className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        className="bg-white/10 border border-white/20 text-white rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 font-medium w-full sm:w-auto flex-1 min-w-0"
                    >
                        {monthOptions.map(m => (
                            <option key={m.value} value={m.value} className="text-slate-800">{m.label}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-orange-500 w-full sm:w-auto hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm active:scale-95 transition-all whitespace-nowrap">बिल चुकता करें</button>
                </form>
            )}

            {/* Custom Modal overlay using Portal */}
            {showModal && typeof document !== 'undefined' ? createPortal(
                <div className="fixed inset-0 z-100 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-[95vw] max-w-[320px] max-h-[85vh] flex flex-col rounded-3xl shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 flex justify-between items-center border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                                {showModal.isSuccess ? (
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                ) : showModal.onConfirm ? (
                                    <AlertCircle className="text-orange-500" size={20} />
                                ) : (
                                    <span className="text-slate-400">ℹ️</span>
                                )}
                                <h3 className="font-bold text-slate-800 text-base">{showModal.title}</h3>
                            </div>
                            <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 bg-slate-50 hover:bg-slate-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            {showModal.message}
                        </div>
                        <div className="p-4 border-t border-slate-100 shrink-0 flex gap-2">
                            {showModal.onConfirm ? (
                                <>
                                    <button
                                        onClick={() => setShowModal(null)}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
                                    >
                                        नहीं, अभी नहीं
                                    </button>
                                    <button
                                        onClick={showModal.onConfirm}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
                                    >
                                        हाँ, दे दी!
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowModal(null)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
                                >
                                    ठीक है
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            ) : null}
        </>
    );
}
