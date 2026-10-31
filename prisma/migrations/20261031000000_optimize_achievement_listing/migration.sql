CREATE INDEX "Achievement_publicationStatus_featured_issueDate_sortOrder_idx"
ON "Achievement" (
    "publicationStatus",
    "featured" DESC,
    "issueDate" DESC,
    "sortOrder" ASC
);