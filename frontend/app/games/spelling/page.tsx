"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Trophy, Lightbulb, HelpCircle, Eye } from 'lucide-react';
import { fetchKnownWordsDetails, WordDef } from '../../../data/story';

interface GameState {
    status: 'loading' | 'playing' | 'success' | 'gameover';
    currentWord: WordDef | null;
    maskedWord: (string | null)[]; // null = missing letter
    revealedIndices: Set<number>;
    attempts: number;
    score: number;
    streak: number;
}

export default function SpellingPage() {
    const [words, setWords] = useState<WordDef[]>([]);
    const [state, setState] = useState<GameState>({
        status: 'loading',
        currentWord: null,
        maskedWord: [],
        revealedIndices: new Set(),
        attempts: 0,
        score: 0,
        streak: 0
    });

    const [inputs, setInputs] = useState<string[]>([]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        const wordChars = randomWord.word.split('');

        // Determine which letters to hide (e.g., hide 40-60% of letters)
        // Always show first letter for easier words? Maybe just random for now.
        const indicesToHide = new Set<number>();
        const numToHide = Math.max(1, Math.floor(wordChars.length * 0.5));

        while (indicesToHide.size < numToHide) {
            indicesToHide.add(Math.floor(Math.random() * wordChars.length));
        }

        const masked = wordChars.map((char, idx) => indicesToHide.has(idx) ? null : char);
        const initialInputs = wordChars.map((char, idx) => indicesToHide.has(idx) ? '' : char);

        setState({
            status: 'playing',
            currentWord: randomWord,
            maskedWord: masked,
            revealedIndices: new Set(),
            attempts: 0,
            score: currentScore,
            streak: currentStreak
        });
        setInputs(initialInputs);

        // Focus first empty input after render
        setTimeout(() => {
            const firstEmpty = initialInputs.findIndex(c => c === '');
            if (firstEmpty !== -1 && inputRefs.current[firstEmpty]) {
                inputRefs.current[firstEmpty]?.focus();
            }
        }, 100);
    };

    // 3. Input Handling
    const handleInputChange = (index: number, val: string) => {
        if (state.status !== 'playing' || !state.currentWord) return;

        const valClean = val.slice(-1).toLowerCase(); // Take last char only
        const newInputs = [...inputs];
        newInputs[index] = valClean;
        setInputs(newInputs);

        // Auto-advance focus
        if (valClean) {
            let nextIndex = index + 1;
            while (nextIndex < newInputs.length && state.maskedWord[nextIndex] !== null && !state.revealedIndices.has(nextIndex)) {
                // Skip static letters
                nextIndex++;
            }
            // Also skip if it is a revealed letter (which acts like static)
            // Actually revealed letters update maskedWord to string, so check maskedWord
            while (nextIndex < newInputs.length && state.maskedWord[nextIndex] !== null) {
                nextIndex++;
            }

            if (nextIndex < newInputs.length && inputRefs.current[nextIndex]) {
                inputRefs.current[nextIndex]?.focus();
            } else {
                // Check win condition if last input filled
                checkWin(newInputs);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !inputs[index]) {
            // Move back
            let prevIndex = index - 1;
            while (prevIndex >= 0 && state.maskedWord[prevIndex] !== null) {
                prevIndex--;
            }
            if (prevIndex >= 0 && inputRefs.current[prevIndex]) {
                inputRefs.current[prevIndex]?.focus();
            }
        } else if (e.key === 'Enter') {
            checkWin(inputs);
        }
    };

    const checkWin = (currentInputs: string[]) => {
        if (!state.currentWord) return;

        const fullWord = currentInputs.join('');
        if (fullWord.toLowerCase() === state.currentWord.word.toLowerCase()) {
            // Success!
            const finalScore = state.score + 10 + (state.streak * 2);
            setState(prev => ({
                ...prev,
                status: 'success',
                score: finalScore,
                streak: prev.streak + 1
            }));
        } else {
            // Incorrect - Shake animation handled by CSS/State usually
            // For now just partial visual feedback
            const isFull = currentInputs.every(c => c.length > 0);
            if (isFull) {
                // Maybe show error state or shake
                // Simple alert for mvp or utilize UI state
                // Let's add 'error' class to incorrect inputs
            }
        }
    };

    const revealLetter = () => {
        if (state.status !== 'playing' || !state.currentWord) return;

        // Find first unknown index
        const hiddenIndices = state.currentWord.word.split('').map((_, i) => i)
            .filter(i => state.maskedWord[i] === null && !inputs[i]);

        if (hiddenIndices.length === 0) return; // All filled or revealed

        const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        const correctChar = state.currentWord.word[randomIndex];

        const newMasked = [...state.maskedWord];
        newMasked[randomIndex] = correctChar; // Effectively reveal it permanently

        const newInputs = [...inputs];
        newInputs[randomIndex] = correctChar;

        setState(prev => ({
            ...prev,
            maskedWord: newMasked,
            score: Math.max(0, prev.score - 2) // Penalty
        }));
        setInputs(newInputs);
    };

    const nextWord = () => {
        startNewRound(words, state.score, state.streak);
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
                    <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-yellow-700 dark:text-yellow-400 font-bold text-sm">
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                )}

                {state.currentWord && (state.status === 'playing' || state.status === 'success') && (
                    <div className="w-full">
                        {/* Clue Card */}
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl border-2 border-zinc-100 dark:border-zinc-700 mb-8 text-center relative overflow-hidden">
                            {state.status === 'success' && (
                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-10 backdrop-blur-sm">
                                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl transform animate-bounce">
                                        <div className="text-5xl mb-2">🎉</div>
                                        <div className="font-black text-2xl text-green-600">Correct!</div>
                                        <button
                                            onClick={nextWord}
                                            className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all"
                                        >
                                            Next Word
                                        </button>
                                    </div>
                                </div>
                            )}

                            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
                                Translate this
                            </span>
                            <h2 className="text-4xl font-black text-zinc-800 dark:text-zinc-100 mb-4 font-cute">
                                {state.currentWord.translation}
                            </h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 text-sm">
                                <span className="font-bold">{state.currentWord.category}</span>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {state.currentWord.word.split('').map((char, idx) => {
                                const isHidden = state.maskedWord[idx] === null;
                                const isRevealed = !isHidden; // Either static from start or revealed later

                                return (
                                    <input
                                        key={idx}
                                        ref={el => { inputRefs.current[idx] = el }}
                                        type="text"
                                        maxLength={1}
                                        value={inputs[idx]}
                                        readOnly={isRevealed || state.status !== 'playing'}
                                        onChange={(e) => handleInputChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className={`
                                            w-12 h-16 text-center text-3xl font-black rounded-xl border-b-4 transition-all outline-none
                                            ${isRevealed
                                                ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                                                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 focus:border-yellow-500 focus:-translate-y-1 focus:shadow-lg"
                                            }
                                            ${state.status === 'success' ? "border-green-500 text-green-600 bg-green-50" : ""}
                                        `}
                                    />
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={revealLetter}
                                disabled={state.status !== 'playing'}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50"
                            >
                                <Eye size={20} />
                                Reveal Letter (-2 pts)
                            </button>
                            <button
                                onClick={() => alert(`Definition: ${state.currentWord?.definition || 'No definition available'}`)}
                                disabled={state.status !== 'playing'}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-50"
                            >
                                <Lightbulb size={20} />
                                Hint (Example)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
