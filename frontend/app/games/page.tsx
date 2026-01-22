"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, Timer, Trophy, GalleryVerticalEnd, Mic, Puzzle, Shuffle, Lock } from 'lucide-react';
import { fetchKnownWords } from '../../data/story';

const UNLOCK_THRESHOLD = 5;

interface GameCardProps {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string; // e.g., "teal", "yellow", etc.
    isLocked: boolean;
    progress: number; // 0-5
}

function GameCard({ href, title, description, icon, colorClass, isLocked, progress }: GameCardProps) {
    const progressPercent = Math.min((progress / UNLOCK_THRESHOLD) * 100, 100);

    const bgClass = `bg-${colorClass}-100 dark:bg-${colorClass}-900/30`;
    const textClass = `text-${colorClass}-600 dark:text-${colorClass}-400`;
    const borderHoverClass = `hover:border-${colorClass}-500 dark:hover:border-${colorClass}-500`;

    if (isLocked) {
        return (
            <div className="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border-2 border-zinc-200 dark:border-zinc-700 opacity-80">
                {/* Lock Overlay */}
                <div className="absolute inset-0 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl flex flex-col items-center justify-center z-10">
                    <Lock className="text-zinc-400 mb-2" size={32} />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Learn {UNLOCK_THRESHOLD - progress} more words
                    </span>
                </div>

                {/* Card Content (Blurred) */}
                <div className="blur-[2px]">
                    <div className={`w-12 h-12 rounded-xl ${bgClass} ${textClass} flex items-center justify-center mb-4`}>
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                        {title}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                        {description}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 relative z-20">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r from-${colorClass}-400 to-${colorClass}-500 transition-all duration-500`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 text-center font-medium">
                        {progress} / {UNLOCK_THRESHOLD} words
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={href}
            className={`group bg-white dark:bg-zinc-800 rounded-2xl p-6 border-2 border-zinc-100 dark:border-zinc-700 ${borderHoverClass} hover:shadow-lg transition-all transform hover:-translate-y-1`}
        >
            <div className={`w-12 h-12 rounded-xl ${bgClass} ${textClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h2 className={`text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2 group-hover:${textClass} transition-colors`}>
                {title}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                {description}
            </p>
            <div className={`flex items-center gap-2 text-xs font-bold ${textClass} uppercase tracking-wider`}>
                <span>Play Now</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
        </Link>
    );
}


export default function GamesPage() {
    const [knownCount, setKnownCount] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const words = await fetchKnownWords();
                setKnownCount(words.length);
            } catch (e) {
                console.error(e);
                setKnownCount(0);
            }
        };
        load();
    }, []);

    const isLocked = knownCount !== null && knownCount < UNLOCK_THRESHOLD;
    const progress = knownCount ?? 0;

    const games = [
        { href: "/games/speed-match", title: "Speed Match", description: "Race against the clock! Match words with their meanings as fast as you can.", icon: <Timer size={24} />, colorClass: "teal" },
        { href: "/games/spelling", title: "Spelling Bee", description: "Fill in the missing letters! Use hints and translations to guess the correct word.", icon: <Trophy size={24} />, colorClass: "yellow" },
        { href: "/games/story-gap", title: "Story Gap", description: "Complete the sentences! Choose the right word to fill in the blank.", icon: <GalleryVerticalEnd size={24} />, colorClass: "indigo" },
        { href: "/games/audio-dictation", title: "Audio Dictation", description: "Listen and type! Sharpen your listening skills by typing what you hear.", icon: <Mic size={24} />, colorClass: "pink" },
        { href: "/games/sentence-builder", title: "Sentence Builder", description: "Unscramble the words! Arrange the jumbled words to form a correct sentence.", icon: <Puzzle size={24} />, colorClass: "blue" },
        { href: "/games/word-constructor", title: "Word Constructor", description: "Unscramble the letters! Rearrange jumbled letters to spell the correct word.", icon: <Shuffle size={24} />, colorClass: "orange" },
    ];

    return (
        <div className="h-full bg-zinc-50 dark:bg-zinc-900 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold font-cute text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                        <Gamepad2 className="text-teal-500" size={32} />
                        Minigames
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Practice your vocabulary with fun and interactive games.
                    </p>
                    {isLocked && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2">
                            <Lock size={16} />
                            <span>Learn <strong>{UNLOCK_THRESHOLD - progress}</strong> more words to unlock all games!</span>
                        </div>
                    )}
                </header>

                {knownCount === null ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map((game) => (
                            <GameCard
                                key={game.href}
                                {...game}
                                isLocked={isLocked}
                                progress={progress}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
