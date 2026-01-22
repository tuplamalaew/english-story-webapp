namespace StoryLearning.Api.Models;

public class StorySummaryResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = "Easy";
    public DateTime CreatedDate { get; set; }
    public bool IsActive { get; set; } // For frontend knowing which is selected (mostly client logic, but good to have)
    public string Genre { get; set; } = "General";
    public bool IsAIGenerated { get; set; }
    public bool Liked { get; set; } // Placeholder for future feature
}
