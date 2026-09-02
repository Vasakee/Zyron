-- Up script
CREATE TABLE [dbo].[tutorials] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [title] VARCHAR(MAX) NOT NULL,
    [category] VARCHAR(MAX) NOT NULL,
    [imageUrl] VARCHAR(MAX),
    [resourceType] VARCHAR(MAX) NOT NULL,
    [documentUrl] VARCHAR(MAX),
    [pptUrl] VARCHAR(MAX),
    [videoUrl] VARCHAR(MAX),
    CONSTRAINT [PK_e9152ab79d78c6a5e4c7bd47f61] PRIMARY KEY ([id])
);

-- Down script
DROP TABLE [dbo].[tutorials];