using System.ComponentModel.DataAnnotations;

namespace StoryLearning.Api.Models
{
    public class DailyProgress
    {
        public int Id { get; set; }

        public DateTime Date { get; set; } // Store simplified date (midnight UTC)

        public bool IsCompleted { get; set; }

        public int WordsLearnedCount { get; set; }
    }
}
