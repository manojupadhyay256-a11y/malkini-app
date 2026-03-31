'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Milk, Shirt, ShoppingCart, Flame } from 'lucide-react';

const tabs = [
    { href: '/', label: 'होम', icon: Home, activeColor: 'text-indigo-600', activeBg: 'bg-indigo-50' },
    { href: '/doodh', label: 'दूध', icon: Milk, activeColor: 'text-blue-600', activeBg: 'bg-blue-50' },
    { href: '/press', label: 'प्रेस', icon: Shirt, activeColor: 'text-orange-500', activeBg: 'bg-orange-50' },
    { href: '/bazaar', label: 'बाज़ार', icon: ShoppingCart, activeColor: 'text-emerald-600', activeBg: 'bg-emerald-50' },
    { href: '/cylinder', label: 'सिलेंडर', icon: Flame, activeColor: 'text-teal-600', activeBg: 'bg-teal-50' },
];

export default function BottomNav() {
    const pathname = usePathname();

    if (pathname === '/login') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Frosted glass background */}
            <div className="bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-2px_24px_rgba(0,0,0,0.06)]">
                <div className="max-w-lg mx-auto flex justify-around items-center px-1 pt-1 pb-1">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all duration-300 ease-out min-w-[54px] ${
                                    isActive
                                        ? `${tab.activeColor} ${tab.activeBg}`
                                        : 'text-slate-400 active:scale-90'
                                }`}
                            >
                                <Icon
                                    size={isActive ? 23 : 21}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className="transition-all duration-300"
                                />
                                <span className={`text-[10px] leading-none transition-all duration-300 ${
                                    isActive ? 'font-bold' : 'font-medium text-slate-400'
                                }`}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
                {/* Safe area for devices with home indicator */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </nav>
    );
}
