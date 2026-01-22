"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from 'next/link';
import { WordDef, fetchKnownWordsDetails } from '../../data/story';

export default function VocabularyPage() {
    const [vocabulary, setVocabulary] = useState<WordDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    useEffect(() => {
        fetchKnownWordsDetails()
            .then(data => {
                setVocabulary(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(vocabulary.map(v => v.category));
        return ["All", ...Array.from(cats)];
    }, [vocabulary]);

    // Filter words by selected category
    const displayedWords = useMemo(() => {
        let words = selectedCategory === "All" ? vocabulary : vocabulary.filter(v => v.category === selectedCategory);
        return [...words].sort((a, b) => a.word.localeCompare(b.word));
    }, [selectedCategory, vocabulary]);

    const playAudio = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <h1 className="text-xl font-bold font-cute text-zinc-800 dark:text-zinc-100">My Vocabulary</h1>
                </div>
                <div className="flex items-center gap-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                    <span>{vocabulary.length} Words Learned</span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === cat
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : displayedWords.length === 0 ? (
                    <div className="text-center py-20 text-zinc-400">
                        <p>No words found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedWords.map((word) => (
                            <div
                                key={word.id}
                                className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700 hover:shadow-lg transition-shadow group relative"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">{word.word}</h3>
                                        <span className="text-xs text-zinc-500 italic font-serif">{word.partOfSpeech}</span>
                                    </div>
                                    <button
                                        onClick={() => playAudio(word.word)}
                                        className="text-zinc-400 hover:text-blue-500 transition-colors p-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                    </button>
                                </div>

                                <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-3">{word.translation}</p>

                                {word.example && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg text-sm">
                                        <p className="text-zinc-600 dark:text-zinc-400 mb-1">"{word.example}"</p>
                                        {word.exampleTranslation && (
                                            <p className="text-zinc-500 dark:text-zinc-500 italic">{word.exampleTranslation}</p>
                                        )}
                                    </div>
                                )}

                                <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-300 dark:text-zinc-600">{word.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
