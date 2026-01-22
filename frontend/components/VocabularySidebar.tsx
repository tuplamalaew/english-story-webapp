"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WordDef } from "../data/story";

interface VocabularySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    vocabulary: WordDef[];
    knownWords: Set<string>;
    newWords: Set<string>;
    title?: string;
}

export default function VocabularySidebar({ isOpen, onClose, vocabulary, knownWords, newWords, title = "My Vocabulary" }: VocabularySidebarProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    // Filter only known words
    const myWords = useMemo(() => {
        return vocabulary.filter(v => knownWords.has(v.word));
    }, [vocabulary, knownWords]);

    // Get unique categories and track which ones have new words
    const { categories, newCategories } = useMemo(() => {
        const cats = new Set(myWords.map(v => v.category.split('|')[0])); // Get clean category name

        const newCats = new Set<string>();
        // Check "All" first
        if (newWords.size > 0) newCats.add("All");

        // Check other categories
        myWords.forEach(word => {
            const cleanCat = word.category.split('|')[0];
            if (newWords.has(word.word)) {
                newCats.add(cleanCat);
            }
        });

        return {
            categories: ["All", ...Array.from(cats)],
            newCategories: newCats
        };
    }, [myWords, newWords]);

    // Filter words by selected category and sort NEW words first
    const displayedWords = useMemo(() => {
        // Filter using clean category name
        let words = selectedCategory === "All"
            ? myWords
            : myWords.filter(v => v.category.split('|')[0] === selectedCategory);

        // Sort: New words first, then alphabetical
        return [...words].sort((a, b) => {
            const isANew = newWords.has(a.word);
            const isBNew = newWords.has(b.word);
            if (isANew && !isBNew) return -1;
            if (!isANew && isBNew) return 1;
            return a.word.localeCompare(b.word);
        });
    }, [selectedCategory, myWords, newWords]);

    const playAudio = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white dark:bg-zinc-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-zinc-200 dark:border-zinc-800 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-cute">{title}</h2>
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-sm font-bold px-2 py-0.5 rounded-full font-sans">
                                {myWords.length}
                            </span>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    {/* Category Tabs */}
                    {myWords.length > 0 && (
                        <div className="flex gap-2 p-4 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`relative px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                        }`}
                                >
                                    {cat}
                                    {newCategories.has(cat) && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {myWords.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 space-y-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-zinc-700"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                <p className="font-cute text-lg">No words collected yet.</p>
                                <p className="text-sm">Read the story and mark words as "Known" to see them here!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayedWords.map((word) => {
                                    const isNew = newWords.has(word.word);
                                    return (
                                        <div
                                            key={word.id}
                                            className={`rounded-xl p-4 border transition-all duration-500 ${isNew
                                                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600 shadow-md ring-1 ring-yellow-200 dark:ring-yellow-700"
                                                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-cute">{word.word}</h3>
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 italic font-serif">({word.partOfSpeech})</span>
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded ml-2">{word.category.split('|')[0]}</span>
                                                        {word.category.includes('|') && (
                                                            <span className="text-xs text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                                                                {word.category.split('|')[1]}
                                                            </span>
                                                        )}
                                                        {isNew && (
                                                            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse ml-2">NEW</span>
                                                        )}
                                                    </div>
                                                    <p className="text-blue-600 dark:text-blue-400 font-medium font-cute">{word.translation}</p>
                                                </div>
                                                <button
                                                    onClick={() => playAudio(word.word)}
                                                    className="p-2 bg-white dark:bg-zinc-700 rounded-full shadow-sm text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="Listen"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                                </button>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700/50">
                                                <p className="text-zinc-600 dark:text-zinc-300 italic mb-1 font-serif">"{word.example}"</p>
                                                <p className="text-zinc-500 dark:text-zinc-500 text-sm font-cute">{word.exampleTranslation}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
