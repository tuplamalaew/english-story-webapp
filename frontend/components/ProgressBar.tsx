import React from 'react';

interface ProgressBarProps {
    total: number;
    known: number;
}

export default function ProgressBar({ total, known }: ProgressBarProps) {
    const percentage = Math.round((known / total) * 100);

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 shadow-lg z-40">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">Progress</span>
                        <span className="text-zinc-500 dark:text-zinc-400">{known} / {total} words known ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
