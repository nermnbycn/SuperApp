using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntranetAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixApplicationUserImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(@"
        IF COL_LENGTH('dbo.AspNetUsers', 'ImageUrl') IS NULL
        BEGIN
            ALTER TABLE dbo.AspNetUsers
            ADD ImageUrl NVARCHAR(MAX) NULL;
        END
    ");

}

        /// <inheritdoc />
       protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(@"
        IF COL_LENGTH('dbo.AspNetUsers', 'ImageUrl') IS NOT NULL
        BEGIN
            ALTER TABLE dbo.AspNetUsers
            DROP COLUMN ImageUrl;
        END
    ");
}
    }
}
