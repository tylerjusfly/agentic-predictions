-- AlterTable
ALTER TABLE "PredictionStat" ADD COLUMN     "brierBtts" DOUBLE PRECISION,
ADD COLUMN     "brierGoals" DOUBLE PRECISION,
ADD COLUMN     "brierScore" DOUBLE PRECISION,
ADD COLUMN     "brierWinner" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "DriftSignal" (
    "id" SERIAL NOT NULL,
    "league" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "window" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriftSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriftSignal_league_market_idx" ON "DriftSignal"("league", "market");
