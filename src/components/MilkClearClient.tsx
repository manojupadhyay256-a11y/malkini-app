'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clearMilkLogs, calculateMilkBill } from '@/app/actions';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

type Option = { label: string; value: string; }

export default function MilkClearClient({ monthOptions }: { monthOptions: Option[] }) {
    const [rate, setRate] = useState('');
    const [month, setMonth] = useState('');
    const [modalInfo, setModalInfo] = useState<{
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
        if (!rate || !month) return;

        const res = await calculateMilkBill(parseFloat(rate), month);

        if (res?.success && res.totalLiters > 0) {
            const selectedLabel = monthOptions.find(m => m.value === month)?.label || month;
            setModalInfo({
                isSuccess: false, // Not success yet, just a warning/prompt
                title: "रुपये पक्के करें",
                message: (
                    <div className="space-y-3 text-sm text-slate-600">
                        <p>आप <strong className="text-slate-800">{selectedLabel}</strong> के दूध का हिसाब चुकता कर रहे हैं।</p>
                        <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs"><span>कुल दूध:</span> <span className="font-bold text-slate-800 text-sm">{res.totalLiters} लीटर</span></div>
                            <div className="flex justify-between items-center text-xs"><span>भाव / लीटर:</span> <span className="font-bold text-slate-800 text-sm">₹{rate}</span></div>
                            <div className="h-px bg-orange-200/50 my-1"></div>
                            <div className="flex justify-between items-center text-orange-600 font-black text-lg"><span>कुल रकम:</span> <span>₹{res.totalCost}</span></div>
                        </div>
                        <p className="text-[14px] leading-tight text-slate-800 font-bold mt-2 text-center">क्या आपने यह रकम दे दी है?</p>
                    </div>
                ),
                onConfirm: async () => {
                    await executeClear(parseFloat(rate), month, selectedLabel, res.totalLiters, res.totalCost);
                }
            });
        } else {
            setModalInfo({
                isSuccess: false,
                title: "कोई बकाया नहीं",
                message: <p className="text-slate-600 text-sm">इस महीने का दूध का कोई बकाया नहीं है।</p>
            });
            setRate('');
        }
    };

    const executeClear = async (finalRate: number, finalMonth: string, label: string, liters: number, cost: number) => {
        const res = await clearMilkLogs(finalRate, finalMonth);
        if (res?.success) {
            setModalInfo({
                isSuccess: true,
                title: "हिसाब चुकता हो गया!",
                message: (
                    <div className="space-y-3 text-sm text-slate-600">
                        <p><strong className="text-slate-800">{label}</strong> का दूध का हिसाब चुकता कर दिया गया है।</p>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs"><span>कुल दूध:</span> <span className="font-bold text-slate-800 text-sm">{liters} लीटर</span></div>
                            <div className="flex justify-between items-center text-xs"><span>भाव / लीटर:</span> <span className="font-bold text-slate-800 text-sm">₹{finalRate}</span></div>
                            <div className="h-px bg-slate-200 my-1"></div>
                            <div className="flex justify-between items-center text-indigo-600 font-black text-lg"><span>कुल रकम:</span> <span>₹{cost}</span></div>
                        </div>
                        <p className="text-[11px] leading-tight text-slate-500 font-medium">इसे आपके कुल खर्च में जोड़ दिया गया है।</p>
                    </div>
                )
            });
            setRate('');
        }
    };

    if (monthOptions.length === 0 && !modalInfo) return null;

    const modalContent = modalInfo && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-[95vw] max-w-[320px] max-h-[85vh] flex flex-col rounded-3xl shadow-xl animate-in zoom-in-95 duration-200">
                <div className="p-4 flex justify-between items-center border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                        {modalInfo.isSuccess ? (
                            <CheckCircle2 className="text-emerald-500" size={20} />
                        ) : modalInfo.onConfirm ? (
                            <AlertCircle className="text-orange-500" size={20} />
                        ) : (
                            <span className="text-slate-400">ℹ️</span>
                        )}
                        <h3 className="font-bold text-slate-800 text-base">{modalInfo.title}</h3>
                    </div>
                    <button onClick={() => setModalInfo(null)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {modalInfo.message}
                </div>
                <div className="p-4 border-t border-slate-100 shrink-0 flex gap-2">
                    {modalInfo.onConfirm ? (
                        <>
                            <button
                                onClick={() => setModalInfo(null)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
                            >
                                नहीं, अभी नहीं
                            </button>
                            <button
                                onClick={modalInfo.onConfirm}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
                            >
                                हाँ, दे दी!
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setModalInfo(null)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl active:scale-95 transition-all"
                        >
                            ठीक है
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {monthOptions.length > 0 && (
                <form onSubmit={handleCalculate} className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-white/10">
                    <div className="flex gap-2 w-full">
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                            className="bg-white/10 border border-white/20 text-white rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium flex-1 min-w-0"
                        >
                            {monthOptions.map(m => (
                                <option key={m.value} value={m.value} className="text-slate-800">{m.label}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            placeholder="भाव (₹)"
                            required
                            className="bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium flex-1 min-w-0"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-500 w-full sm:w-auto hover:bg-indigo-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm active:scale-95 transition-all whitespace-nowrap">बिल चुकता करें</button>
                </form>
            )}

            {/* Render modal directly or via portal if possible, currently setting a massive z-[100] to overpower sibling elements in page.tsx */}
            {modalContent && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
        </>
    );
}
