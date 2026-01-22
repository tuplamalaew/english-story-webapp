"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StreakStats from '../components/Dashboard/StreakStats';
import GoalProgress from '../components/Dashboard/GoalProgress';
import CalendarHeatmap from '../components/Dashboard/CalendarHeatmap';
import ProductivityChart from '../components/Dashboard/ProductivityChart';
import { ThemeToggle } from '../components/ThemeToggle';
import { API_BASE_URL } from '../lib/config';

interface RecentStory {
  id: number;
  title: string;
  progressPercent: number;
  difficulty: string;
}

interface DashboardStats {
  currentStreak: number;
  totalWordsLearned: number;
  goalTarget: number;
  calendar: {
    date: string;
    isCompleted: boolean;
    wordsLearned: number;
    totalWordsAvailable: number;
    hasStory: boolean;
  }[];
  lastPlayedStory: RecentStory | null;
  debugInfo: string;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const handleDateClick = (date: string) => {
    router.push(`/learn?date=${date}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Fallback data if null
  const data = stats || {
    currentStreak: 0,
    totalWordsLearned: 0,
    goalTarget: 3000,
    calendar: [],
    lastPlayedStory: null,
    debugInfo: ""
  };

  // Calculate today's count for StreakStats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = data.calendar.find(d => d.date === todayStr);
  const todayCount = todayEntry ? todayEntry.wordsLearned : 0;

  return (
    <div className="w-full  space-y-8 overflow-y-auto p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-white font-cute">
              Welcome back, Traveler! 👋
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Ready to continue your English adventure?
            </p>
          </div>
        </div>

        {/* User Profile Widget */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-2 pr-6 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Traveler</span>
            <span className="text-xs text-zinc-500">Level 5</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-8">
          <GoalProgress
            learned={data.totalWordsLearned}
            target={data.goalTarget}
          />
          {/* Productivity Graph */}
          <div className="h-80">
            <ProductivityChart />
          </div>

          {/* Continue Adventure Block */}
          {data.lastPlayedStory && (
            <div className="bg-zinc-900 border border-teal-500/30 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_20px_rgba(20,184,166,0.1)] hover:shadow-[0_0_30px_rgba(20,184,166,0.2)] transition-shadow">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

              <div className="flex items-center gap-2 mb-4 text-white relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                <h3 className="font-bold tracking-wide text-sm uppercase text-teal-400">Continue Adventure</h3>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div className="flex-1 w-full max-w-lg">
                  <h4 className="text-white text-xl font-bold font-cute mb-1 truncate">{data.lastPlayedStory.title}</h4>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
                    <span className={`px-2 py-0.5 rounded text-xs border border-zinc-700/50 font-bold ${(() => {
                      const level = data.lastPlayedStory.difficulty ?? '';
                      // Map Display
                      const displayMap: { [key: string]: string } = { 'Easy': 'A1', 'Medium': 'B2', 'Hard': 'C1' };
                      const display = displayMap[level] || level;

                      // Map Color matches learn/page.tsx
                      if (['A1', 'A2', 'Easy'].includes(display)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
                      if (['B1', 'B2', 'Medium'].includes(display)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
                      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
                    })()
                      }`}>
                      {(() => {
                        const level = data.lastPlayedStory.difficulty ?? '';
                        const displayMap: { [key: string]: string } = { 'Easy': 'A1', 'Medium': 'B2', 'Hard': 'C1' };
                        return displayMap[level] || level;
                      })()}
                    </span>
                    <span>•</span>
                    <span>{data.lastPlayedStory.progressPercent}% Completed</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${data.lastPlayedStory.progressPercent}%` }}></div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/learn?id=${data.lastPlayedStory?.id}`)}
                  className="whitespace-nowrap bg-teal-500 hover:bg-teal-400 text-zinc-900 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-teal-500/20 active:scale-95"
                >
                  Resume Journey
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Stats) */}
        <div className="space-y-8">

          <StreakStats
            streak={data.currentStreak}
            totalWords={data.totalWordsLearned}
            todayCount={todayCount}
          />

          {/* Calendar */}
          <CalendarHeatmap calendar={data.calendar} onDateClick={handleDateClick} />

          {/* Daily Tip Widget */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Daily Tip 💡</h3>
            <p className="text-white/90 text-sm">
              Standardize your practice time to build a consistent habit. Even 5 minutes count!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
