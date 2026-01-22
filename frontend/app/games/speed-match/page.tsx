"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Trophy, Timer, CheckCircle, XCircle } from 'lucide-react';
import { fetchKnownWordsDetails, WordDef } from '../../../data/story';

interface Card {
    id: string; // Unique ID for the card instance
    wordId: string; // ID of the underlying word (to check matches)
    text: string;
    type: 'word' | 'definition';
    isMatched: boolean;
    isWrong: boolean;
}

export default function SpeedMatchPage() {
    const [gameState, setGameState] = useState<'loading' | 'start' | 'playing' | 'base_over' | 'finished'>('loading');
    const [words, setWords] = useState<WordDef[]>([]);
    const [deck, setDeck] = useState<Card[]>([]);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [bestStreak, setBestStreak] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);

    // Initial Data Fetch
    useEffect(() => {
        const loadWords = async () => {
            try {
                // Fetch known words
                const known = await fetchKnownWordsDetails();
                setWords(known);
                setGameState('start');
            } catch (e) {
                console.error("Failed to load words", e);
                // Can fallback to mock data or show error
                setGameState('start');
            }
        };
        loadWords();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setGameState('finished');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    // Game Setup
    const startGame = () => {
        if (words.length < 5) {
            alert("You need at least 5 known words to play! Go read some stories first.");
            return;
        }

        // 1. Pick 8 random words
        const gameWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 8);

        // 2. Create card pairs
        const cards: Card[] = [];
        gameWords.forEach(w => {
            cards.push({
                id: `${w.id}-word`,
                wordId: w.id,
                text: w.word,
                type: 'word',
                isMatched: false,
                isWrong: false
            });
            cards.push({
                id: `${w.id}-def`,
                wordId: w.id,
                text: w.translation, // Using translation for matching
                type: 'definition',
                isMatched: false,
                isWrong: false
            });
        });

        // 3. Shuffle deck
        setDeck(cards.sort(() => 0.5 - Math.random()));

        // 4. Reset stats
        setScore(0);
        setTimeLeft(60);
        setCurrentStreak(0);
        setBestStreak(0);
        setSelectedCards([]);
        setGameState('playing');
    };

    // Card Interaction
    const handleCardClick = (card: Card) => {
        if (gameState !== 'playing' || card.isMatched || selectedCards.find(c => c.id === card.id)) return;

        // If we already have 2 selected (waiting for animation), ignore
        if (selectedCards.length >= 2) return;

        const newSelected = [...selectedCards, card];
        setSelectedCards(newSelected);

        if (newSelected.length === 2) {
            checkMatch(newSelected[0], newSelected[1]);
        }
    };

    const checkMatch = (card1: Card, card2: Card) => {
        if (card1.wordId === card2.wordId) {
            // MATCH!
            setTimeout(() => {
                setDeck(prev => prev.map(c =>
                    (c.id === card1.id || c.id === card2.id) ? { ...c, isMatched: true } : c
                ));
                setSelectedCards([]);
                setScore(s => s + 10 + (currentStreak * 2)); // Bonus for streak
                setCurrentStreak(s => {
                    const next = s + 1;
                    if (next > bestStreak) setBestStreak(next);
                    return next;
                });

                // Check win condition (all matched)
                // We rely on deck state update in next render, but can check count
                // Actually safer to check in a useEffect or here roughly
                setDeck(currentDeck => {
                    const remaining = currentDeck.filter(c => !c.isMatched && c.id !== card1.id && c.id !== card2.id);
                    if (remaining.length === 0) {
                        // All cleared! Respawn? Or finish?
                        // For now, let's just finish early with bonus points for time
                        finishGameEarly();
                    }
                    return currentDeck; // map above handles the actual update for this render cycle logic is tricky with closures
                });

            }, 300);
        } else {
            // MISMATCH
            setTimeout(() => {
                setDeck(prev => prev.map(c =>
                    (c.id === card1.id || c.id === card2.id) ? { ...c, isWrong: true } : c
                ));
            }, 200);

            setTimeout(() => {
                setDeck(prev => prev.map(c =>
                    (c.id === card1.id || c.id === card2.id) ? { ...c, isWrong: false } : c
                ));
                setSelectedCards([]);
                setCurrentStreak(0);
            }, 1000);
        }
    };

    const finishGameEarly = () => {
        // Add time bonus
        setScore(s => s + (timeLeft * 5));
        setGameState('finished');
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 p-6 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/games" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Exit</span>
                </Link>
                <h1 className="text-2xl font-bold font-cute text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <Timer className={timeLeft < 10 ? "text-red-500 animate-pulse" : "text-teal-500"} />
                    {timeLeft}s
                </h1>
                <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full font-bold text-zinc-600 dark:text-zinc-300">
                    Score: {score}
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">

                {gameState === 'loading' && (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                )}

                {gameState === 'start' && (
                    <div className="text-center">
                        <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
                        <h2 className="text-4xl font-bold font-cute text-zinc-800 dark:text-zinc-100 mb-4">Speed Match</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                            Match terms with their definitions as fast as you can!
                            Higher streaks give more points.
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg shadow-teal-500/30 hover:scale-105 transition-all text-xl"
                        >
                            Start Game
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="grid grid-cols-4 gap-4 w-full h-full max-h-[600px] auto-rows-fr">
                        {deck.map(card => (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                disabled={card.isMatched}
                                className={`
                                    relative flex items-center justify-center p-4 rounded-xl text-lg font-bold transition-all duration-200
                                    ${card.isMatched
                                        ? "opacity-0 scale-50"
                                        : "opacity-100 hover:scale-[1.02] shadow-sm border-b-4"
                                    }
                                    ${selectedCards.find(c => c.id === card.id)
                                        ? card.isWrong
                                            ? "bg-red-500 border-red-700 text-white animate-shake"
                                            : "bg-teal-500 border-teal-700 text-white -translate-y-1"
                                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                    }
                                `}
                            >
                                <span className="text-center select-none line-clamp-3">
                                    {card.text}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="text-center bg-white dark:bg-zinc-800 p-12 rounded-3xl shadow-xl border-2 border-zinc-100 dark:border-zinc-700 max-w-lg w-full">
                        <div className="inline-block p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
                            <Trophy size={48} className="text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-bold font-cute text-zinc-800 dark:text-zinc-100 mb-2">Time's Up!</h2>
                        <div className="text-6xl font-black text-teal-600 dark:text-teal-400 mb-6 tracking-tighter">
                            {score}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl">
                                <div className="text-zinc-400 mb-1">Best Streak</div>
                                <div className="font-bold text-xl">{bestStreak} 🔥</div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl">
                                <div className="text-zinc-400 mb-1">Words Matched</div>
                                <div className="font-bold text-xl">{deck.filter(c => c.isMatched).length / 2}</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/games"
                                className="flex-1 py-3 px-6 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 font-bold transition-colors"
                            >
                                Back to Menu
                            </Link>
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 px-6 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                Play Again
                            </button>
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
            `}</style>
        </div>
    );
}
