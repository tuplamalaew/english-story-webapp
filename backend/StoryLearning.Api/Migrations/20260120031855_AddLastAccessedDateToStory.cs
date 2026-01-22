using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoryLearning.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLastAccessedDateToStory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Liked",
                table: "Stories");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAccessedDate",
                table: "Stories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastAccessedDate",
                table: "Stories");

            migrationBuilder.AddColumn<bool>(
                name: "Liked",
                table: "Stories",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
