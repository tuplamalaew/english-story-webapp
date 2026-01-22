using Microsoft.EntityFrameworkCore;
using StoryLearning.Api.Models;

namespace StoryLearning.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Story> Stories { get; set; }
        public DbSet<Vocabulary> Vocabularies { get; set; }
        public DbSet<UserVocabulary> UserVocabularies { get; set; }
        public DbSet<DailyProgress> DailyProgresses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Vocabulary>()
                .HasOne(v => v.Story)
                .WithMany(s => s.Vocabularies)
                .HasForeignKey(v => v.StoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
