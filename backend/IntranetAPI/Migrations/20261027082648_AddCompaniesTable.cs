using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntranetAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCompaniesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Companies",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupNewCompanies_CompanyId",
                table: "GroupNewCompanies",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_GroupNewCompanies_Companies_CompanyId",
                table: "GroupNewCompanies",
                column: "CompanyId",
                principalSchema: "dbo",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupNewCompanies_Companies_CompanyId",
                table: "GroupNewCompanies");

            migrationBuilder.DropTable(
                name: "Companies",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_GroupNewCompanies_CompanyId",
                table: "GroupNewCompanies");
        }
    }
}
