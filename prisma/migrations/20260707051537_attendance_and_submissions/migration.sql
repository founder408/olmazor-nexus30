-- CreateEnum
CREATE TYPE "StaffEvent" AS ENUM ('ideaton', 'hakaton', 'startup');

-- CreateEnum
CREATE TYPE "SubmissionEvent" AS ENUM ('ideaton', 'hakaton');

-- AlterTable
ALTER TABLE "ideation_applications" ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutById" TEXT;

-- AlterTable
ALTER TABLE "startup_applications" ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutById" TEXT;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutById" TEXT;

-- CreateTable
CREATE TABLE "volunteer_attendance" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "event" "StaffEvent" NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "recordedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_windows" (
    "id" TEXT NOT NULL,
    "event" "SubmissionEvent" NOT NULL,
    "title" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "closedEarly" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "submissionWindowId" TEXT NOT NULL,
    "ideationApplicationId" TEXT,
    "teamId" TEXT,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_attendance_volunteerId_event_key" ON "volunteer_attendance"("volunteerId", "event");

-- CreateIndex
CREATE UNIQUE INDEX "submission_windows_token_key" ON "submission_windows"("token");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_submissionWindowId_ideationApplicationId_key" ON "submissions"("submissionWindowId", "ideationApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_submissionWindowId_teamId_key" ON "submissions"("submissionWindowId", "teamId");

-- AddForeignKey
ALTER TABLE "ideation_applications" ADD CONSTRAINT "ideation_applications_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_applications" ADD CONSTRAINT "startup_applications_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_attendance" ADD CONSTRAINT "volunteer_attendance_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_attendance" ADD CONSTRAINT "volunteer_attendance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_windows" ADD CONSTRAINT "submission_windows_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submissionWindowId_fkey" FOREIGN KEY ("submissionWindowId") REFERENCES "submission_windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_ideationApplicationId_fkey" FOREIGN KEY ("ideationApplicationId") REFERENCES "ideation_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
