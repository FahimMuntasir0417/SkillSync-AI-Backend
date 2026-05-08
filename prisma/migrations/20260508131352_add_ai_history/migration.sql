-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AiFeatureType" ADD VALUE 'ROADMAP_GENERATOR';
ALTER TYPE "AiFeatureType" ADD VALUE 'SKILL_GAP_ANALYZER';
ALTER TYPE "AiFeatureType" ADD VALUE 'PROJECT_RECOMMENDER';
ALTER TYPE "AiFeatureType" ADD VALUE 'CAREER_CHAT_ASSISTANT';

-- CreateTable
CREATE TABLE "AiRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSkillGapAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "currentSkills" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSkillGapAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProjectRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiProjectRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiRoadmap_userId_idx" ON "AiRoadmap"("userId");

-- CreateIndex
CREATE INDEX "AiRoadmap_createdAt_idx" ON "AiRoadmap"("createdAt");

-- CreateIndex
CREATE INDEX "AiSkillGapAnalysis_userId_idx" ON "AiSkillGapAnalysis"("userId");

-- CreateIndex
CREATE INDEX "AiSkillGapAnalysis_createdAt_idx" ON "AiSkillGapAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "AiProjectRecommendation_userId_idx" ON "AiProjectRecommendation"("userId");

-- CreateIndex
CREATE INDEX "AiProjectRecommendation_createdAt_idx" ON "AiProjectRecommendation"("createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_userId_idx" ON "AiChatMessage"("userId");

-- CreateIndex
CREATE INDEX "AiChatMessage_createdAt_idx" ON "AiChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "AiRoadmap" ADD CONSTRAINT "AiRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSkillGapAnalysis" ADD CONSTRAINT "AiSkillGapAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProjectRecommendation" ADD CONSTRAINT "AiProjectRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
