-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "brierScore" DOUBLE PRECISION,
    "sampleSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentMemory_league_market_idx" ON "AgentMemory"("league", "market");

-- CreateIndex
CREATE UNIQUE INDEX "AgentMemory_league_market_month_key" ON "AgentMemory"("league", "market", "month");
