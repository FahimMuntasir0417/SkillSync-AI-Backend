CREATE TYPE "PromotionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "PromotionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PromotionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "adminFeedback" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PromotionRequest_userId_idx" ON "PromotionRequest"("userId");
CREATE INDEX "PromotionRequest_status_idx" ON "PromotionRequest"("status");
CREATE INDEX "PromotionRequest_reviewedById_idx" ON "PromotionRequest"("reviewedById");
CREATE INDEX "PromotionRequest_createdAt_idx" ON "PromotionRequest"("createdAt");

ALTER TABLE "PromotionRequest" ADD CONSTRAINT "PromotionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromotionRequest" ADD CONSTRAINT "PromotionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
