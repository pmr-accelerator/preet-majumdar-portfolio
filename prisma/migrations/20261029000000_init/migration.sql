CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProjectStatus" AS ENUM ('IDEA', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "CreativeType" AS ENUM ('SINGING', 'GUITAR', 'TABLA');
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('NOT_CONFIGURED', 'PENDING', 'SENT', 'FAILED');

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL, "fullName" TEXT NOT NULL DEFAULT 'Preet Majumdar',
  "headline" TEXT NOT NULL DEFAULT 'Building my foundation in software engineering.',
  "biography" TEXT NOT NULL DEFAULT 'I''m a Computer Science and Engineering student developing my skills in programming and software development.',
  "college" TEXT NOT NULL DEFAULT 'Elitte College of Engineering',
  "degree" TEXT NOT NULL DEFAULT 'B.Tech in Computer Science and Engineering',
  "academicStatus" TEXT NOT NULL DEFAULT 'Third-year undergraduate student, fifth semester',
  "expectedGraduation" TEXT, "locationLabel" TEXT, "portraitMediaId" TEXT, "contactEmail" TEXT,
  "availabilityLabel" TEXT, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Education" (
  "id" TEXT NOT NULL, "institution" TEXT NOT NULL, "qualification" TEXT NOT NULL, "field" TEXT,
  "startDate" TIMESTAMP(3), "endDate" TIMESTAMP(3), "description" TEXT,
  "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Skill" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "category" TEXT NOT NULL, "level" TEXT NOT NULL,
  "explanation" TEXT, "evidenceUrl" TEXT, "projectId" TEXT, "visible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Skill_visible_sortOrder_idx" ON "Skill"("visible", "sortOrder");
CREATE TABLE "Experience" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "organization" TEXT NOT NULL, "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3), "current" BOOLEAN NOT NULL DEFAULT false, "responsibilities" TEXT[] NOT NULL,
  "teachingSubjects" TEXT[] NOT NULL, "description" TEXT, "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Experience_status_sortOrder_idx" ON "Experience"("status", "sortOrder");
CREATE TABLE "Project" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL, "status" "ProjectStatus" NOT NULL DEFAULT 'IDEA',
  "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT', "startDate" TIMESTAMP(3),
  "completionDate" TIMESTAMP(3), "technologies" TEXT[] NOT NULL, "problemStatement" TEXT,
  "implementation" TEXT, "features" TEXT[] NOT NULL, "challenges" TEXT, "lessonsLearned" TEXT,
  "screenshotMediaIds" TEXT[] NOT NULL, "repositoryUrl" TEXT, "liveDemoUrl" TEXT,
  "documentationUrl" TEXT, "featured" BOOLEAN NOT NULL DEFAULT false, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_publicationStatus_featured_sortOrder_idx" ON "Project"("publicationStatus", "featured", "sortOrder");
CREATE TABLE "Achievement" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "category" TEXT NOT NULL,
  "organization" TEXT, "issueDate" TIMESTAMP(3), "description" TEXT NOT NULL, "subjectArea" TEXT,
  "certificateMediaId" TEXT, "verificationUrl" TEXT, "supportingMediaIds" TEXT[] NOT NULL,
  "verificationNote" TEXT, "featured" BOOLEAN NOT NULL DEFAULT false,
  "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");
CREATE INDEX "Achievement_publicationStatus_category_issueDate_idx" ON "Achievement"("publicationStatus", "category", "issueDate");
CREATE TABLE "GalleryItem" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "imageMediaId" TEXT NOT NULL, "date" TIMESTAMP(3),
  "eventName" TEXT, "description" TEXT, "category" TEXT NOT NULL, "altText" TEXT NOT NULL,
  "relatedAchievementId" TEXT, "externalUrl" TEXT,
  "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GalleryItem_publicationStatus_category_sortOrder_idx" ON "GalleryItem"("publicationStatus", "category", "sortOrder");
CREATE TABLE "CreativeEntry" (
  "id" TEXT NOT NULL, "type" "CreativeType" NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3), "language" TEXT, "genre" TEXT, "taal" TEXT,
  "accompanyingInstruments" TEXT[] NOT NULL, "mediaAssetId" TEXT, "externalMediaUrl" TEXT,
  "coverMediaId" TEXT, "description" TEXT, "learningStage" TEXT, "featured" BOOLEAN NOT NULL DEFAULT false,
  "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT', "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "CreativeEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CreativeEntry_slug_key" ON "CreativeEntry"("slug");
CREATE INDEX "CreativeEntry_type_publicationStatus_sortOrder_idx" ON "CreativeEntry"("type", "publicationStatus", "sortOrder");
CREATE TABLE "DramaProduction" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "role" TEXT NOT NULL, "organization" TEXT NOT NULL,
  "productionDate" TIMESTAMP(3), "description" TEXT NOT NULL, "posterMediaId" TEXT, "videoUrl" TEXT,
  "credits" TEXT[] NOT NULL, "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DramaProduction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DramaProduction_publicationStatus_sortOrder_idx" ON "DramaProduction"("publicationStatus", "sortOrder");
CREATE TABLE "SocialLink" (
  "id" TEXT NOT NULL, "label" TEXT NOT NULL, "url" TEXT NOT NULL, "icon" TEXT,
  "visible" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialLink_visible_sortOrder_idx" ON "SocialLink"("visible", "sortOrder");
CREATE TABLE "ResumeAsset" (
  "id" TEXT NOT NULL, "mediaAssetId" TEXT NOT NULL, "label" TEXT NOT NULL DEFAULT 'Current résumé',
  "published" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ResumeAsset_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ResumeAsset_published_idx" ON "ResumeAsset"("published");
CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL, "storageKey" TEXT NOT NULL, "storageProvider" TEXT NOT NULL,
  "originalName" TEXT NOT NULL, "contentType" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL,
  "publicUrl" TEXT, "altText" TEXT, "width" INTEGER, "height" INTEGER, "durationSeconds" INTEGER,
  "uploadedById" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");
CREATE INDEX "MediaAsset_contentType_createdAt_idx" ON "MediaAsset"("contentType", "createdAt");
CREATE TABLE "ContactMessage" (
  "id" TEXT NOT NULL, "fullName" TEXT NOT NULL, "email" TEXT NOT NULL, "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL, "category" TEXT, "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
  "emailDeliveryStatus" "EmailDeliveryStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "emailDeliveryError" TEXT, "emailAttemptedAt" TIMESTAMP(3), "emailSentAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
CREATE INDEX "ContactMessage_emailDeliveryStatus_createdAt_idx" ON "ContactMessage"("emailDeliveryStatus", "createdAt");
CREATE TABLE "SiteSettings" (
  "id" TEXT NOT NULL, "siteTitle" TEXT NOT NULL DEFAULT 'Preet / Digital Field Notes',
  "siteDescription" TEXT NOT NULL DEFAULT 'Software development, technical learning, leadership, and creative work.',
  "baseUrl" TEXT, "contactDestination" TEXT, "assistantEnabled" BOOLEAN NOT NULL DEFAULT true,
  "assistantDisclosure" TEXT NOT NULL DEFAULT 'Automated portfolio assistant; not a live conversation with Preet.',
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
