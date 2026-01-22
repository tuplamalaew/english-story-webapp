using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoryLearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTitleTranslation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TitleTranslation",
                table: "Stories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TitleTranslation",
                table: "Stories");
        }
    }
}
