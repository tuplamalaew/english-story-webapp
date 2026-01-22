using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoryLearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLikedToStory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Liked",
                table: "Stories",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Liked",
                table: "Stories");
        }
    }
}
