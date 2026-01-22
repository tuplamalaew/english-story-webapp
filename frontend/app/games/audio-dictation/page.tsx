"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Volume2, Mic, ArrowRight, RotateCcw } from 'lucide-react';
import { fetchKnownWordsDetails, WordDef } from '../../../data/story';

interface GameState {
    status: 'loading' | 'playing' | 'success' | 'fail';
    currentWord: WordDef | null;
    attempts: number;
    score: number;
    streak: number;
    showHint: boolean;
}

export default function AudioDictationPage() {
    const [words, setWords] = useState<WordDef[]>([]);
    const [state, setState] = useState<GameState>({
        status: 'loading',
        currentWord: null,
        attempts: 0,
        score: 0,
        streak: 0,
        showHint: false
    });

    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Load Words
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchKnownWordsDetails();
                if (data.length < 5) {
                    alert("You need at least 5 known words to play!");
                    return;
                }
                setWords(data);
                startNewRound(data, 0, 0); // Start first round
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    // 2. Start Round Logic
    const startNewRound = (wordList: WordDef[], currentScore: number, currentStreak: number) => {
        if (wordList.length === 0) return;

        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];

        setState({
            status: 'playing',
            currentWord: randomWord,
            attempts: 0,
            score: currentScore,
            streak: currentStreak,
            showHint: false
        });
        setInput("");

        // Auto play audio
        setTimeout(() => playAudio(randomWord.word), 500);

        // Focus input
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const playAudio = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            checkWin();
        }
    };

    const checkWin = () => {
        if (!state.currentWord || state.status !== 'playing') return;

        const cleanInput = input.trim().toLowerCase();
        const correctWord = state.currentWord.word.toLowerCase();

        if (cleanInput === correctWord) {
            // Success
            const finalScore = state.score + 10 + (state.streak * 2);
            setState(prev => ({
                ...prev,
                status: 'success',
                score: finalScore,
                streak: prev.streak + 1
            }));
            // Play success sound logic here if needed
        } else {
            // Fail
            setState(prev => ({
                ...prev,
                status: 'fail',
                streak: 0 // Reset streak
            }));
        }
    };

    const nextWord = () => {
        startNewRound(words, state.score, state.streak);
    };

    const retry = () => {
        // Just reset status and input, keep same word
        setState(prev => ({
            ...prev,
            status: 'playing',
            showHint: false
        }));
        setInput("");
        setTimeout(() => inputRef.current?.focus(), 100);
        if (state.currentWord) playAudio(state.currentWord.word);
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
            <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">

                {state.status === 'loading' && (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                )}

                {state.currentWord && state.status !== 'loading' && (
                    <div className="w-full flex flex-col items-center">

                        {/* Audio Button */}
                        <button
                            onClick={() => state.currentWord && playAudio(state.currentWord.word)}
                            className="mb-8 w-32 h-32 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white transition-transform active:scale-95 group"
                        >
                            <Volume2 size={48} className="group-hover:animate-pulse" />
                        </button>

                        <p className="text-zinc-400 font-medium mb-6 animate-pulse">
                            Click to listen again
                        </p>

                        {/* Input Area */}
                        <div className="relative w-full mb-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={state.status === 'success' || state.status === 'fail'}
                                placeholder="Type what you hear..."
                                className={`
                                    w-full px-6 py-4 rounded-2xl text-center text-2xl font-bold outline-none border-2 transition-all
                                    ${state.status === 'success'
                                        ? "bg-green-50 border-green-500 text-green-700"
                                        : state.status === 'fail'
                                            ? "bg-red-50 border-red-500 text-red-700"
                                            : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                                    }
                                `}
                            />
                            {/* Result Icon Overlay */}
                            {state.status === 'success' && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-bounce">
                                    <Trophy size={28} />
                                </div>
                            )}
                        </div>

                        {/* Hint / Feedback */}
                        <div className="h-8 text-center mb-4">
                            {state.status !== 'success' && state.status !== 'fail' && (
                                <>
                                    {!state.showHint ? (
                                        <button
                                            onClick={() => setState(prev => ({ ...prev, showHint: true }))}
                                            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 underline decoration-dashed underline-offset-4"
                                        >
                                            Need a hint?
                                        </button>
                                    ) : (
                                        <span className="text-zinc-400 dark:text-zinc-500 text-sm font-medium animate-in fade-in">
                                            Hint: It means <span className="text-indigo-500 dark:text-indigo-400">"{state.currentWord.translation}"</span>
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {state.status === 'success' && (
                            <div className="animate-in fade-in slide-in-from-top-4 mb-6 text-center">
                                <p className="text-green-500 font-bold mb-1 text-xl">Correct!</p>
                                <p className="text-zinc-500">
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{state.currentWord.word}</span>
                                    <span className="mx-2">-</span>
                                    <span className="italic">{state.currentWord.translation}</span>
                                </p>
                            </div>
                        )}

                        {state.status === 'fail' && (
                            <div className="animate-in fade-in slide-in-from-top-4 mb-6 text-center">
                                <p className="text-red-500 font-bold mb-1">Incorrect!</p>
                                <p className="text-zinc-500">
                                    Correct: <span className="font-bold text-zinc-800 dark:text-zinc-200">{state.currentWord.word}</span>
                                    <span className="mx-2">-</span>
                                    <span className="italic">{state.currentWord.translation}</span>
                                </p>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex gap-3 mt-6 w-full">
                            {state.status === 'playing' ? (
                                <button
                                    onClick={checkWin}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                                >
                                    Check Answer
                                </button>
                            ) : (
                                <>
                                    {state.status === 'fail' && (
                                        <button
                                            onClick={retry}
                                            className="flex-1 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw size={18} />
                                            Try Again
                                        </button>
                                    )}
                                    <button
                                        onClick={nextWord}
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span>Next Word</span>
                                        <ArrowRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
