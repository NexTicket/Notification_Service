-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'SENDGRID',
    "qrCodeUrl" TEXT,
    "qrDataString" TEXT NOT NULL,
    "notificationData" JSONB,
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_messageId_key" ON "notifications"("messageId");

-- CreateIndex
CREATE INDEX "notifications_firebaseUid_idx" ON "notifications"("firebaseUid");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_messageId_idx" ON "notifications"("messageId");
