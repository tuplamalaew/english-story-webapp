using System.ComponentModel.DataAnnotations;

namespace StoryLearning.Api.Models
{
    public class UserVocabulary
    {
        public int Id { get; set; }

        [Required]
        public string Word { get; set; } = string.Empty; // Store lowercase word

        public DateTime LearnedDate { get; set; } = DateTime.UtcNow;
    }
}
