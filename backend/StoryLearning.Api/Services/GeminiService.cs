using System.Text.Json;
using System.Text.RegularExpressions;
using Mscc.GenerativeAI;
using Microsoft.Extensions.Logging;

namespace StoryLearning.Api.Services;

public class GeminiService
{
    private readonly string _apiKey;
    private readonly GenerativeModel? _model;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(string apiKey, ILogger<GeminiService> logger)
    {
        _apiKey = apiKey;
        _logger = logger;
        if (!string.IsNullOrEmpty(apiKey))
        {
            var googleAI = new GoogleAI(apiKey);
            _model = googleAI.GenerativeModel("gemini-3-flash-preview");
        }
    }

    public async Task<GeneratedStoryResult> GenerateStoryAsync(
        string topic, 
        string difficulty, 
        int vocabCount, 
        string genre,
        List<string>? knownWords = null)
    {
        _logger.LogInformation("Starting generation for topic: {Topic}", topic);
        _logger.LogInformation("Difficulty: {Difficulty}, VocabCount: {VocabCount}", difficulty, vocabCount);
        _logger.LogDebug("Known words to exclude: {Count}", knownWords?.Count ?? 0);

        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Gemini API key is not configured.");
        }

        if (_model == null)
        {
            throw new InvalidOperationException("Gemini model is not initialized");
        }

        var prompt = BuildPrompt(topic, difficulty, vocabCount, genre, knownWords);
        
        _logger.LogInformation("Calling Gemini API...");
        
        try 
        {
            var response = await _model.GenerateContent(prompt);
            var text = response.Text ?? "";

            _logger.LogInformation("Got response, length: {Length}", text.Length);
            
            if (string.IsNullOrEmpty(text))
            {
                throw new InvalidOperationException("Gemini returned empty response.");
            }

            return ParseResponse(text);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating story");
            throw;
        }
    }

    private static (int min, int max) GetWordCountForDifficulty(string difficulty)
    {
        return difficulty.ToUpper() switch
        {
            "A1" => (50, 100),
            "A2" => (100, 200),
            "B1" => (200, 350),
            "B2" => (350, 500),
            "C1" => (500, 800),
            "C2" => (500, 800),
            _ => (200, 350) // Default to B1
        };
    }

    private static string GetStyleForDifficulty(string difficulty)
    {
        return difficulty.ToUpper() switch
        {
            "A1" => "Use very simple sentences. Focus on daily routines. No complex grammar.",
            "A2" => "Use simple storyline with basic dialogue. Short paragraphs.",
            "B1" => "Create a clear plot with emotions. Use moderate vocabulary.",
            "B2" => "Use complex content with idioms and technical terms allowed.",
            "C1" or "C2" => "Use sophisticated language with nuanced expressions.",
            _ => "Create a clear plot with emotions. Use moderate vocabulary."
        };
    }

    private string BuildPrompt(string topic, string difficulty, int vocabCount, string genre, List<string>? knownWords)
    {
        var (minWords, maxWords) = GetWordCountForDifficulty(difficulty);
        var style = GetStyleForDifficulty(difficulty);
        
        var knownWordsSection = "";
        if (knownWords != null && knownWords.Count > 0)
        {
            var wordList = string.Join(", ", knownWords.Take(50)); // Limit to 50 words
            knownWordsSection = $@"
EXCLUDE THESE WORDS (user already knows them):
{wordList}
Do NOT include any of these words in the vocabulary list.";
        }

        return $@"You are a creative English learning content generator for Thai learners.

TASK: Create a short story for language learners.

REQUIREMENTS:
- Topic: {topic}
- Genre: {genre}
- CEFR Level: {difficulty}
- Story length: {minWords}-{maxWords} words
- Style: {style}
- Vocabulary count: {vocabCount} words
{knownWordsSection}

OUTPUT FORMAT (JSON only, no markdown):
{{
  ""title"": ""Story title"",
  ""titleTranslation"": ""Thai translation of the title"",
  ""content"": ""Full story text with \\n for paragraphs"",
  ""translation"": ""Thai translation of the story"",
  ""vocabulary"": [
    {{
      ""word"": ""exact word as it appears in story"",
      ""translation"": ""Thai translation"",
      ""definition"": ""English definition"",
      ""partOfSpeech"": ""noun/verb/adjective/adverb"",
      ""category"": ""Theme category"",
      ""difficultyLevel"": ""CEFR Level (A1-C2)"",
      ""exampleSentence"": ""Sentence from the story containing this word"",
      ""exampleTranslation"": ""Thai translation of example""
    }}
  ]
}}

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no code blocks, no extra text
2. Vocabulary array must have exactly {vocabCount} items
3. Each vocabulary word MUST appear EXACTLY as written in the story content
4. Use the EXACT form of the word (e.g., if story has ""running"", vocabulary should have ""running"" not ""run"")
5. Example sentences should be actual sentences from the story
6. Story must be {minWords}-{maxWords} words long
7. ALL vocabulary words MUST be from the Oxford 3000 word list (most important English words for learners)";
    }

    private GeneratedStoryResult ParseResponse(string responseText)
    {
        Console.WriteLine($"[GeminiService] Parsing response...");

        var cleanJson = responseText.Trim();

        // Remove markdown code blocks if present
        var match = Regex.Match(cleanJson, @"\{[\s\S]*\}", RegexOptions.Singleline);
        
        if (match.Success)
        {
            cleanJson = match.Value;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        try 
        {
            var result = JsonSerializer.Deserialize<GeneratedStoryResult>(cleanJson, options);
            
            if (result == null) 
            {
                throw new InvalidOperationException("Deserialized result is null");
            }
            
            Console.WriteLine($"[GeminiService] Successfully parsed: {result.Title}");
            Console.WriteLine($"[GeminiService] Vocabulary count: {result.Vocabulary?.Count ?? 0}");

            // Normalize content: Remove \r and ensure single \n for paragraphs
            if (!string.IsNullOrEmpty(result.Content))
            {
                result.Content = result.Content.Replace("\r\n", "\n").Replace("\r", "\n");
                while (result.Content.Contains("\n\n"))
                {
                    result.Content = result.Content.Replace("\n\n", "\n");
                }
            }

            return result;
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"[GeminiService] JSON Error: {ex.Message}");
            Console.WriteLine($"[GeminiService] Content: {cleanJson.Substring(0, Math.Min(500, cleanJson.Length))}");
            throw new InvalidOperationException("Failed to parse Gemini response", ex);
        }
    }
}

public class GeneratedStoryResult
{
    public string Title { get; set; } = "";
    public string TitleTranslation { get; set; } = "";
    public string Content { get; set; } = "";
    public string Translation { get; set; } = "";
    public List<VocabularyItem> Vocabulary { get; set; } = new();
}

public class VocabularyItem
{
    public string Word { get; set; } = "";
    public string Translation { get; set; } = "";
    public string Definition { get; set; } = "";
    public string PartOfSpeech { get; set; } = "";
    public string Category { get; set; } = "";
    public string DifficultyLevel { get; set; } = ""; // New field
    public string ExampleSentence { get; set; } = "";
    public string ExampleTranslation { get; set; } = "";
}