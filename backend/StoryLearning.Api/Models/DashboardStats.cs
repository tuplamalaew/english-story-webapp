namespace StoryLearning.Api.Models
{
    public record DashboardStats(
        int CurrentStreak,
        int TotalWordsLearned,
        int GoalTarget, // 3000
        List<DailyStatus> Calendar,
        RecentStory? LastPlayedStory,
        string DebugInfo = ""
    );

    public record DailyStatus(
        string Date, // YYYY-MM-DD
        bool IsCompleted,
        int WordsLearned,
        int TotalWordsAvailable,
        bool HasStory = false
    );

    public record RecentStory(
        int Id,
        string Title,
        int ProgressPercent,
        string Difficulty
    );
}
