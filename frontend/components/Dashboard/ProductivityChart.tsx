"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';

const data = [
    { day: 'Mon', words: 12 },
    { day: 'Tue', words: 19 },
    { day: 'Wed', words: 3 },
    { day: 'Thu', words: 5 },
    { day: 'Fri', words: 2 },
    { day: 'Sat', words: 0 },
    { day: 'Sun', words: 15 },
];

export default function ProductivityChart() {
    return (
        <div className="w-full h-full bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700/50 flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    📊 Productivity
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Words learned this week</p>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" opacity={0.5} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717A', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717A', fontSize: 12 }}
                        />
                        <Bar dataKey="words" radius={[6, 6, 6, 6]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.words > 10 ? '#14B8A6' : '#3B82F6'} // Teal for high, Blue for normal
                                    className="transition-all"
                                />
                            ))}
                            <LabelList
                                dataKey="words"
                                position="top"
                                fill="#F97316"
                                fontSize={14}
                                fontWeight="bold"
                                formatter={(value: any) => value > 0 ? value : ''}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
