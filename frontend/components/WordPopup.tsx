import React from 'react';
import { WordDef } from '../data/story';

interface WordPopupProps {
    word: WordDef;
    onClose: () => void;
    onMarkKnown: (id: string) => void;
    position: { x: number; y: number };
}

export default function WordPopup({ word, onClose, onMarkKnown, position }: WordPopupProps) {
    return (
        <div
            className="fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 w-64 animate-in fade-in zoom-in-95 duration-200"
            style={{
                top: Math.min(position.y + 10, window.innerHeight - 200), // Prevent going off-screen bottom
                left: Math.min(position.x - 100, window.innerWidth - 270) // Prevent going off-screen right
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 capitalize">{word.word}</h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 italic font-serif">({word.partOfSpeech})</span>
                    <button
                        onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(word.word);
                            utterance.lang = 'en-US';
                            window.speechSynthesis.speak(utterance);
                        }}
                        className="text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
                        title="Listen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="mb-4">
                <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-1">Meaning:</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium text-lg">{word.translation}</p>
            </div>

            <button
                onClick={() => {
                    onMarkKnown(word.word);
                    onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
            >
                Mark as Known
            </button>
        </div>
    );
}
