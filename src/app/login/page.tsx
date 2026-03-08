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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/30">
                        <Milk className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
                    Malkini App
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {isLogin ? "अपने अकाउंट में लॉगिन करें" : "नया अकाउंट बनाएँ"}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-slate-700">
                                नाम (Name)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm font-medium"
                                    placeholder="अपना नाम लिखें"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700">
                                पासवर्ड (Password)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-95 transition-all disabled:opacity-70"
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
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">
                                    या
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="w-full flex justify-center py-3 px-4 border-2 border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-95 transition-all"
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
