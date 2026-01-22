using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StoryLearning.Api.Models
{
    public class Story
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;

        public string TitleTranslation { get; set; } = string.Empty;
        
        public string Translation { get; set; } = string.Empty;
        
        public string DifficultyLevel { get; set; } = "Easy";

        public string Genre { get; set; } = "General";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime LastAccessedDate { get; set; } = DateTime.UtcNow;

        public bool IsAIGenerated { get; set; } = false;

        public string ImageUrl { get; set; } = string.Empty;
        
        public List<Vocabulary> Vocabularies { get; set; } = new();
    }
}
