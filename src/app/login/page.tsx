"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginOrRegister } from '../actions';
import { Milk } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await loginOrRegister(name.trim(), password, isLogin);
            if (res?.error) {
                setError(res.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] flex flex-col justify-center py-12 px-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-linear-to-br from-indigo-500 to-indigo-700 p-4 rounded-2xl shadow-xl shadow-indigo-600/30">
                        <Milk className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-[28px] font-extrabold text-slate-900">
                    Malkini App
                </h2>
                <p className="mt-2 text-center text-[14px] text-slate-500 font-medium">
                    {isLogin ? "अपने अकाउंट में लॉगिन करें" : "नया अकाउंट बनाएँ"}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-lg shadow-slate-200/50 rounded-[1.4rem] sm:px-10 border border-slate-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-[13px] font-medium text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-[13px] font-bold text-slate-600 mb-1.5">
                                नाम (Name)
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-[14px] font-medium transition-all"
                                placeholder="अपना नाम लिखें"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-slate-600 mb-1.5">
                                पासवर्ड (Password)
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-[14px] font-medium transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-[14px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-[0.98] transition-all disabled:opacity-70 shadow-md shadow-indigo-600/20"
                            >
                                {loading ? "कृपया प्रतीक्षा करें..." : (isLogin ? "लॉगिन करें" : "अकाउंट बनाएँ")}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-[13px]">
                                <span className="px-3 bg-white text-slate-400 font-medium">
                                    या
                                </span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="w-full flex justify-center py-3 px-4 border-2 border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none active:scale-[0.98] transition-all"
                            >
                                {isLogin ? "नया अकाउंट बनाना चाहते हैं?" : "पहले से अकाउंट है? लॉगिन करें"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
