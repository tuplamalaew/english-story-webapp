"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchStory, fetchStories, fetchKnownWords, markWordAsKnown, fetchKnownWordsDetails, WordDef, StoryData, StorySummary, uploadImage, updateStoryImage, generateStory, API_BASE_URL, getGenreIcon } from "../../data/story";
import StoryWord from "../../components/StoryWord";
import WordPopup from "../../components/WordPopup";
import ProgressBar from "../../components/ProgressBar";
import { ThemeToggle } from "../../components/ThemeToggle";
import TranslationSidebar from "../../components/TranslationSidebar";
import VocabularySidebar from "../../components/VocabularySidebar";
import CompletionAnimation from "../../components/CompletionAnimation";

function LearnPageContent() {
    // Story Data State
    const [stories, setStories] = useState<StorySummary[]>([]);
    const [storyData, setStoryData] = useState<StoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStory, setLoadingStory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter & Selection State
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filterDate, setFilterDate] = useState("");
    const [filterLiked, setFilterLiked] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<"list" | "generator">("list");

    // Generator State
    const [genTopic, setGenTopic] = useState("");
    const [genGenre, setGenGenre] = useState("Random");
    const [genDifficulty, setGenDifficulty] = useState("B1");
    const [genVocabCount, setGenVocabCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    // List Filters
    const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
    const [filterGenre, setFilterGenre] = useState<string>("All");
    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
    const [filterGeneratedOnly, setFilterGeneratedOnly] = useState(false);

    // Learning State
    const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
    const [newWords, setNewWords] = useState<Set<string>>(new Set());
    const [showCompletion, setShowCompletion] = useState(false);
    const [completedStories, setCompletedStories] = useState<Set<number>>(new Set());
    const [isCompletionAnimating, setIsCompletionAnimating] = useState(false);

    // Global Vocabulary List State
    const [isGlobalVocabOpen, setIsGlobalVocabOpen] = useState(false);
    const [globalVocabList, setGlobalVocabList] = useState<WordDef[]>([]);

    useEffect(() => {
        if (isGlobalVocabOpen) {
            fetchKnownWordsDetails().then(setGlobalVocabList);
        }
    }, [isGlobalVocabOpen, knownWords]);

    const [isLoaded, setIsLoaded] = useState(false);

    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');
    const idParam = searchParams.get('id');

    // List Filters Logic
    const filteredStories = useMemo(() => {
        let result = stories;
        if (filterDate) {
            result = result.filter(s => s.createdDate.startsWith(filterDate));
        }
        if (filterLiked) {
            result = result.filter(s => s.liked);
        }
        if (filterDifficulty !== "All") {
            result = result.filter(s => s.difficultyLevel === filterDifficulty);
        }
        if (filterGenre !== "All") {
            result = result.filter(s => (s.genre || "General").split(',').map(g => g.trim()).includes(filterGenre));
        }
        if (filterGeneratedOnly) {
            result = result.filter(s => s.isAIGenerated);
        }
        return result;
    }, [filterDate, filterLiked, stories, filterDifficulty, filterGenre, filterGeneratedOnly]);

    const handleStoryClick = (id: number) => {
        setSelectedId(id);

        // Update URL without full reload
        const params = new URLSearchParams(searchParams.toString());
        params.set('id', id.toString());
        params.delete('date');
        window.history.pushState(null, '', `?${params.toString()}`);
    };

    // 1. Fetch Stories List & Known Words on Mount
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [storiesData, knownData] = await Promise.all([
                    fetchStories(),
                    fetchKnownWords()
                ]);

                // Format dates for UI consistency
                const formattedStories = storiesData.map(s => ({
                    ...s,
                    active: false,
                    liked: false
                }));

                setStories(formattedStories);
                setKnownWords(new Set(knownData));

                // Sync completedStories - ลบ story ที่ไม่ complete ออกเมื่อ reset
                // เมื่อ knownWords เป็น empty (หลัง reset) ให้ clear completedStories
                if (knownData.length === 0) {
                    setCompletedStories(new Set());
                    localStorage.removeItem('completedStories');
                } else {
                    // Load completed stories แต่จะ sync กับ knownWords เมื่อ story ถูกเลือก
                    try {
                        const saved = JSON.parse(localStorage.getItem('completedStories') || '[]');
                        setCompletedStories(new Set(saved));
                    } catch (e) {
                        console.error("Failed to load completed stories", e);
                        setCompletedStories(new Set());
                    }
                }

                // Handle Initial Selection
                if (formattedStories.length > 0) {
                    let initial: StorySummary | undefined;

                    if (idParam) {
                        initial = formattedStories.find(s => s.id === parseInt(idParam));
                    } else if (dateParam) {
                        initial = formattedStories.find(s => s.createdDate.startsWith(dateParam));
                    }

                    // Default to first available if not found
                    if (!initial) {
                        initial = formattedStories[0];
                    }

                    if (initial) {
                        setSelectedId(initial.id);
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };


        init();
    }, [dateParam]);


    // 2. Fetch Selected Story Details
    useEffect(() => {
        if (!selectedId) return;

        const loadStory = async () => {
            setLoadingStory(true);
            try {
                const data = await fetchStory(undefined, selectedId);
                setStoryData(data);
            } catch (err: any) {
                console.error("Failed to load story details", err);
            } finally {
                setLoadingStory(false);
            }
        };

        loadStory();
    }, [selectedId]);


    // Load new words from localStorage on mount
    useEffect(() => {
        const savedNew = localStorage.getItem('newWords');
        if (savedNew) {
            try {
                setNewWords(new Set(JSON.parse(savedNew)));
            } catch (e) {
                console.error("Failed to parse newWords", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save newWords to localStorage when changed
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('newWords', JSON.stringify(Array.from(newWords)));
        }
    }, [newWords, isLoaded]);

    const [selectedWord, setSelectedWord] = useState<{
        word: WordDef;
        position: { x: number; y: number };
    } | null>(null);

    const [isTranslationOpen, setIsTranslationOpen] = useState(false);
    const [isVocabOpen, setIsVocabOpen] = useState(false);

    // Parse the story text into chunks (words and non-words)
    const storyChunks = useMemo(() => {
        if (!storyData) return [];

        const vocabMap = new Map<string, WordDef>();
        storyData.vocabulary.forEach((v: WordDef) => {
            vocabMap.set(v.original.toLowerCase(), v);
        });

        // Split by punctuation, whitespace, but keep them as separate chunks
        // We match:
        // 1. Newlines (\n)
        // 2. Punctuation [.,"!?;:()]
        // 3. Ordinary whitespace \s+ (spaces, tabs)
        // 4. Everything else (words)

        // This regex captures the delimiters in the result array
        const rawChunks = storyData.storyText.split(/(\n|[.,\"!?;:()]|\s+)/).filter(c => c.length > 0);

        return rawChunks.map((chunk: string, index: number) => {
            const cleanChunk = chunk.toLowerCase().trim();
            // Only look up definition if it's a word (not just whitespace/punctuation)
            const definition = cleanChunk ? vocabMap.get(cleanChunk) : undefined;
            return {
                id: index,
                text: chunk,
                definition: definition,
                isNewline: chunk.includes('\n')
            };
        });
    }, [storyData]);

    // Prepare translation chunks for highlighting
    const translationChunks = useMemo(() => {
        if (!storyData) return [];
        const sortedVocab = [...storyData.vocabulary].sort((a, b) => b.translation.length - a.translation.length);
        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(${sortedVocab.map(v => escapeRegExp(v.translation)).join('|')})`, 'g');
        const parts = storyData.storyTranslation.split(pattern);

        return parts.map((part: string, index: number) => {
            const definition = sortedVocab.find(v => v.translation === part);
            return {
                text: part,
                definition: definition,
                id: `thai-${index}`
            };
        });
    }, [storyData]);

    // Calculate valid known count
    const validKnownCount = useMemo(() => {
        if (!storyData) return 0;
        return storyData.vocabulary.filter(v => knownWords.has(v.word)).length;
    }, [storyData, knownWords]);

    // Completion State - เช็คเมื่อ story ที่เลือก complete
    useEffect(() => {
        if (storyData && validKnownCount === storyData.vocabulary.length && storyData.vocabulary.length > 0) {
            if (!completedStories.has(storyData.id)) {
                setShowCompletion(true);
                const newCompleted = new Set(completedStories);
                newCompleted.add(storyData.id);
                setCompletedStories(newCompleted);
                localStorage.setItem('completedStories', JSON.stringify(Array.from(newCompleted)));
            }
        }
    }, [validKnownCount, storyData, completedStories]);

    // Sync completedStories กับ knownWords - ลบ story ที่ไม่ complete ออกเมื่อ knownWords เปลี่ยน
    useEffect(() => {
        // สร้าง map ของ story completion status จาก storyData ที่โหลดอยู่
        if (storyData && knownWords.size >= 0) {
            const storyVocabCount = storyData.vocabulary.length;
            const knownVocabCount = storyData.vocabulary.filter(v => knownWords.has(v.word)).length;
            const isCurrentlyComplete = storyVocabCount > 0 && knownVocabCount === storyVocabCount;
            
            // ถ้า story ที่เลือกอยู่ไม่ complete แล้ว แต่ยังอยู่ใน completedStories ให้ลบออก
            if (!isCurrentlyComplete && completedStories.has(storyData.id)) {
                const newCompleted = new Set(completedStories);
                newCompleted.delete(storyData.id);
                setCompletedStories(newCompleted);
                localStorage.setItem('completedStories', JSON.stringify(Array.from(newCompleted)));
            }
        }
    }, [knownWords, storyData, completedStories]);

    // Helper function เพื่อเช็คว่า story complete หรือไม่ (ใช้สำหรับ story list)
    // เนื่องจาก StorySummary ไม่มี vocabulary เราต้องใช้ completedStories แต่จะ sync กับ knownWords
    const isStoryComplete = (storyId: number): boolean => {
        // ถ้า story นี้เป็น story ที่เลือกอยู่ ให้เช็คจาก knownWords จริง
        if (storyData && storyData.id === storyId) {
            const storyVocabCount = storyData.vocabulary.length;
            const knownVocabCount = storyData.vocabulary.filter(v => knownWords.has(v.word)).length;
            return storyVocabCount > 0 && knownVocabCount === storyVocabCount;
        }
        // ถ้าไม่ใช่ story ที่เลือกอยู่ ให้เช็คจาก completedStories
        // แต่จะ sync กับ knownWords เมื่อ story ถูกเลือก
        return completedStories.has(storyId);
    };

    // Handlers
    const handleWordClick = (wordDef: WordDef, e: React.MouseEvent) => {
        // บล็อกการคลิกเมื่อ animation กำลังแสดง
        if (isCompletionAnimating) return;
        
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setSelectedWord({
            word: wordDef,
            position: { x: rect.left, y: rect.bottom }
        });
    };

    const handleMarkKnown = async (word: string) => {
        // บล็อกการ mark known เมื่อ animation กำลังแสดง
        if (isCompletionAnimating) return;
        
        setKnownWords((prev) => {
            const newSet = new Set(prev);
            newSet.add(word);
            return newSet;
        });
        setNewWords((prev) => {
            const newSet = new Set(prev);
            newSet.add(word);
            return newSet;
        });
        setSelectedWord(null);
        try {
            await markWordAsKnown(word);
        } catch (e) {
            console.error("Failed to save known word", e);
        }
    };

    const handleClosePopup = () => setSelectedWord(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (selectedWord && !(e.target as HTMLElement).closest('.popup-container')) {
                // logic handled by component or simplified here
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [selectedWord]);

    // Text-to-Speech
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if (!storyData) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(storyData.storyText);
            utterance.lang = 'en-US';
            utterance.rate = 0.9; // Slightly slower for learning
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    // Cleanup speech on unmount or when story changes
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [selectedId]);

    // Toggle Like (Mock)
    const toggleLike = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setStories(prev => prev.map(s => s.id === id ? { ...s, liked: !s.liked } : s));
    };

    const toggleCurrentStoryLike = (e: React.MouseEvent) => {
        if (selectedId) toggleLike(e, selectedId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper for Difficulty Badges
    const getDifficultyDisplay = (level: string) => {
        const map: { [key: string]: string } = {
            'Easy': 'A1',
            'Medium': 'B1',
            'Hard': 'C1'
        };
        return map[level] || level;
    };

    const getDifficultyColor = (level: string) => {
        const display = getDifficultyDisplay(level);
        if (['A1', 'A2', 'Easy'].includes(display)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (['B1', 'B2', 'Medium'].includes(display)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    };

    return (

        <div className="h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 flex-none border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </Link>
                    <h1 className="text-xl font-bold font-cute text-zinc-800 dark:text-zinc-100">Learn English</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsGlobalVocabOpen(true)}
                        className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                        title="Vocabulary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        {newWords.size > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse px-1">
                                {newWords.size}
                            </span>
                        )}
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">

                {/* Sidebar: Story List */}
                <aside className="lg:col-span-3 xl:col-span-3 flex flex-col h-full min-h-0">

                    {/* Sidebar Tabs */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-4 flex-none">
                        <button
                            onClick={() => setSidebarTab("list")}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sidebarTab === "list"
                                ? "bg-white dark:bg-zinc-900 text-teal-600 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Stories
                        </button>
                        <button
                            onClick={() => setSidebarTab("generator")}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sidebarTab === "generator"
                                ? "bg-white dark:bg-zinc-900 text-teal-600 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Generator
                        </button>
                    </div>

                    {sidebarTab === "list" ? (
                        <>
                            {/* Filter Section */}
                            <div className="flex flex-col gap-3 mb-4 flex-none border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-zinc-700 dark:text-zinc-300 text-lg">Stories</h2>
                                        <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-400">
                                            {filteredStories.length}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* AI Generated Filter */}
                                        <button
                                            onClick={() => setFilterGeneratedOnly(!filterGeneratedOnly)}
                                            className={`p-1.5 rounded-full transition-colors ${filterGeneratedOnly
                                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                                }`}
                                            title="Show AI Generated Only"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filterGeneratedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                        </button>

                                        {/* Genre Filter Dropdown */}
                                        <div className="relative z-20">
                                            <button
                                                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterGenre !== "All"
                                                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                    }`}
                                            >
                                                <span className="text-sm">{getGenreIcon(filterGenre === "All" ? undefined : filterGenre)}</span>
                                                {filterGenre === "All" ? "Genre" : filterGenre}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${isGenreDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                                            </button>

                                            {isGenreDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setIsGenreDropdownOpen(false)}></div>
                                                    <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-700 p-2 grid grid-cols-1 gap-1 z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                                        {["All", "Adventure", "Fantasy", "Sci-Fi", "Mystery", "Horror", "Romance", "History", "Comedy", "Drama", "Crime", "Biography"].map(g => (
                                                            <button
                                                                key={g}
                                                                onClick={() => {
                                                                    setFilterGenre(g);
                                                                    setIsGenreDropdownOpen(false);
                                                                }}
                                                                className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${filterGenre === g
                                                                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
                                                                    }`}
                                                            >
                                                                <span className="text-sm w-5 text-center">{getGenreIcon(g === "All" ? undefined : g)}</span>
                                                                {g}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Heart Filter */}
                                        <button
                                            onClick={() => setFilterLiked(!filterLiked)}
                                            className={`p-1.5 rounded-full transition-colors ${filterLiked
                                                ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                                                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"
                                                }`}
                                            title="Show Favorites Only"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filterLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                        </button>

                                        {/* Date Filter */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowDatePicker(!showDatePicker)}
                                                className={`p-1.5 rounded-full transition-colors ${filterDate
                                                    ? "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400"
                                                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                                    }`}
                                                title="Filter by Date"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            </button>

                                            {/* Date Picker Dropdown */}
                                            {showDatePicker && (
                                                <div className="absolute right-0 top-10 z-30 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 min-w-[250px]">
                                                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Select Date</label>
                                                    <input
                                                        type="date"
                                                        value={filterDate}
                                                        onChange={(e) => {
                                                            setFilterDate(e.target.value);
                                                            setShowDatePicker(false);
                                                        }}
                                                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 mb-3"
                                                    />
                                                    {filterDate && (
                                                        <button
                                                            onClick={() => {
                                                                setFilterDate("");
                                                                setShowDatePicker(false);
                                                            }}
                                                            className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Clear Filter
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Difficulty Filter Scroll */}
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-right">
                                    {["All", "A1", "A2", "B1", "B2", "C1", "C2"].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setFilterDifficulty(level)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterDifficulty === level
                                                ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>


                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto px-2 pb-2 -mx-2 custom-scrollbar">
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : filteredStories.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 italic bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                        No stories found
                                        <br />
                                        {(filterDate || filterLiked || filterDifficulty !== "All" || filterGenre !== "All") && (
                                            <button
                                                onClick={() => {
                                                    setFilterDate("");
                                                    setFilterLiked(false);
                                                    setFilterDifficulty("All");
                                                    setFilterGenre("All");
                                                    setFilterGeneratedOnly(false);
                                                }}
                                                className="mt-2 text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    filteredStories.map(story => (
                                        <button
                                            key={story.id}
                                            onClick={() => handleStoryClick(story.id)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative my-1 ${selectedId === story.id
                                                ? "bg-white dark:bg-zinc-800 border-teal-500 ring-1 ring-teal-500 shadow-md transform scale-[1.02] z-10"
                                                : isStoryComplete(story.id)
                                                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm"
                                                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2 pr-8">
                                                <h3 className={`font-bold font-cute ${selectedId === story.id ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-800 dark:text-zinc-200'} flex items-center gap-1`}>
                                                    {story.title}
                                                    {story.isAIGenerated && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-purple-500 shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                                    )}
                                                    {isStoryComplete(story.id) && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#10B981" stroke="none" className="text-emerald-500 shrink-0 ml-auto"><path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm-1.2 18L5.4 12.6l1.69-1.69 3.71 3.71 7.8-7.8 1.69 1.69z" /></svg>
                                                    )}
                                                </h3>
                                            </div>

                                            {/* Like Button on Card */}
                                            <div
                                                className="absolute top-4 right-4 z-10 p-1"
                                                onClick={(e) => toggleLike(e, story.id)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill={story.liked ? "#EF4444" : "none"}
                                                    stroke={story.liked ? "#EF4444" : "currentColor"}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className={`transition-all ${story.liked ? "scale-110" : "text-zinc-300 hover:text-zinc-400"}`}
                                                >
                                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                </svg>
                                            </div>

                                            <div className="flex justify-between items-center text-xs opacity-80 mt-2">
                                                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                    <div className="flex -space-x-1">
                                                        {(story.genre || "General").split(',').map((g, idx) => (
                                                            <span key={idx} className="text-base relative z-0 hover:z-10 transition-all hover:scale-125" title={g.trim()}>
                                                                {getGenreIcon(g.trim())}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="ml-1">{formatDate(story.createdDate)}</span>
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${getDifficultyColor(story.difficultyLevel)}`}>
                                                    {getDifficultyDisplay(story.difficultyLevel)}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
                            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Story Generator
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Topic / Prompt</label>
                                        <textarea
                                            value={genTopic}
                                            onChange={(e) => setGenTopic(e.target.value)}
                                            placeholder="E.g., A magical cat in space..."
                                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Genre</label>
                                            <select
                                                value={genGenre}
                                                onChange={(e) => setGenGenre(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm"
                                            >
                                                {["Random", "Adventure", "Fantasy", "Sci-Fi", "Mystery", "Horror", "Romance", "History", "Comedy", "Drama", "Crime", "Biography"].map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Difficulty</label>
                                            <select
                                                value={genDifficulty}
                                                onChange={(e) => setGenDifficulty(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm"
                                            >
                                                {["Random", "A1", "A2", "B1", "B2", "C1", "C2"].map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vocabulary Count: {genVocabCount}</label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="50"
                                            value={genVocabCount}
                                            onChange={(e) => setGenVocabCount(parseInt(e.target.value))}
                                            className="w-full accent-teal-500"
                                        />
                                        <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                            <span>5</span>
                                            <span>50</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            setIsGenerating(true);
                                            try {
                                                // Assuming knownWords is a Set, convert to array
                                                const knownWordsList = Array.from(knownWords);
                                                const result = await generateStory(genTopic, genDifficulty, genVocabCount, genGenre, knownWordsList);
                                                // Refresh list and select new story
                                                const stories = await fetchStories();
                                                // Update local state - similar to init logic
                                                const formattedStories = stories.map(s => ({ ...s, active: false, liked: false }));
                                                setStories(formattedStories);
                                                setSelectedId(result.id);
                                                setSidebarTab("list"); // Switch back to list to see result
                                                setGenTopic(""); // Clear input
                                            } catch (e) {
                                                console.error(e);
                                                alert("Failed to generate story");
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }}
                                        disabled={isGenerating}
                                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-teal-500/20 transition-all ${isGenerating
                                            ? "bg-zinc-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:scale-[1.02] active:scale-[0.98]"
                                            }`}
                                    >
                                        {isGenerating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </span>
                                        ) : (
                                            "Generate Story ✨"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content: Reader */}
                <main className="lg:col-span-9 xl:col-span-9 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full overflow-hidden">
                    {loadingStory ? (
                        <div className="flex items-center justify-center h-full bg-white/80 dark:bg-zinc-900/80 z-20 rounded-3xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                        </div>
                    ) : !storyData ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <p>Select a story to start reading</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Sticky Header inside Main Content */}
                            <div className="flex-none p-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-t-3xl z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {(storyData.genre || "General").split(',').map((g, idx) => (
                                            <span key={idx} className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                {getGenreIcon(g.trim())} {g.trim()}
                                            </span>
                                        ))}
                                        <span className="text-zinc-400 text-sm flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            Created on {formatDate(storyData.createdDate || new Date().toISOString())}
                                        </span>
                                    </div>

                                    {/* Action Buttons Group */}
                                    <div className="flex items-center gap-2">
                                        {/* AI Icon for Generated Stories */}
                                        {storyData.isAIGenerated && (
                                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" title="AI Generated Story">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                            </div>
                                        )}

                                        {/* Header Like Button */}
                                        <button
                                            onClick={toggleCurrentStoryLike}
                                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                                            title="Add to Favorites"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill={stories.find(s => s.id === selectedId)?.liked ? "#EF4444" : "none"}
                                                stroke={stories.find(s => s.id === selectedId)?.liked ? "#EF4444" : "currentColor"}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={`transition-all ${stories.find(s => s.id === selectedId)?.liked ? "scale-110" : "text-zinc-300 group-hover:text-red-400"}`}
                                            >
                                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white font-cute mb-6">
                                    {storyData.title || "Untitled Story"}
                                </h1>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (!isCompletionAnimating) setIsVocabOpen(true);
                                        }}
                                        disabled={isCompletionAnimating}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold transition-all duration-200 hover:scale-110 active:scale-90 ${isCompletionAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                        Vocabulary
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!isCompletionAnimating) setIsTranslationOpen(true);
                                        }}
                                        disabled={isCompletionAnimating}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold transition-all duration-200 hover:scale-110 active:scale-90 ${isCompletionAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
                                        Translate
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!isCompletionAnimating) handleSpeak();
                                        }}
                                        disabled={isCompletionAnimating}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 hover:scale-110 active:scale-90 ${isSpeaking
                                            ? "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                                            : "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"} ${isCompletionAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSpeaking ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></svg>
                                                Stop
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                                Listen
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Story Illustration */}
                            {storyData.imageUrl && (
                                <div className="h-64 relative rounded-2xl overflow-hidden mx-8 mb-6 shadow-md border-4 border-white dark:border-zinc-800 shrink-0">
                                    <img
                                        src={storyData.imageUrl.startsWith("http") ? storyData.imageUrl : `${API_BASE_URL}${storyData.imageUrl}`}
                                        alt={storyData.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    <h2 className="absolute bottom-4 left-6 text-2xl font-bold text-white font-cute drop-shadow-md z-10">
                                        {storyData.title}
                                    </h2>
                                </div>
                            )}

                            {/* Story Content Box (Text + Progress) */}
                            <div className="flex-1 flex flex-col mx-8 mb-4 border-2 border-zinc-100 dark:border-zinc-700/50 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 overflow-hidden relative">
                                {/* Overlay to block interactions during completion animation */}
                                {isCompletionAnimating && (
                                    <div className="absolute inset-0 z-50 pointer-events-auto" />
                                )}
                                {/* Scrollable Text Area */}
                                <div className={`flex-1 overflow-y-auto p-6 pb-12 custom-scrollbar ${isCompletionAnimating ? 'pointer-events-none' : ''}`}>
                                    <div className="prose dark:prose-invert prose-lg max-w-none leading-loose">
                                        <p className="font-cute">
                                            {storyChunks.map((chunk: any) => {
                                                if (chunk.isNewline) {
                                                    return <span key={chunk.id} className="block h-4 w-full"></span>;
                                                }
                                                // Use word + definition word as key to properly track each word component
                                                const wordKey = chunk.definition?.word 
                                                    ? `${chunk.id}-${chunk.definition.word}` 
                                                    : `text-${chunk.id}`;
                                                return (
                                                    <StoryWord
                                                        key={wordKey}
                                                        word={chunk.text}
                                                        definition={chunk.definition}
                                                        isKnown={chunk.definition ? knownWords.has(chunk.definition.word) : false}
                                                        onClick={(def, e) => handleWordClick(def, e)}
                                                    />
                                                );
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar Area (Inside Box) */}
                                <div className="flex-none p-4 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-700/50 backdrop-blur-sm">
                                    <ProgressBar total={storyData.vocabulary.length} known={validKnownCount} />
                                </div>
                            </div>

                            {selectedWord && (
                                <WordPopup
                                    word={selectedWord.word}
                                    onClose={handleClosePopup}
                                    onMarkKnown={handleMarkKnown}
                                    position={selectedWord.position}
                                />
                            )}

                            <CompletionAnimation
                                show={showCompletion}
                                onComplete={() => setShowCompletion(false)}
                                onAnimationStateChange={setIsCompletionAnimating}
                            />
                        </div>
                    )}
                </main>

                {/* Drawers */}
                <TranslationSidebar
                    isOpen={isTranslationOpen}
                    onClose={() => setIsTranslationOpen(false)}
                    chunks={translationChunks}
                    knownWords={knownWords}
                    titleTranslation={storyData?.titleTranslation}
                />

                <VocabularySidebar
                    isOpen={isVocabOpen}
                    onClose={() => {
                        setIsVocabOpen(false);
                        setNewWords(new Set());
                    }}
                    vocabulary={storyData?.vocabulary || []}
                    knownWords={knownWords}
                    newWords={newWords}
                    title="Story Vocabulary"
                />

                <VocabularySidebar
                    isOpen={isGlobalVocabOpen}
                    onClose={() => {
                        setIsGlobalVocabOpen(false);
                        setNewWords(new Set());
                    }}
                    vocabulary={globalVocabList}
                    knownWords={knownWords}
                    newWords={newWords}
                    title="My Vocabulary"
                />

            </div>
        </div>
    );
}

// Add custom scrollbar styles helper
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e4e4e7;
    border-radius: 3px;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3f3f46;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d4d4d8;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #52525b;
  }
    .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .mask-gradient-right {
    mask-image: linear-gradient(to right, black 80%, transparent 100%);
  }
`;

export default function Home() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <style jsx global>{customScrollbarStyle}</style>
            <LearnPageContent />
        </Suspense>
    );
}
