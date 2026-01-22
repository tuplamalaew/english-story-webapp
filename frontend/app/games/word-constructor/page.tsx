"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Shuffle, ArrowRight, RotateCcw, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { fetchKnownWordsDetails, WordDef } from '../../../data/story';

interface GameState {
    status: 'loading' | 'playing' | 'success' | 'fail';
    currentWord: WordDef | null;
    originalLetters: string[];
    shuffledLetters: { id: number; char: string; isUsed: boolean }[];
    slots: { id: number | null; char: string | null }[];
    score: number;
    streak: number;
    showHint: boolean;
}

export default function WordConstructorPage() {
    const [words, setWords] = useState<WordDef[]>([]);
    const [state, setState] = useState<GameState>({
        status: 'loading',
        currentWord: null,
        originalLetters: [],
        shuffledLetters: [],
        slots: [],
        score: 0,
        streak: 0,
        showHint: false
    });

    // 1. Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchKnownWordsDetails();
                // Filter words with reasonable length (3-10 chars)
                const validData = data.filter(w => w.word.length >= 3 && w.word.length <= 12);

                if (validData.length < 5) {
                    alert("Not enough words to play! Learn more words first.");
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
        const word = randomItem.word.toUpperCase();
        const letters = word.split('');

        // Create shuffled pool
        const pool = letters.map((char, idx) => ({ id: idx, char, isUsed: false }));
        // Shuffle logic - keep shuffling until different from original
        let attempts = 0;
        do {
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            attempts++;
        } while (pool.map(p => p.char).join('') === word && attempts < 10);

        setState({
            status: 'playing',
            currentWord: randomItem,
            originalLetters: letters,
            shuffledLetters: pool,
            slots: Array(letters.length).fill({ id: null, char: null }),
            score: currentScore,
            streak: currentStreak,
            showHint: false
        });
    };

    // 3. Interactions
    const handlePoolClick = (letterIndex: number) => {
        if (state.status !== 'playing') return;
        const letter = state.shuffledLetters[letterIndex];
        if (letter.isUsed) return;

        // Find first empty slot
        const firstEmptyIndex = state.slots.findIndex(s => s.id === null);
        if (firstEmptyIndex === -1) return;

        const newSlots = [...state.slots];
        newSlots[firstEmptyIndex] = { id: letter.id, char: letter.char };

        const newPool = [...state.shuffledLetters];
        newPool[letterIndex] = { ...letter, isUsed: true };

        setState(prev => ({
            ...prev,
            slots: newSlots,
            shuffledLetters: newPool
        }));
    };

    const handleSlotClick = (slotIndex: number) => {
        if (state.status !== 'playing') return;
        const slot = state.slots[slotIndex];
        if (slot.id === null) return;

        // Return to pool
        const newPool = state.shuffledLetters.map(l =>
            l.id === slot.id ? { ...l, isUsed: false } : l
        );

        // Shift slots left
        const newSlots = [...state.slots];
        newSlots.splice(slotIndex, 1);
        newSlots.push({ id: null, char: null });

        setState(prev => ({
            ...prev,
            shuffledLetters: newPool,
            slots: newSlots
        }));
    };

    const checkAnswer = () => {
        const constructed = state.slots.map(s => s.char).filter(c => c !== null).join('');
        const target = state.currentWord?.word.toUpperCase() || '';

        if (constructed === target) {
            const finalScore = state.score + 15 + (state.streak * 3);
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
        const resetPool = state.shuffledLetters.map(l => ({ ...l, isUsed: false }));
        setState(prev => ({
            ...prev,
            status: 'playing',
            shuffledLetters: resetPool,
            slots: Array(prev.originalLetters.length).fill({ id: null, char: null }),
            showHint: false
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
                    <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full text-orange-700 dark:text-orange-400 font-bold text-sm">
                        <Trophy size={16} />
                        Streak: {state.streak}
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full font-bold text-zinc-600 dark:text-zinc-300">
                        Score: {state.score}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center max-w-xl mx-auto w-full">

                <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm border-2 border-zinc-100 dark:border-zinc-700 w-full mb-8">

                    <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                            <Shuffle size={16} />
                            <span>Unscramble the Word</span>
                        </div>
                        {state.status === 'playing' && state.currentWord && (
                            <button
                                onClick={() => setState(prev => ({ ...prev, showHint: !prev.showHint }))}
                                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-all ${state.showHint ? 'bg-amber-100 text-amber-600' : 'text-zinc-400 hover:text-amber-500'}`}
                            >
                                <Lightbulb size={14} />
                                <span>Hint</span>
                            </button>
                        )}
                    </div>

                    {/* Hint Display */}
                    {state.showHint && state.currentWord && state.status === 'playing' && (
                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-xl text-center text-sm animate-in fade-in">
                            <span className="font-medium">{state.currentWord.translation}</span>
                        </div>
                    )}

                    {/* Letter Slots Area */}
                    <div className="flex flex-wrap gap-2 min-h-[80px] bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 mb-6 items-center justify-center">
                        {state.status !== 'loading' && state.slots.map((slot, idx) => (
                            <button
                                key={`slot-${idx}`}
                                onClick={() => handleSlotClick(idx)}
                                disabled={state.status !== 'playing' || slot.id === null}
                                className={`
                                    w-12 h-14 rounded-xl font-bold text-2xl transition-all flex items-center justify-center
                                    ${slot.char
                                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-2 border-orange-200 dark:border-orange-800 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                        : "bg-zinc-100 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-300 dark:border-zinc-600"
                                    }
                                    ${state.status === 'playing' ? 'active:scale-95' : ''}
                                `}
                            >
                                {slot.char}
                            </button>
                        ))}
                    </div>

                    {/* Result Feedback */}
                    {state.status === 'success' && state.currentWord && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={24} className="shrink-0" />
                            <div>
                                <p className="font-bold">Correct! 🎉</p>
                                <p className="text-sm opacity-80">{state.currentWord.word} - {state.currentWord.translation}</p>
                            </div>
                        </div>
                    )}

                    {state.status === 'fail' && state.currentWord && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <XCircle size={24} className="shrink-0" />
                            <div>
                                <p className="font-bold">Not quite right.</p>
                                <p className="text-sm opacity-80">Correct: <span className="font-bold">{state.currentWord.word.toUpperCase()}</span> - {state.currentWord.translation}</p>
                            </div>
                        </div>
                    )}

                    {/* Letter Bank */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        {state.status !== 'loading' && state.shuffledLetters.map((letter, idx) => (
                            <button
                                key={`pool-${letter.id}`}
                                onClick={() => handlePoolClick(idx)}
                                disabled={letter.isUsed || state.status !== 'playing'}
                                className={`
                                    w-12 h-14 rounded-xl font-bold text-2xl border-b-4 transition-all flex items-center justify-center
                                    ${letter.isUsed
                                        ? "opacity-0 pointer-events-none scale-0"
                                        : "bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-900 shadow-md hover:-translate-y-1 active:translate-y-0 active:border-b-0"
                                    }
                                `}
                            >
                                {letter.char}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-xl flex gap-3">
                    {state.status === 'playing' ? (
                        <button
                            onClick={checkAnswer}
                            disabled={state.slots.some(s => s.char === null)}
                            className="w-full py-4 bg-orange-500 disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-95"
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
                                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Next Word</span>
                                <ArrowRight size={20} />
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
