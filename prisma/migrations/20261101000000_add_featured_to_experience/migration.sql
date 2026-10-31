ALTER TABLE "Experience"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Experience_status_featured_sortOrder_idx"
ON "Experience"("status", "featured", "sortOrder");