"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Puzzle, ArrowRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { fetchKnownWordsDetails, WordDef } from '../../../data/story';

interface GameState {
    status: 'loading' | 'playing' | 'success' | 'fail';
    targetSentence: string;
    targetTranslation: string;
    originalTokens: string[];
    shuffledTokens: { id: number; text: string; isUsed: boolean }[];
    slots: { id: number | null; text: string | null }[];
    score: number;
    streak: number;
}

export default function SentenceBuilderPage() {
    const [words, setWords] = useState<WordDef[]>([]);
    const [state, setState] = useState<GameState>({
        status: 'loading',
        targetSentence: "",
        targetTranslation: "",
        originalTokens: [],
        shuffledTokens: [],
        slots: [],
        score: 0,
        streak: 0
    });

    // 1. Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchKnownWordsDetails();
                // Filter words that have good example sentences
                const validData = data.filter(w => w.example && w.example.length > 10 && w.example.split(' ').length >= 3);

                if (validData.length < 3) {
                    alert("Not enough sentences to play! Learn more words first.");
                    return;
                }
                setWords(validData);
                startNewRound(validData, 0, 0);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    // 2. Start Round Logic
    const startNewRound = (wordList: WordDef[], currentScore: number, currentStreak: number) => {
        if (wordList.length === 0) return;

        const randomItem = wordList[Math.floor(Math.random() * wordList.length)];
        const sentence = randomItem.example.trim();
        // Simple tokenization by space
        const tokens = sentence.split(/\s+/);

        // Create shuffled pool
        const pool = tokens.map((text, idx) => ({ id: idx, text, isUsed: false }));
        // Shuffle logic
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        setState({
            status: 'playing',
            targetSentence: sentence,
            targetTranslation: randomItem.exampleTranslation || "No translation available",
            originalTokens: tokens,
            shuffledTokens: pool,
            slots: Array(tokens.length).fill({ id: null, text: null }),
            score: currentScore,
            streak: currentStreak
        });
    };

    // 3. Interactions
    const handlePoolClick = (tokenIndex: number) => {
        if (state.status !== 'playing') return;
        const token = state.shuffledTokens[tokenIndex];
        if (token.isUsed) return;

        // Find first empty slot
        const firstEmptyIndex = state.slots.findIndex(s => s.id === null);
        if (firstEmptyIndex === -1) return; // Full

        const newSlots = [...state.slots];
        newSlots[firstEmptyIndex] = { id: token.id, text: token.text };

        const newPool = [...state.shuffledTokens];
        newPool[tokenIndex] = { ...token, isUsed: true };

        setState(prev => ({
            ...prev,
            slots: newSlots,
            shuffledTokens: newPool
        }));
    };

    const handleSlotClick = (slotIndex: number) => {
        if (state.status !== 'playing') return;
        const slot = state.slots[slotIndex];
        if (slot.id === null) return;

        // Return to pool
        const newPool = state.shuffledTokens.map(t =>
            t.id === slot.id ? { ...t, isUsed: false } : t
        );

        const newSlots = [...state.slots];
        newSlots[slotIndex] = { id: null, text: null }; // Clear slot, others stay put? Or shift?
        // Let's shift left to close gap? Or keep simple clear?
        // Simple clear is easier, but usually shift is expected.
        // Let's try shift left to keep it contiguous
        newSlots.splice(slotIndex, 1);
        newSlots.push({ id: null, text: null });

        setState(prev => ({
            ...prev,
            shuffledTokens: newPool,
            slots: newSlots
        }));
    };

    const checkAnswer = () => {
        const constructed = state.slots.map(s => s.text).filter(t => t !== null).join(' ');

        // Compare loosely (ignore casing or punctuation difference if we want to be nice, 
        // but exact match is better for "building" game)
        // Let's do exact match first.

        if (constructed === state.targetSentence) {
            const finalScore = state.score + 20 + (state.streak * 5);
            setState(prev => ({
                ...prev,
                status: 'success',
                score: finalScore,
                streak: prev.streak + 1
            }));
        } else {
            setState(prev => ({
                ...prev,
                status: 'fail',
                streak: 0
            }));
        }
    };

    const nextRound = () => {
        startNewRound(words, state.score, state.streak);
    };

    const retry = () => {
        // Reset slots and pool usage
        const resetPool = state.shuffledTokens.map(t => ({ ...t, isUsed: false }));
        setState(prev => ({
            ...prev,
            status: 'playing',
            shuffledTokens: resetPool,
            slots: Array(prev.originalTokens.length).fill({ id: null, text: null })
        }));
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

            <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">

                <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm border-2 border-zinc-100 dark:border-zinc-700 w-full mb-8">

                    <div className="flex items-center gap-3 mb-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                        <Puzzle size={16} />
                        <span>Construct the Sentence</span>
                    </div>

                    {/* Sentence Slots Area */}
                    <div className="flex flex-wrap gap-2 min-h-[120px] bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 mb-6 items-center justify-start content-start">
                        {state.status !== 'loading' && state.slots.map((slot, idx) => (
                            <button
                                key={`slot-${idx}`}
                                onClick={() => handleSlotClick(idx)}
                                disabled={state.status !== 'playing' || slot.id === null}
                                className={`
                                    h-10 px-4 rounded-lg font-medium text-lg transition-all
                                    ${slot.text
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                        : "bg-zinc-100 dark:bg-zinc-800/50 border border-transparent"
                                    }
                                    ${state.status === 'playing' ? 'active:scale-95' : ''}
                                `}
                            >
                                {slot.text}
                            </button>
                        ))}
                    </div>

                    {/* Result Feedback */}
                    {state.status === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={24} className="shrink-0" />
                            <div>
                                <p className="font-bold">Correct!</p>
                                <p className="text-sm opacity-80">{state.targetTranslation}</p>
                            </div>
                        </div>
                    )}

                    {state.status === 'fail' && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <XCircle size={24} className="shrink-0" />
                            <div>
                                <p className="font-bold">Not quite right.</p>
                                <p className="text-sm opacity-80">Correct: {state.targetSentence}</p>
                            </div>
                        </div>
                    )}

                    {/* Word Bank */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        {state.status !== 'loading' && state.shuffledTokens.map((token, idx) => (
                            <button
                                key={`pool-${token.id}`}
                                onClick={() => handlePoolClick(idx)}
                                disabled={token.isUsed || state.status !== 'playing'}
                                className={`
                                    px-4 py-2 rounded-xl font-bold text-lg border-b-4 transition-all
                                    ${token.isUsed
                                        ? "opacity-0 pointer-events-none scale-0"
                                        : "bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-900 shadow-sm hover:-translate-y-1 active:translate-y-0 active:border-b-0"
                                    }
                                `}
                            >
                                {token.text}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-2xl flex gap-3">
                    {state.status === 'playing' ? (
                        <button
                            onClick={checkAnswer}
                            disabled={state.slots.some(s => s.text === null)}
                            className="w-full py-4 bg-indigo-600 disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <>
                            {state.status === 'fail' && (
                                <button
                                    onClick={retry}
                                    className="flex-1 py-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <RotateCcw size={20} />
                                    Try Again
                                </button>
                            )}
                            <button
                                onClick={nextRound}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Next Sentence</span>
                                <ArrowRight size={20} />
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
