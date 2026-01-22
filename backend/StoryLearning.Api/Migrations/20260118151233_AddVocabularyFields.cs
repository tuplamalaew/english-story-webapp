using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoryLearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVocabularyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Vocabularies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PartOfSpeech",
                table: "Vocabularies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Vocabularies");

            migrationBuilder.DropColumn(
                name: "PartOfSpeech",
                table: "Vocabularies");
        }
    }
}
