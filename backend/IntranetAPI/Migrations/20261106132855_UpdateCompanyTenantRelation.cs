using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntranetAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCompanyTenantRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "dbo",
                table: "Companies",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "dbo",
                table: "Companies",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                schema: "dbo",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TenantId",
                schema: "dbo",
                table: "Companies",
                column: "TenantId");
                migrationBuilder.Sql(@"
    UPDATE dbo.Companies
    SET TenantId = 1;
");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Tenants_TenantId",
                schema: "dbo",
                table: "Companies",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Tenants_TenantId",
                schema: "dbo",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Companies_TenantId",
                schema: "dbo",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "dbo",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "dbo",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "dbo",
                table: "Companies");
        }
    }
}
