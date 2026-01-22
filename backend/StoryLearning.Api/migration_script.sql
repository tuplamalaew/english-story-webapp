IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118145506_InitialCreate'
)
BEGIN
    CREATE TABLE [Stories] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [Translation] nvarchar(max) NOT NULL,
        [DifficultyLevel] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Stories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118145506_InitialCreate'
)
BEGIN
    CREATE TABLE [Vocabularies] (
        [Id] int NOT NULL IDENTITY,
        [Word] nvarchar(max) NOT NULL,
        [Translation] nvarchar(max) NOT NULL,
        [Definition] nvarchar(max) NOT NULL,
        [ExampleSentence] nvarchar(max) NOT NULL,
        [StoryId] int NOT NULL,
        CONSTRAINT [PK_Vocabularies] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Vocabularies_Stories_StoryId] FOREIGN KEY ([StoryId]) REFERENCES [Stories] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118145506_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Vocabularies_StoryId] ON [Vocabularies] ([StoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118145506_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260118145506_InitialCreate', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118151233_AddVocabularyFields'
)
BEGIN
    ALTER TABLE [Vocabularies] ADD [Category] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118151233_AddVocabularyFields'
)
BEGIN
    ALTER TABLE [Vocabularies] ADD [PartOfSpeech] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118151233_AddVocabularyFields'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260118151233_AddVocabularyFields', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118153302_AddUserTracking'
)
BEGIN
    CREATE TABLE [DailyProgresses] (
        [Id] int NOT NULL IDENTITY,
        [Date] datetime2 NOT NULL,
        [IsCompleted] bit NOT NULL,
        [WordsLearnedCount] int NOT NULL,
        CONSTRAINT [PK_DailyProgresses] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118153302_AddUserTracking'
)
BEGIN
    CREATE TABLE [UserVocabularies] (
        [Id] int NOT NULL IDENTITY,
        [Word] nvarchar(max) NOT NULL,
        [LearnedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_UserVocabularies] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260118153302_AddUserTracking'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260118153302_AddUserTracking', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119015743_AddCreatedDateToStory'
)
BEGIN
    ALTER TABLE [Stories] ADD [CreatedDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119015743_AddCreatedDateToStory'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260119015743_AddCreatedDateToStory', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119042221_AddExampleTranslation'
)
BEGIN
    ALTER TABLE [Vocabularies] ADD [ExampleTranslation] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119042221_AddExampleTranslation'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260119042221_AddExampleTranslation', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119050202_AddLikedToStory'
)
BEGIN
    ALTER TABLE [Stories] ADD [Liked] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119050202_AddLikedToStory'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260119050202_AddLikedToStory', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120031855_AddLastAccessedDateToStory'
)
BEGIN
    DECLARE @var sysname;
    SELECT @var = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Stories]') AND [c].[name] = N'Liked');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [Stories] DROP CONSTRAINT [' + @var + '];');
    ALTER TABLE [Stories] DROP COLUMN [Liked];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120031855_AddLastAccessedDateToStory'
)
BEGIN
    ALTER TABLE [Stories] ADD [LastAccessedDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120031855_AddLastAccessedDateToStory'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260120031855_AddLastAccessedDateToStory', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120042526_AddImageUrlToStory'
)
BEGIN
    ALTER TABLE [Stories] ADD [ImageUrl] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120042526_AddImageUrlToStory'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260120042526_AddImageUrlToStory', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120075729_AddGenre'
)
BEGIN
    ALTER TABLE [Stories] ADD [Genre] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120075729_AddGenre'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260120075729_AddGenre', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260121103208_AddIsAIGenerated'
)
BEGIN
    ALTER TABLE [Stories] ADD [IsAIGenerated] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260121103208_AddIsAIGenerated'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260121103208_AddIsAIGenerated', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260121103716_AddTitleTranslation'
)
BEGIN
    ALTER TABLE [Stories] ADD [TitleTranslation] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260121103716_AddTitleTranslation'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260121103716_AddTitleTranslation', N'9.0.1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260121123542_AddDifficultyToVocabulary'
)
BEGIN
    ALTER TABLE [Vocabularies] ADD [DifficultyLevel] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260121123542_AddDifficultyToVocabulary'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260121123542_AddDifficultyToVocabulary', N'9.0.1');
END;

COMMIT;
GO

