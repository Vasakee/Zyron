ALTER TABLE
    [dbo].[support]
ADD
    [assigneeId] UNIQUEIDENTIFIER NULL;

ALTER TABLE
    [dbo].[support]
ADD
    [inquiryId] VARCHAR(MAX) NOT NULL;

ALTER TABLE
    [dbo].[support]
ADD
    [priority] VARCHAR(255) NOT NULL DEFAULT 'medium';

ALTER TABLE
    [dbo].[support]
ADD
    [status] VARCHAR(255) NOT NULL DEFAULT 'pending';

ALTER TABLE
    [dbo].[support] DROP CONSTRAINT [FK_0768a9a514d90be0f9d00fd8036];

ALTER TABLE
    [dbo].[support]
ALTER COLUMN
    [userId] UNIQUEIDENTIFIER NOT NULL;

ALTER TABLE
    [dbo].[support]
ADD
    CONSTRAINT [FK_0768a9a514d90be0f9d00fd8036] FOREIGN KEY ([userId]) REFERENCES [dbo].[user] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE
    [dbo].[support]
ADD
    CONSTRAINT [FK_18a12a2413db2e5e22277cdbd13] FOREIGN KEY ([assigneeId]) REFERENCES [dbo].[user] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Down script
ALTER TABLE
    [dbo].[support] DROP CONSTRAINT [FK_18a12a2413db2e5e22277cdbd13];

ALTER TABLE
    [dbo].[support] DROP CONSTRAINT [FK_0768a9a514d90be0f9d00fd8036];

ALTER TABLE
    [dbo].[support]
ALTER COLUMN
    [userId] UNIQUEIDENTIFIER NULL;

ALTER TABLE
    [dbo].[support]
ADD
    CONSTRAINT [FK_0768a9a514d90be0f9d00fd8036] FOREIGN KEY ([userId]) REFERENCES [dbo].[user] ([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE
    [dbo].[support] DROP COLUMN [status];

ALTER TABLE
    [dbo].[support] DROP COLUMN [priority];

ALTER TABLE
    [dbo].[support] DROP COLUMN [inquiryId];

ALTER TABLE
    [dbo].[support] DROP COLUMN [assigneeId];