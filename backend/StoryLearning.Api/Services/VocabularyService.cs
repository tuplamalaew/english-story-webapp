using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace StoryLearning.Api.Services;

public class VocabularyService
{
    private readonly StoryLearning.Api.Data.AppDbContext _context;
    private readonly int _dailyGoal;

    public VocabularyService(StoryLearning.Api.Data.AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _dailyGoal = configuration.GetValue<int>("DailyGoal", 5); // Default to 5 if not configured
    }

    public HashSet<string> GetKnownWords()
    {
        return _context.UserVocabularies
            .Select(v => v.Word)
            .ToHashSet();
    }

    public void MarkWordAsKnown(string word)
    {
        var normalizedWord = word.ToLowerInvariant();

        // Check if already known
        if (_context.UserVocabularies.Any(v => v.Word == normalizedWord))
        {
            return;
        }

        // Add to UserVocabulary
        _context.UserVocabularies.Add(new Models.UserVocabulary
        {
            Word = normalizedWord,
            LearnedDate = DateTime.UtcNow
        });

        // Update Daily Progress
        var today = DateTime.UtcNow.Date;
        var dailyProgress = _context.DailyProgresses.FirstOrDefault(d => d.Date == today);

        if (dailyProgress == null)
        {
            dailyProgress = new Models.DailyProgress
            {
                Date = today,
                WordsLearnedCount = 0,
                IsCompleted = false
            };
            _context.DailyProgresses.Add(dailyProgress);
        }

        dailyProgress.WordsLearnedCount++;

        // Daily Goal Logic: Uses configurable daily goal
        if (dailyProgress.WordsLearnedCount >= _dailyGoal)
        {
            dailyProgress.IsCompleted = true;
        }
        
        _context.SaveChanges();
    }

    public void Reset()
    {
        _context.UserVocabularies.RemoveRange(_context.UserVocabularies);
        _context.DailyProgresses.RemoveRange(_context.DailyProgresses);
        _context.SaveChanges();
    }
}
