"use client";

import React, { useEffect } from "react";
import { WordDef } from "../data/story";

interface TranslationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    chunks: {
        id: string;
        text: string;
        definition?: WordDef;
    }[];
    knownWords: Set<string>;
    titleTranslation?: string;
}

export default function TranslationSidebar({ isOpen, onClose, chunks, knownWords, titleTranslation }: TranslationSidebarProps) {
    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

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
                    <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-cute">คำแปลภาษาไทย</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {titleTranslation && (
                            <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-4 font-cute">{titleTranslation}</h3>
                        )}
                        <p className="whitespace-pre-wrap text-lg leading-loose text-zinc-700 dark:text-zinc-300 font-cute">
                            {chunks.map((chunk) => {
                                if (chunk.definition) {
                                    const isKnown = knownWords.has(chunk.definition.word);
                                    const statusClasses = isKnown
                                        ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200"
                                        : "bg-yellow-200 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200";

                                    return (
                                        <span
                                            key={chunk.id}
                                            className={`${statusClasses} rounded px-0.5 mx-0.5 transition-colors duration-200 cursor-default`}
                                        >
                                            {chunk.text}
                                        </span>
                                    );
                                }
                                return <span key={chunk.id}>{chunk.text}</span>;
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
