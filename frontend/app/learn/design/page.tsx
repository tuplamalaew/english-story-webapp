"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../../components/ThemeToggle';

// Mock Data
const STORIES_DATA = [
    { id: 1, title: "Oliver and the Golden Carrot", date: "2024-01-15", difficulty: "A1", active: true, liked: true },
    { id: 2, title: "The Little Blue Bird", date: "2024-01-18", difficulty: "A2", active: false, liked: false },
    { id: 3, title: "A Day in the City", date: "2024-01-20", difficulty: "B1", active: false, liked: false },
    { id: 4, title: "Night at the Museum", date: "2024-01-20", difficulty: "B2", active: false, liked: true },
    { id: 5, title: "The Space Traveler", date: "2024-01-22", difficulty: "C1", active: false, liked: false },
];

export default function DesignMockup() {
    const [stories, setStories] = useState(STORIES_DATA);
    const [selectedId, setSelectedId] = useState(1);
    const [filterDate, setFilterDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const activeStory = stories.find(s => s.id === selectedId) || stories[0];

    const toggleLike = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setStories(prev => prev.map(s => s.id === id ? { ...s, liked: !s.liked } : s));
    };

    // Filter Logic
    const filteredStories = useMemo(() => {
        if (!filterDate) return stories;
        return stories.filter(s => s.date === filterDate);
    }, [filterDate, stories]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </Link>
                    <h1 className="text-xl font-bold font-cute text-zinc-800 dark:text-zinc-100">Learn English</h1>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar: Story List */}
                <aside className="lg:col-span-4 space-y-6">

                    {/* Filter Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-zinc-700 dark:text-zinc-300 text-lg">Stories List</h2>
                            <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-400">
                                {filteredStories.length}
                            </span>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`p-2 rounded-full transition-colors ${filterDate
                                        ? "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400"
                                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                    }`}
                                title="Filter by Date"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            </button>

                            {/* Date Picker Dropdown (Simplified) */}
                            {showDatePicker && (
                                <div className="absolute right-0 top-12 z-20 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 min-w-[250px]">
                                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Select Date</label>
                                    <input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => {
                                            setFilterDate(e.target.value);
                                            setShowDatePicker(false);
                                        }}
                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 mb-3"
                                    />
                                    {filterDate && (
                                        <button
                                            onClick={() => {
                                                setFilterDate("");
                                                setShowDatePicker(false);
                                            }}
                                            className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredStories.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                No stories found for <br /> <span className="font-bold">{filterDate}</span>
                                <br />
                                <button
                                    onClick={() => setFilterDate("")}
                                    className="mt-2 text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline"
                                >
                                    Clear Filter
                                </button>
                            </div>
                        ) : (
                            filteredStories.map(story => (
                                <button
                                    key={story.id}
                                    onClick={() => setSelectedId(story.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative ${selectedId === story.id
                                            ? "bg-white dark:bg-zinc-800 border-teal-500 ring-1 ring-teal-500 shadow-md transform scale-[1.02]"
                                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2 pr-8">
                                        <h3 className={`font-bold font-cute ${selectedId === story.id ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                            {story.title}
                                        </h3>
                                    </div>

                                    {/* Like Button on Card */}
                                    <div
                                        className="absolute top-4 right-4 z-10 p-1"
                                        onClick={(e) => toggleLike(e, story.id)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill={story.liked ? "#EF4444" : "none"}
                                            stroke={story.liked ? "#EF4444" : "currentColor"}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`transition-all ${story.liked ? "scale-110" : "text-zinc-300 hover:text-zinc-400"}`}
                                        >
                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                    </div>

                                    <div className="flex justify-between items-center text-xs opacity-80 mt-2">
                                        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            {story.date}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${['A1', 'A2', 'Easy'].includes(story.difficulty) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                ['B1', 'B2', 'Medium'].includes(story.difficulty) ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {story.difficulty}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Main Content: Reader */}
                <main className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[600px] relative">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                                    Current Story
                                </span>
                                <span className="text-zinc-400 text-sm flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    Created on {activeStory.date}
                                </span>
                            </div>

                            {/* Header Like Button */}
                            <button
                                onClick={(e) => toggleLike(e, activeStory.id)}
                                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                                title="Add to Favorites"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill={activeStory.liked ? "#EF4444" : "none"}
                                    stroke={activeStory.liked ? "#EF4444" : "currentColor"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-all ${activeStory.liked ? "scale-110" : "text-zinc-300 group-hover:text-red-400"}`}
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </button>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white font-cute mb-6">
                            {activeStory.title}
                        </h1>

                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                Vocabulary
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
                                Translate
                            </button>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert prose-lg max-w-none leading-loose text-zinc-700 dark:text-zinc-300 space-y-6">
                        <p>
                            Once upon a time, in a lush green forest, there lived a curious little rabbit named Oliver.
                            Oliver loved to explore every nook and cranny of his home.
                        </p>
                        <p>
                            One sunny morning, he discovered a mysterious path he had never seen before.
                            Excited by the prospect of adventure, he hopped along the trail, his nose twitching with anticipation.
                        </p>
                        <div className="flex justify-center my-8">
                            <span className="text-zinc-300">***</span>
                        </div>
                        <p>
                            As he ventured deeper, he encountered a wise old owl perched on a sturdy branch.
                            "Where are you going, little one?" hooted the owl.
                            "I'm on a journey to find the legendary Golden Carrot!" declared Oliver bravely.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
