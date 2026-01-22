using Microsoft.EntityFrameworkCore;
using StoryLearning.Api.Data;
using StoryLearning.Api.Models;

namespace StoryLearning.Api.Services
{
    public class DashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStats> GetStatsAsync()
        {
            // 1. Total Words & Context Data
            var vocabList = await _context.UserVocabularies.ToListAsync();
            var totalWords = vocabList.Count;

            // Fetch stories to get CreatedDate and Vocab count
            var stories = await _context.Stories.Include(s => s.Vocabularies).ToListAsync();
            
            // Map: Date -> TotalVocabCount of stories created on that date
            var dailyStoryTargets = stories
                .GroupBy(s => s.CreatedDate.Date)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.Vocabularies.Count));

            // 2. Aggregate Daily Progress
            var dailyGroups = vocabList
                .GroupBy(v => v.LearnedDate.Date)
                .OrderBy(g => g.Key)
                .ToList();

            var tempStats = new List<(DateTime Date, int Count, int TotalAvailable, bool IsCompleted)>();
            var debugLog = new System.Text.StringBuilder();

            foreach (var group in dailyGroups)
            {
                var date = group.Key;
                var count = group.Count();
                var totalAvailable = 0;
                
                if (dailyStoryTargets.TryGetValue(date, out int dayTarget))
                {
                    totalAvailable = dayTarget;
                }
                
                if (totalAvailable == 0) totalAvailable = 5;
                if (totalAvailable < 5) totalAvailable = 5;
                if (totalAvailable < count) totalAvailable = count;

                debugLog.AppendLine($"[Date: {date:yyyy-MM-dd} | Count: {count} | Target: {totalAvailable} | IsComp: {count >= totalAvailable}]");
                tempStats.Add((date, count, totalAvailable, count >= totalAvailable));
            }

            var dailyStats = tempStats.Select(x => new DailyStatus(
                x.Date.ToString("yyyy-MM-dd"),
                x.IsCompleted,
                x.Count,
                x.TotalAvailable,
                dailyStoryTargets.ContainsKey(x.Date)
            )).ToList();

            // 3. Calendar Data
            var today = DateTime.UtcNow.Date;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
            var lastDayOfMonth = firstDayOfMonth.AddDays(daysInMonth - 1);

            var calendar = new List<DailyStatus>();

            for (var date = firstDayOfMonth; date <= lastDayOfMonth; date = date.AddDays(1))
            {
                var stat = dailyStats.FirstOrDefault(s => s.Date == date.ToString("yyyy-MM-dd"));
                
                // If stat matches, use its values. If not, default.
                var count = stat?.WordsLearned ?? 0;
                var total = stat?.TotalWordsAvailable ?? 5;
                var isCompleted = stat?.IsCompleted ?? false;
                var hasStory = dailyStoryTargets.ContainsKey(date);

                calendar.Add(new DailyStatus(
                    date.ToString("yyyy-MM-dd"),
                    isCompleted,
                    count,
                    total,
                    hasStory
                ));
            }

            // 4. Streak Calculation
            var streak = 0;
            var checkDate = today;

            // Simple streak logic: check today, then backwards
            // Condition: Learned at least 5 words (daily target base)
            if (dailyStats.Any(s => s.Date == today.ToString("yyyy-MM-dd") && s.WordsLearned >= 5))
            {
                streak = 1;
            }
            else if (dailyStats.Any(s => s.Date == today.AddDays(-1).ToString("yyyy-MM-dd") && s.WordsLearned >= 5))
            {
                streak = 1;
                checkDate = today.AddDays(-1);
            }
            else
            {
                // Streak is 0, but we continue to get RecentStory
                streak = 0;
            }

            if (streak > 0)
            {
                while (true)
                {
                    checkDate = checkDate.AddDays(-1);
                    var checkDateStr = checkDate.ToString("yyyy-MM-dd");
                    if (dailyStats.Any(s => s.Date == checkDateStr && s.WordsLearned >= 5))
                    {
                        streak++;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            // 5. Recent Story Logic
            RecentStory? recentStory = null;
            var latestStory = stories.OrderByDescending(s => s.LastAccessedDate).FirstOrDefault(); // Use LastAccessedDate
            if (latestStory != null)
            {
                var knownSet = vocabList.Select(v => v.Word.ToLowerInvariant()).ToHashSet();
                var storyTotal = latestStory.Vocabularies.Count;
                var storyKnown = latestStory.Vocabularies.Count(v => knownSet.Contains(v.Word.ToLowerInvariant()));
                var progress = storyTotal > 0 ? (int)((double)storyKnown / storyTotal * 100) : 0;
                
                recentStory = new RecentStory(
                    latestStory.Id,
                    latestStory.Title,
                    progress,
                    latestStory.DifficultyLevel
                );
            }

            return new DashboardStats(streak, totalWords, 3000, calendar, recentStory, debugLog.ToString());
        }
    }
}
