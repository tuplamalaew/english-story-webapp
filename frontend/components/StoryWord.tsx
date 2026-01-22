import React from 'react';
import { WordDef } from '../data/story';

interface StoryWordProps {
    word: string;
    definition?: WordDef;
    isKnown: boolean;
    onClick: (wordDef: WordDef, e: React.MouseEvent) => void;
}

export default function StoryWord({ word, definition, isKnown, onClick }: StoryWordProps) {
    /**
     * Animation Logic:
     * - Animation triggers when a word transitions from unknown (false) to known (true)
     * - Uses refs to track previous state and prevent repeated animations
     * - Resets properly when word definition changes (different word instance)
     * - Prevents animation from triggering multiple times on re-renders
     */
    
    // State to trigger animation
    const [animate, setAnimate] = React.useState(false);
    // Track previous isKnown state (null = initial/uninitialized)
    const prevIsKnownRef = React.useRef<boolean | null>(null);
    // Track which word this component is rendering (for reset on word change)
    const wordIdRef = React.useRef<string | undefined>(definition?.word);
    // Flag to prevent animation from triggering multiple times for the same state change
    const hasAnimatedRef = React.useRef(false);

    // Reset refs when word definition changes (different word instance)
    // This handles cases where the same component instance is reused for a different word
    React.useEffect(() => {
        const currentWordId = definition?.word;
        if (wordIdRef.current !== currentWordId) {
            // Word changed, reset everything for the new word
            wordIdRef.current = currentWordId;
            prevIsKnownRef.current = isKnown;
            hasAnimatedRef.current = false;
            setAnimate(false);
        }
    }, [definition?.word, isKnown]);

    // Handle animation when isKnown state changes
    React.useEffect(() => {
        // Skip if this is the initial render (no previous state to compare)
        if (prevIsKnownRef.current === null) {
            prevIsKnownRef.current = isKnown;
            return;
        }

        // Only trigger animation if:
        // 1. Word transitions from unknown (false) to known (true)
        // 2. Word has a definition (vocabulary word, not regular text)
        // 3. We haven't already animated for this specific state change
        if (isKnown && !prevIsKnownRef.current && definition?.word && !hasAnimatedRef.current) {
            setAnimate(true);
            hasAnimatedRef.current = true;
            const timer = setTimeout(() => {
                setAnimate(false);
            }, 400); // Animation duration matches CSS animation (0.4s)
            return () => clearTimeout(timer);
        }

        // Update refs when state changes (even if no animation triggered)
        if (prevIsKnownRef.current !== isKnown) {
            prevIsKnownRef.current = isKnown;
            // Reset animation flag so it can animate again if state changes back and forth
            hasAnimatedRef.current = false;
        }
    }, [isKnown, definition?.word]);

    // If there's no definition, it's just a regular word (like "the", "a", etc.)
    if (!definition) {
        return <span className="mr-1">{word}</span>;
    }

    // If marked as known, show as normal text but clickable (maybe subtle hover)
    // If unknown, highlight it
    const baseClasses = "mr-1 cursor-pointer transition-all duration-200 rounded px-0.5 -mx-0.5 inline-block hover:scale-110 active:scale-90";
    const statusClasses = isKnown
        ? "bg-green-100 hover:bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50 border-b border-green-400 dark:border-green-700"
        : "bg-yellow-200 hover:bg-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50 border-b border-yellow-400 dark:border-yellow-700";

    const animationClass = animate ? "animate-pop" : "";

    return (
        <span
            className={`${baseClasses} ${statusClasses} ${animationClass}`}
            onClick={(e) => onClick(definition, e)}
        >
            {word}
        </span>
    );
}
