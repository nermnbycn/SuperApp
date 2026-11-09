
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntranetAPI.Migrations
{
    public partial class AddCelebrationMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CelebrationMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(
                        type: "uniqueidentifier",
                        nullable: false),

                    SenderId = table.Column<string>(
                        type: "nvarchar(450)",
                        nullable: false),

                    ReceiverId = table.Column<string>(
                        type: "nvarchar(450)",
                        nullable: false),

                    Message = table.Column<string>(
                        type: "nvarchar(2000)",
                        maxLength: 2000,
                        nullable: false),

                    Type = table.Column<string>(
                        type: "nvarchar(20)",
                        maxLength: 20,
                        nullable: false),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime2",
                        nullable: false),

                    IsRead = table.Column<bool>(
                        type: "bit",
                        nullable: false),

                    ReactionEmoji = table.Column<string>(
                        type: "nvarchar(20)",
                        maxLength: 20,
                        nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_CelebrationMessages",
                        x => x.Id);

                    table.ForeignKey(
                        name: "FK_CelebrationMessages_AspNetUsers_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);

                    table.ForeignKey(
                        name: "FK_CelebrationMessages_AspNetUsers_SenderId",
                        column: x => x.SenderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CelebrationMessages_ReceiverId",
                table: "CelebrationMessages",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_CelebrationMessages_SenderId",
                table: "CelebrationMessages",
                column: "SenderId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CelebrationMessages");
        }
    }
}
