using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using StoryLearning.Api.Services;
using StoryLearning.Api.Models;

namespace StoryLearning.Api.Services;

public class DailyStoryService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly Random _random = new Random();

    public DailyStoryService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CreateDailyStoryIfNeeded();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DailyStoryService] Error: {ex.Message}");
            }

            // Check every hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task CreateDailyStoryIfNeeded()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<StoryLearning.Api.Data.AppDbContext>();
            var geminiService = scope.ServiceProvider.GetRequiredService<GeminiService>();

            // Check if a "system" story (IsAIGenerated = false) was created today
            // We use local time for "Today" check logic, or UTC depending on server pref. 
            // Using DateTime.UtcNow.Date for consistency.
            var today = DateTime.UtcNow.Date;
            
            var hasDailyStory = await dbContext.Stories
                .AnyAsync(s => s.CreatedDate.Date == today && !s.IsAIGenerated);

            if (!hasDailyStory)
            {
                Console.WriteLine("[DailyStoryService] No daily story found for today. Generating...");
                await GenerateAndSaveDailyStory(dbContext, geminiService);
            }
            else 
            {
                Console.WriteLine("[DailyStoryService] Daily story already exists for today.");
            }
        }
    }

    private async Task GenerateAndSaveDailyStory(StoryLearning.Api.Data.AppDbContext dbContext, GeminiService geminiService)
    {
        // Randomize parameters
        var topics = new[] { "A hidden discovery", "Future technology", "Ancient history", "Nature's wonders", "Space exploration", "A valuable life lesson", "Unexpected friendship", "Culinary adventure", "Mystery of the lost city" };
        var genres = new[] { "Adventure", "Fantasy", "Sci-Fi", "Mystery", "History", "Comedy", "Drama", "Biography" };
        var difficulties = new[] { "A2", "B1", "B2" };

        var topic = topics[_random.Next(topics.Length)];
        var genre = genres[_random.Next(genres.Length)];
        var difficulty = difficulties[_random.Next(difficulties.Length)];
        var vocabCount = 10;

        Console.WriteLine($"[DailyStoryService] Params: {topic} | {genre} | {difficulty}");

        try 
        {
            var generatedResult = await geminiService.GenerateStoryAsync(topic, difficulty, vocabCount, genre);

            var story = new Story
            {
                Title = generatedResult.Title,
                TitleTranslation = generatedResult.TitleTranslation,
                Content = generatedResult.Content,
                Translation = generatedResult.Translation,
                Genre = genre,
                DifficultyLevel = difficulty,
                CreatedDate = DateTime.UtcNow,
                IsAIGenerated = false // Explicitly false as requested
            };

            // Map vocabulary
            foreach (var item in generatedResult.Vocabulary)
            {
                story.Vocabularies.Add(new Vocabulary
                {
                    Word = item.Word,
                    Translation = item.Translation,
                    Definition = item.Definition,
                    PartOfSpeech = item.PartOfSpeech,
                    ExampleSentence = item.ExampleSentence,
                    ExampleTranslation = item.ExampleTranslation
                });
            }

            dbContext.Stories.Add(story);
            await dbContext.SaveChangesAsync();
            
            Console.WriteLine($"[DailyStoryService] Daily story '{story.Title}' created successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DailyStoryService] Generation failed: {ex.Message}");
        }
    }
}
