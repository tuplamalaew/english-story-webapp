using System.ComponentModel.DataAnnotations;

namespace StoryLearning.Api.Models
{
    public class Vocabulary
    {
        public int Id { get; set; }
        
        [Required]
        public string Word { get; set; } = string.Empty;
        
        public string Translation { get; set; } = string.Empty;
        
        public string Definition { get; set; } = string.Empty;
        
        public string ExampleSentence { get; set; } = string.Empty;

        public string ExampleTranslation { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;
        
        public string DifficultyLevel { get; set; } = string.Empty;

        public string PartOfSpeech { get; set; } = string.Empty;
        
        public int StoryId { get; set; }
        public Story? Story { get; set; }
    }
}
