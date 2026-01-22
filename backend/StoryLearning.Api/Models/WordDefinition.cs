namespace StoryLearning.Api.Models;

public class WordDefinition
{
    public string Id { get; set; } = string.Empty;
    public string Word { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
    public string Original { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public string PartOfSpeech { get; set; } = string.Empty;
    public string Example { get; set; } = string.Empty;
    public string ExampleTranslation { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string StoryTitle { get; set; } = string.Empty;
}
