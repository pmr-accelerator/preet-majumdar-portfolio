-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewVerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "linkedInUrl" TEXT,
    "email" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationStatus" "ReviewVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verificationTokenHash" TEXT,
    "verificationExpiresAt" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSubmissionAttempt" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSubmissionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_verificationTokenHash_key" ON "Review"("verificationTokenHash");

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Review_email_createdAt_idx" ON "Review"("email", "createdAt");

-- CreateIndex
CREATE INDEX "Review_verificationStatus_verificationExpiresAt_idx" ON "Review"("verificationStatus", "verificationExpiresAt");

-- CreateIndex
CREATE INDEX "ReviewSubmissionAttempt_ipHash_createdAt_idx" ON "ReviewSubmissionAttempt"("ipHash", "createdAt");
