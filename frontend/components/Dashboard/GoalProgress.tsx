import React from 'react';

interface Props {
    learned: number;
    target: number;
}

export default function GoalProgress({ learned, target }: Props) {
    const percentage = Math.min(100, Math.round((learned / target) * 100));
    const remaining = target - learned;

    return (
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 rounded-2xl shadow-sm mb-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Oxford 3000™ Goal</h2>
                    <p className="text-zinc-500 text-sm mt-1">Core vocabulary for English mastery</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                </div>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-4 overflow-hidden mb-4">
                <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-center text-zinc-600 dark:text-zinc-400">
                You need <span className="font-bold text-zinc-900 dark:text-zinc-200">{remaining.toLocaleString()}</span> more words to reach the goal!
            </p>
        </div>
    );
}
