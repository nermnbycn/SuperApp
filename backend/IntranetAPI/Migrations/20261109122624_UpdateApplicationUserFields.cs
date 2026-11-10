using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntranetAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateApplicationUserFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(@"
        IF COL_LENGTH('dbo.AspNetUsers', 'CollarType') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD CollarType NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'CreateTime') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD CreateTime DATETIME2 NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'CreatedBy') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD CreatedBy NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'DateofBirth') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD DateofBirth DATE NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'DeleteTime') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD DeleteTime DATETIME2 NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'DeletedBy') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD DeletedBy NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'DepartmentId') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD DepartmentId INT NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'DomainName') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD DomainName NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'EndDate') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD EndDate DATE NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'IsDeleted') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD IsDeleted BIT NOT NULL DEFAULT 0;

        IF COL_LENGTH('dbo.AspNetUsers', 'IsExceptional') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD IsExceptional BIT NOT NULL DEFAULT 0;

        IF COL_LENGTH('dbo.AspNetUsers', 'IsManager') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD IsManager BIT NOT NULL DEFAULT 0;

        IF COL_LENGTH('dbo.AspNetUsers', 'ManagerRegistryNo') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD ManagerRegistryNo NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'NameSurname') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD NameSurname NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'PersonalPhone') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD PersonalPhone NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'RegistryNo') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD RegistryNo NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'ShortCode') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD ShortCode NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'StartDate') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD StartDate DATE NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'Title') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD Title NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'UpdateTime') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD UpdateTime DATETIME2 NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'UpdatedBy') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD UpdatedBy NVARCHAR(MAX) NULL;

        IF COL_LENGTH('dbo.AspNetUsers', 'WorkPhone') IS NULL
            ALTER TABLE dbo.AspNetUsers ADD WorkPhone NVARCHAR(MAX) NULL;

        
    ");
}
        

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
             migrationBuilder.Sql(@"
            IF COL_LENGTH('dbo.AspNetUsers', 'BirthDate') IS NOT NULL
    ALTER TABLE dbo.AspNetUsers DROP COLUMN BirthDate;

IF COL_LENGTH('dbo.AspNetUsers', 'HireDate') IS NOT NULL
    ALTER TABLE dbo.AspNetUsers DROP COLUMN HireDate;");

        }
    }
}
