-- 1. Add an optional event association to existing gallery photographs.
ALTER TABLE "GalleryItem"
ADD COLUMN "galleryEventId" TEXT;

-- 2. Create the GalleryEvent table.
CREATE TABLE "GalleryEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "description" TEXT,
    "category" TEXT NOT NULL,
    "coverMediaId" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryEvent_pkey" PRIMARY KEY ("id")
);

-- 3. Create indexes.
CREATE UNIQUE INDEX "GalleryEvent_slug_key"
ON "GalleryEvent"("slug");

CREATE INDEX "GalleryEvent_publicationStatus_date_sortOrder_idx"
ON "GalleryEvent"("publicationStatus", "date", "sortOrder");

CREATE INDEX "GalleryItem_galleryEventId_sortOrder_idx"
ON "GalleryItem"("galleryEventId", "sortOrder");

-- 4. Create an event for the existing IIC Project Presentation gallery group.
INSERT INTO "GalleryEvent" (
    "id",
    "title",
    "slug",
    "date",
    "description",
    "category",
    "publicationStatus",
    "sortOrder",
    "publishedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    'legacy-iic-project-presentation',
    'IIC Project Presentation',
    'iic-project-presentation',
    MIN("date"),
    'College IIC Project Presentation.',
    'College Event',
    'PUBLISHED',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "GalleryItem"
WHERE "eventName" = 'IIC Project Presentation'
HAVING COUNT(*) > 0
ON CONFLICT ("slug") DO NOTHING;

-- 5. Link existing photographs to the new event.
UPDATE "GalleryItem"
SET "galleryEventId" = 'legacy-iic-project-presentation'
WHERE "eventName" = 'IIC Project Presentation'
AND EXISTS (
    SELECT 1
    FROM "GalleryEvent"
    WHERE "id" = 'legacy-iic-project-presentation'
);

-- 6. Add the optional relationship.
-- Deleting an event will not delete its photographs.
ALTER TABLE "GalleryItem"
ADD CONSTRAINT "GalleryItem_galleryEventId_fkey"
FOREIGN KEY ("galleryEventId")
REFERENCES "GalleryEvent"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;