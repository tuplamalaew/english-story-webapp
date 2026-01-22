import React from 'react';

interface DailyStatus {
    date: string;
    isCompleted: boolean;
    wordsLearned: number;
    totalWordsAvailable: number;
    hasStory: boolean;
}

interface Props {
    calendar: DailyStatus[];
    onDateClick?: (date: string) => void;
}

export default function CalendarHeatmap({ calendar, onDateClick }: Props) {
    // Assuming calendar contains the full current month data from 1st to End.

    if (!calendar || calendar.length === 0) return null;

    const firstDate = new Date(calendar[0].date);
    const currentMonthName = firstDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const startDayOffset = firstDate.getDay(); // 0 = Sunday

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-white dark:bg-zinc-800 border-none shadow-lg rounded-3xl overflow-hidden p-6 mb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 bg-teal-500 p-4 -m-6 mb-6 text-white">
                <button className="text-white/80 hover:text-white pointer-events-none opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h2 className="text-lg font-bold uppercase tracking-wider">{currentMonthName}</h2>
                <button className="text-white/80 hover:text-white pointer-events-none opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
                {/* Day Names */}
                {daysOfWeek.map((d, i) => (
                    <div key={i} className="text-teal-500 font-bold text-sm mb-2">
                        {d}
                    </div>
                ))}

                {/* Empty Cells for Start Offset */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {calendar.map((day) => {
                    const dateStr = day.date;
                    const dateObj = new Date(dateStr);
                    const dayNum = dateObj.getDate();

                    const isToday = dateStr === todayStr;
                    const isFuture = dateStr > todayStr;
                    const isPast = dateStr < todayStr;
                    const hasStory = day.hasStory;

                    // Progress Logic
                    const minGoal = 5;
                    const totalGoal = day.totalWordsAvailable || minGoal;

                    let progressPercent = 0;
                    let showRing = false;
                    let ringColor = "text-teal-500";
                    let isBlueFire = false;
                    let isOrangeFire = false;

                    // Stage 1: Initial Progress (0 -> 5)
                    if (day.wordsLearned < minGoal) {
                        progressPercent = (day.wordsLearned / minGoal) * 100;
                        showRing = day.wordsLearned > 0;
                        ringColor = "text-green-500";
                    }
                    // Stage 2: Orange Fire (5 -> Total)
                    else if (day.wordsLearned < totalGoal) {
                        isOrangeFire = true;
                        // Progress from 5 to Total
                        const range = totalGoal - minGoal;
                        const validRange = range > 0 ? range : 1;
                        const progressInStage = day.wordsLearned - minGoal;
                        progressPercent = (progressInStage / validRange) * 100;
                        showRing = true;
                        ringColor = "text-blue-500"; // Ring indicating progress to Blue
                    }
                    // Stage 3: Blue Fire (Reached Total)
                    else {
                        isBlueFire = true;
                    }

                    const radius = 16;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

                    let content = <span className="text-zinc-500 font-medium z-10 relative">{dayNum}</span>;
                    let containerClass = "w-10 h-10 mx-auto flex items-center justify-center rounded-full relative";

                    if (isBlueFire) {
                        // DONE EVERYTHING = Blue Fire
                        content = <span className="text-2xl filter drop-shadow-sm z-10 hue-rotate-[190deg]">🔥</span>;
                        containerClass += " bg-blue-50/50";
                    }
                    else if (isOrangeFire) {
                        // DAILY GOAL MET = Orange Fire + Progress Ring
                        content = (
                            <>
                                {showRing && (
                                    <svg className={`absolute inset-0 transform -rotate-90 ${ringColor}`} width="40" height="40">
                                        <circle cx="20" cy="20" r={radius} fill="transparent" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-zinc-700 opacity-30" />
                                        <circle cx="20" cy="20" r={radius} fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500 ease-out" />
                                    </svg>
                                )}
                                <span className="text-2xl filter drop-shadow-sm z-10">🔥</span>
                            </>
                        );
                        containerClass += " bg-orange-50/50";
                    }
                    else if (showRing) {
                        // IN PROGRESS (< 5)
                        content = (
                            <>
                                <svg className={`absolute inset-0 transform -rotate-90 ${ringColor}`} width="40" height="40">
                                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-zinc-700 opacity-30" />
                                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500 ease-out" />
                                </svg>
                                <span className={`font-bold z-10 relative ${isToday ? 'text-teal-600' : 'text-zinc-700 dark:text-zinc-300'}`}>{dayNum}</span>
                            </>
                        );
                    }
                    else if (isPast && day.wordsLearned === 0) {
                        // Missed
                        content = (
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                <span className="text-zinc-400 font-medium">{dayNum}</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-red-500 text-2xl font-bold opacity-60">✕</span>
                                </div>
                            </div>
                        );
                    }
                    else if (isToday) {
                        // Today but 0 progress -> Just Teal Circle (or empty ring?)
                        // User wants "as a circle with number inside".
                        // Let's show an empty ring for today if 0 progress, to indicate "Start here"
                        content = (
                            <>
                                <div className="absolute inset-0 border-2 border-teal-500 rounded-full opacity-30"></div>
                                <span className="font-bold text-teal-600 z-10 relative">{dayNum}</span>
                            </>
                        );
                    }
                    else if (isFuture) {
                        content = <span className="text-zinc-300 dark:text-zinc-600 z-10 relative">{dayNum}</span>;
                    }

                    // Interaction Logic
                    const isClickable = hasStory;
                    const cursorClass = isClickable ? "cursor-pointer" : "cursor-default";
                    const hoverClass = isClickable ? "hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-700" : "";
                    const clickHandler = isClickable ? () => onDateClick?.(day.date) : undefined;

                    return (
                        <div key={day.date} className="relative group" onClick={clickHandler}>
                            <div className={`${containerClass} ${cursorClass} transition-transform ${hoverClass}`}>
                                {content}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
