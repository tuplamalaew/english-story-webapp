"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Trophy, Quote, GalleryVerticalEnd, ArrowRight } from 'lucide-react';
import { fetchKnownWordsDetails, WordDef } from '../../../data/story';

interface GameState {
    status: 'loading' | 'playing' | 'success' | 'fail';
    targetWord: WordDef | null;
    maskedSentence: string;
    options: WordDef[]; // The 4 options (1 correct, 3 distractors)
    selectedIndex: number | null;
    score: number;
    streak: number;
}

export default function StoryGapPage() {
    const [allWords, setAllWords] = useState<WordDef[]>([]);
    const [state, setState] = useState<GameState>({
        status: 'loading',
        targetWord: null,
        maskedSentence: '',
        options: [],
        selectedIndex: null,
        score: 0,
        streak: 0
    });

    // 1. Load Words
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchKnownWordsDetails();
                // Filter words that have examples
                const validWords = data.filter(w => w.example && w.example.trim().length > 0);

                if (validWords.length < 5) {
                    alert("You need at least 5 known words with example sentences to play!");
                    return;
                }
                setAllWords(validWords);
                startNewRound(validWords, 0, 0);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    // 2. Start Round Logic
    const startNewRound = (wordList: WordDef[], currentScore: number, currentStreak: number) => {
        if (wordList.length === 0) return;

        // Pick Target
        const target = wordList[Math.floor(Math.random() * wordList.length)];

        // Create Masked Sentence
        // Replace target word (case insensitive) with blank
        const escapedWord = target.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');

        // If exact match failing (e.g. "run" vs "running"), we might fallback to just hiding the word string
        // But assumed word is clean.
        // Let's check if replacement happens.
        let masked = target.example.replace(regex, '_______');

        // Fallback: if regex didn't match (conjugation issues?), try simple string replace or skip
        if (masked === target.example) {
            // Try looser match or pick another word
            // For MVP, just skip this word and try again (careful of infinite loop)
            // Simple hack: replace any occurrence
            masked = target.example.replace(new RegExp(escapedWord, 'gi'), '_______');
        }

        // Generate Distractors
        const distractors: WordDef[] = [];
        const otherWords = wordList.filter(w => w.id !== target.id);

        while (distractors.length < 3 && otherWords.length > 0) {
            const index = Math.floor(Math.random() * otherWords.length);
            distractors.push(otherWords[index]);
            otherWords.splice(index, 1); // remove to avoid dupe distractors
        }

        // Combine and Shuffle
        const options = [...distractors, target].sort(() => 0.5 - Math.random());

        setState({
            status: 'playing',
            targetWord: target,
            maskedSentence: masked,
            options: options,
            selectedIndex: null,
            score: currentScore,
            streak: currentStreak
        });
    };

    // 3. Handling Answer
    const handleOptionClick = (option: WordDef, index: number) => {
        if (state.status !== 'playing') return;

        const isCorrect = option.id === state.targetWord?.id;

        setState(prev => ({
            ...prev,
            selectedIndex: index,
            status: isCorrect ? 'success' : 'fail',
            score: isCorrect ? prev.score + 10 + (prev.streak * 2) : prev.score,
            streak: isCorrect ? prev.streak + 1 : 0
        }));
    };

    const handleNextWord = () => {
        startNewRound(allWords, state.score, state.streak);
    };

    // Helper to highlight correct/incorrect
    const getOptionClass = (option: WordDef, index: number) => {
        if (state.status === 'playing') {
            return "bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200";
        }

        if (option.id === state.targetWord?.id) {
            return "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"; // Always show correct
        }

        if (state.selectedIndex === index) {
            return "bg-red-500 border-red-600 text-white animate-shake"; // Wrong selection
        }

        return "opacity-50 grayscale bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/games" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Exit</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                        <Trophy size={16} />
                        Streak: {state.streak}
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full font-bold text-zinc-600 dark:text-zinc-300">
                        Score: {state.score}
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">

                {state.status === 'loading' && (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                )}

                {state.targetWord && state.status !== 'loading' && (
                    <div className="w-full">
                        {/* Sentence Card */}
                        <div className="bg-white dark:bg-zinc-800 p-10 rounded-3xl shadow-xl border-2 border-zinc-100 dark:border-zinc-700 mb-8 text-center relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center">
                            <Quote className="absolute top-6 left-6 text-indigo-100 dark:text-indigo-900/50 transform -scale-x-100" size={64} />

                            <h2 className="text-2xl md:text-3xl font-medium text-zinc-800 dark:text-zinc-100 leading-relaxed relative z-10 font-serif italic">
                                {state.status === 'playing' ? (
                                    <span>"{state.maskedSentence}"</span>
                                ) : (
                                    <span>
                                        "
                                        {state.targetWord?.example.split(new RegExp(`(${state.targetWord.word})`, 'gi')).map((part, i) =>
                                            part.toLowerCase() === state.targetWord?.word.toLowerCase() ? (
                                                <span key={i} className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-wavy decoration-indigo-300 mx-1">
                                                    {part}
                                                </span>
                                            ) : (
                                                <span key={i}>{part}</span>
                                            )
                                        )}
                                        "
                                    </span>
                                )}
                            </h2>

                            {/* Detailed Correction (shown on Fail) - REMOVED/SIMPLIFIED */}
                            {state.status === 'fail' && (
                                <div className="mt-6 flex flex-col items-center animate-fade-in">
                                    <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Missed it!</div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">"{state.targetWord.exampleTranslation}"</div>
                                </div>
                            )}

                            {/* Success Msg */}
                            {state.status === 'success' && (
                                <div className="mt-6 animate-bounce">
                                    <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">Perfect!</div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">"{state.targetWord.exampleTranslation}"</div>
                                </div>
                            )}

                            {/* Next Button */}
                            {(state.status === 'success' || state.status === 'fail') && (
                                <button
                                    onClick={handleNextWord}
                                    className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                                >
                                    <span>Next Sentence</span>
                                    <ArrowRight size={20} />
                                </button>
                            )}

                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {state.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option, idx)}
                                    disabled={state.status !== 'playing'}
                                    className={`
                                        group relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                                        ${getOptionClass(option, idx)}
                                        ${state.status === 'playing' ? "hover:-translate-y-1 hover:shadow-md" : ""}
                                    `}
                                >
                                    <div className="font-bold text-xl mb-1">{option.word}</div>
                                    <div className="text-sm opacity-60 font-medium">{option.translation}</div>

                                    {/* Selection Indicator */}
                                    <div className={`
                                        absolute top-1/2 right-6 transform -translate-y-1/2
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${state.status === 'playing'
                                            ? "border-zinc-300 dark:border-zinc-600 group-hover:border-indigo-400"
                                            : option.id === state.targetWord?.id
                                                ? "bg-white border-white text-emerald-500"
                                                : "border-zinc-300 dark:border-zinc-600"
                                        }
                                    `}>
                                        {((state.status === 'success' || state.status === 'fail') && option.id === state.targetWord?.id) && (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
