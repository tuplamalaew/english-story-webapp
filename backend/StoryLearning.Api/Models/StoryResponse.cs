namespace StoryLearning.Api.Models;

public class StoryResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TitleTranslation { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string DifficultyLevel { get; set; } = "Easy";
    public string Genre { get; set; } = "General";
    public string StoryText { get; set; } = string.Empty;
    public string StoryTranslation { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAIGenerated { get; set; }
    public List<WordDefinition> Vocabulary { get; set; } = new();
}
