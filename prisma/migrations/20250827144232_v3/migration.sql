-- AlterTable
ALTER TABLE "public"."Premierleague" ADD COLUMN     "over_three_goals" TEXT;

-- CreateTable
CREATE TABLE "public"."PredictionStat" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "totalPredictions" INTEGER NOT NULL,
    "correctScorePassed" INTEGER NOT NULL,
    "correctScoreFailed" INTEGER NOT NULL,
    "over15Passed" INTEGER NOT NULL,
    "over15Failed" INTEGER NOT NULL,
    "over25Passed" INTEGER NOT NULL,
    "over25Failed" INTEGER NOT NULL,
    "btsPassed" INTEGER NOT NULL,
    "btsFailed" INTEGER NOT NULL,
    "straightWinPassed" INTEGER NOT NULL,
    "straightWinFailed" INTEGER NOT NULL,
    "drawPassed" INTEGER NOT NULL,
    "drawFailed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionStat_pkey" PRIMARY KEY ("id")
);
