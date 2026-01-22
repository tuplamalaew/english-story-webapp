using StoryLearning.Api.Models;
using StoryLearning.Api.Services;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddScoped<VocabularyService>();
builder.Services.AddScoped<DashboardService>();

// Add GeminiService for AI story generation
var geminiApiKey = builder.Configuration["GeminiApiKey"] ?? "";
builder.Services.AddSingleton<GeminiService>(sp => 
{
    var logger = sp.GetRequiredService<ILogger<GeminiService>>();
    logger.LogInformation("Loading Gemini API Key: {Status}", 
        string.IsNullOrEmpty(geminiApiKey) ? "EMPTY" : $"Found ({geminiApiKey.Length} chars)");
    return new GeminiService(geminiApiKey, logger);
});

// Add Database Context
builder.Services.AddDbContext<StoryLearning.Api.Data.AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://learneng.runasp.net",
                "https://learneng.runasp.net"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// Register Daily Story Background Service
builder.Services.AddHostedService<DailyStoryService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
}
else
{
    // Production: Return generic error response
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\": \"An unexpected error occurred. Please try again later.\"}");
        });
    });
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<StoryLearning.Api.Data.AppDbContext>();
    // StoryLearning.Api.Data.DbInitializer.Initialize(context); // Optional: Initialize if needed
}

app.UseCors("AllowFrontend");

// Handle Next.js RSC requests - return empty response instead of 404
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    if (path.Contains("__next.") && path.EndsWith(".txt"))
    {
        context.Response.StatusCode = 200;
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync("");
        return;
    }
    await next();
});

app.UseDefaultFiles(); // Enable serving index.html from subdirectories (e.g., /learn -> /learn/index.html)
app.UseStaticFiles(); // Enable serving static files from wwwroot

app.UseHttpsRedirection();

// HEALTH CHECK ENDPOINT
app.MapGet("/api/health", async (StoryLearning.Api.Data.AppDbContext db) =>
{
    try 
    {
        bool canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new 
        { 
            status = "healthy", 
            database = canConnect ? "connected" : "disconnected",
            time = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.ToString(), statusCode: 500);
    }
});

app.MapPost("/api/upload", async (IFormFile file, IWebHostEnvironment env) =>
{
    if (file == null || file.Length == 0)
        return Results.BadRequest("No file uploaded.");

    // Ensure directory exists
    var uploadPath = Path.Combine(env.WebRootPath, "uploads");
    if (!Directory.Exists(uploadPath))
        Directory.CreateDirectory(uploadPath);

    // Generate unique filename
    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
    var filePath = Path.Combine(uploadPath, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    // Return relative URL
    var fileUrl = $"/uploads/{fileName}";
    return Results.Ok(new { url = fileUrl });
})
.WithName("UploadImage")
.DisableAntiforgery(); // Required for IFormFile in Minimal API sometimes, simpler for now

app.MapPut("/api/story/{id}/image", async (int id, [Microsoft.AspNetCore.Mvc.FromBody] ImageUpdateRequest request, StoryLearning.Api.Data.AppDbContext db) =>
{
    var story = await db.Stories.FindAsync(id);
    if (story == null) return Results.NotFound();

    story.ImageUrl = request.ImageUrl;
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Image updated successfully", imageUrl = story.ImageUrl });
})
.WithName("UpdateStoryImage");

app.MapGet("/api/story", async (StoryLearning.Api.Data.AppDbContext db, [Microsoft.AspNetCore.Mvc.FromQuery] int? id, [Microsoft.AspNetCore.Mvc.FromQuery] DateTime? date) =>
{
    var query = db.Stories.Include(s => s.Vocabularies).AsQueryable();

    StoryLearning.Api.Models.Story? story = null;

    if (id.HasValue)
    {
        story = await query.FirstOrDefaultAsync(s => s.Id == id.Value);
    }
    else if (date.HasValue)
    {
        story = await query.FirstOrDefaultAsync(s => s.CreatedDate.Date == date.Value.Date);
    }
    
    // Fallback: Latest story if no specific lookup
    if (story == null && !id.HasValue && !date.HasValue)
    {
         story = await query.OrderByDescending(s => s.CreatedDate).FirstOrDefaultAsync();
         // If still null (empty DB), try any
         if (story == null) story = await db.Stories.Include(s => s.Vocabularies).FirstOrDefaultAsync();
    }

    if (story == null)
    {
        return Results.NotFound(new { message = "No story found" });
    }

    // Update Last Accessed Date
    story.LastAccessedDate = DateTime.UtcNow;
    await db.SaveChangesAsync();

    var response = new StoryResponse
    {
        Id = story.Id,
        Title = story.Title,
        TitleTranslation = story.TitleTranslation,
        CreatedDate = story.CreatedDate,
        DifficultyLevel = story.DifficultyLevel,
        Genre = story.Genre,
        StoryText = story.Content,
        StoryTranslation = story.Translation,
        ImageUrl = story.ImageUrl,
        IsAIGenerated = story.IsAIGenerated,
        Vocabulary = story.Vocabularies
            .GroupBy(v => v.Word.ToLowerInvariant())
            .Select(g => g.First())
            .Select(v => new WordDefinition
        {
            Id = v.Id.ToString(),
            Word = v.Word,
            Translation = v.Translation,
            Original = v.Word,
            Category = v.Category,
            DifficultyLevel = v.DifficultyLevel,
            PartOfSpeech = v.PartOfSpeech,
            Example = v.ExampleSentence,
            ExampleTranslation = v.ExampleTranslation,
            Definition = v.Definition
        }).ToList()
    };
    
    return Results.Ok(response);
})
.WithName("GetStory");

app.MapGet("/api/stories", async (StoryLearning.Api.Data.AppDbContext db) =>
{
    var storyEntities = await db.Stories
        .OrderByDescending(s => s.CreatedDate)
        .ToListAsync();

    var stories = storyEntities.Select(s => new StorySummaryResponse
    {
        Id = s.Id,
        Title = s.Title,
        DifficultyLevel = s.DifficultyLevel,
        Genre = s.Genre,
        CreatedDate = s.CreatedDate,
        IsAIGenerated = s.IsAIGenerated,
        Liked = false
    }).ToList();

    return Results.Ok(stories);
})
.WithName("GetStories");



app.MapPost("/api/story/generate", async (StoryLearning.Api.Data.AppDbContext db, GeminiService geminiService, [Microsoft.AspNetCore.Mvc.FromBody] GenerateStoryRequest request) =>
{
    // Input Validation
    var validDifficulties = new[] { "A1", "A2", "B1", "B2", "C1", "C2", "Random" };
    var validGenres = new[] { "Adventure", "Fantasy", "Sci-Fi", "Mystery", "Horror", "Romance", "History", "Comedy", "Drama", "Crime", "Biography", "Random" };
    
    var difficulty = request.Difficulty ?? "B1";
    var genre = request.Genre ?? "Adventure";
    var vocabCount = request.VocabCount;
    
    if (!validDifficulties.Contains(difficulty))
        return Results.BadRequest(new { error = $"Invalid difficulty. Must be one of: {string.Join(", ", validDifficulties)}" });
    
    if (!validGenres.Contains(genre))
        return Results.BadRequest(new { error = $"Invalid genre. Must be one of: {string.Join(", ", validGenres)}" });
    
    if (vocabCount < 5 || vocabCount > 50)
        return Results.BadRequest(new { error = "VocabCount must be between 5 and 50" });

    try
    {
        // Use Gemini AI to generate the story
        var generatedResult = await geminiService.GenerateStoryAsync(
            request.Topic ?? "a random adventure",
            difficulty,
            vocabCount,
            genre,
            request.KnownWords // Pass known words to exclude
        );

        // Create story entity from generated result
        var story = new StoryLearning.Api.Models.Story
        {
            Title = generatedResult.Title,
            TitleTranslation = generatedResult.TitleTranslation,
            CreatedDate = DateTime.UtcNow,
            DifficultyLevel = difficulty,
            Genre = genre,
            IsAIGenerated = true,
            Content = generatedResult.Content,
            Translation = generatedResult.Translation,
            Vocabularies = generatedResult.Vocabulary.Select(v => new StoryLearning.Api.Models.Vocabulary
            {
                Word = v.Word,
                Translation = v.Translation,
                Definition = v.Definition,
                ExampleSentence = v.ExampleSentence,
                ExampleTranslation = v.ExampleTranslation,
                Category = v.Category, 
                DifficultyLevel = v.DifficultyLevel,
                PartOfSpeech = v.PartOfSpeech
            }).ToList()
        };

        db.Stories.Add(story);
        await db.SaveChangesAsync();

        return Results.Ok(new { message = "Story generated successfully", id = story.Id });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[GenerateStory] Error: {ex.Message}");
        return Results.Problem(
            detail: "Failed to generate story. Please try again later.",
            statusCode: 500
        );
    }
})
.WithName("GenerateStory");

// Vocabulary APIs
app.MapGet("/api/vocabulary/known", (VocabularyService vocabService) =>
{
    var knownWords = vocabService.GetKnownWords();
    return Results.Ok(knownWords.ToList());
})
.WithName("GetKnownWords");

app.MapPost("/api/vocabulary/mark", async (StoryLearning.Api.Data.AppDbContext db, VocabularyService vocabService, [Microsoft.AspNetCore.Mvc.FromBody] WordIdRequest request) =>
{
    vocabService.MarkWordAsKnown(request.WordId);
    return Results.Ok(new { success = true });
})
.WithName("MarkWordAsKnown");

app.MapGet("/api/vocabulary/my-list-details", async (StoryLearning.Api.Data.AppDbContext db) =>
{
    var userWords = await db.UserVocabularies.ToListAsync();
    var wordStrings = userWords.Select(uw => uw.Word.ToLowerInvariant()).ToHashSet();

    // Fetch all vocabularies first (dataset is small enough for now)
    var allVocab = await db.Vocabularies.Include(v => v.Story).ToListAsync();

    // Filter in memory to avoid EF Core translation issues with ToLowerInvariant() / Contains
    var vocabDetails = allVocab
        .Where(v => wordStrings.Contains(v.Word.ToLowerInvariant()))
        .GroupBy(v => v.Word.ToLowerInvariant())
        .Select(g => g.First())
        .Select(v => new WordDefinition
        {
            Id = v.Id.ToString(),
            Word = v.Word,
            Translation = v.Translation,
            Original = v.Word,
            Category = v.Category,
            DifficultyLevel = v.DifficultyLevel,
            PartOfSpeech = v.PartOfSpeech,
            Example = v.ExampleSentence,
            ExampleTranslation = v.ExampleTranslation,
            Definition = v.Definition,
            StoryTitle = v.Story?.Title ?? "Unknown Story"
        })
        .ToList();

    return Results.Ok(vocabDetails);
})
.WithName("GetMyVocabularyDetails");

// Dashboard APIs
app.MapGet("/api/dashboard", async (DashboardService dashboardService) =>
{
    var stats = await dashboardService.GetStatsAsync();
    return Results.Ok(stats);
})
.WithName("GetDashboardStats");

app.MapPost("/api/reset", (VocabularyService vocabService) =>
{
    vocabService.Reset();
    return Results.Ok(new { message = "Progress reset successfully" });
})
.WithName("ResetProgress");

app.MapFallbackToFile("index.html");

app.Run();

record WordIdRequest(string WordId);
record ImageUpdateRequest(string ImageUrl);
record GenerateStoryRequest(string Topic, string Difficulty, int VocabCount, string Genre, List<string>? KnownWords = null);
