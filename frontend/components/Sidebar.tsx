"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, User, Settings, LogOut, Gamepad2 } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Learn', href: '/learn', icon: BookOpen },
        { name: 'Minigames', href: '/games', icon: Gamepad2 },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 h-screen bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-bold text-teal-600 font-cute flex items-center gap-2">
                    <span className="text-3xl">🐰</span> English Story
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400 shadow-sm'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-200'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-700 space-y-2">
                <button
                    onClick={async () => {
                        if (typeof window !== 'undefined' && window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
                            try {
                                const res = await fetch(`${API_BASE_URL}/api/reset`, { method: 'POST' });
                                if (!res.ok) throw new Error('Request failed');
                                window.location.reload();
                            } catch (err) {
                                console.error(err);
                                alert("Failed to reset progress. Please ensure the Backend Server is running.");
                            }
                        }
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-colors font-medium"
                >
                    <span className="text-xl">↺</span>
                    <span>Reset Progress</span>
                </button>

                <button className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium">
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}
