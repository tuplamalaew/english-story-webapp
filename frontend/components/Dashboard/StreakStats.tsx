import React from 'react';
import Link from 'next/link';

interface Props {
    streak: number;
    totalWords: number;
    todayCount: number;
}

export default function StreakStats({ streak, totalWords, todayCount }: Props) {
    const dailyTarget = 5;
    const progress = Math.min(100, Math.round((todayCount / dailyTarget) * 100));

    return (
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="z-10 flex flex-col items-center">
                    <span className="text-4xl mb-2">🔥</span>
                    <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Day Streak</span>
                </div>
            </div>

            <Link href="/vocabulary" className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer group">
                <div className="text-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">📚</span>
                </div>
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Today</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{todayCount}/{dailyTarget}</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}% ` }}></div>
                </div>
                <div className="mt-2 text-center">
                    <span className="text-xs text-zinc-500">Total: {totalWords} words</span>
                </div>
            </Link>
        </div>
    );
}

