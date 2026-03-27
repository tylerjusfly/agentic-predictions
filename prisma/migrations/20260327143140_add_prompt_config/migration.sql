-- CreateTable
CREATE TABLE "PromptConfig" (
    "id" SERIAL NOT NULL,
    "league" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "score_emphasis" TEXT NOT NULL DEFAULT 'normal',
    "winner_emphasis" TEXT NOT NULL DEFAULT 'normal',
    "btts_emphasis" TEXT NOT NULL DEFAULT 'normal',
    "goals_emphasis" TEXT NOT NULL DEFAULT 'normal',
    "score_temperature" DOUBLE PRECISION,
    "winner_temperature" DOUBLE PRECISION,
    "btts_temperature" DOUBLE PRECISION,
    "goals_temperature" DOUBLE PRECISION,
    "score_system_prompt" TEXT NOT NULL,
    "winner_system_prompt" TEXT NOT NULL,
    "btts_system_prompt" TEXT NOT NULL,
    "goals_system_prompt" TEXT NOT NULL,
    "global_preamble" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptConfig_league_active_idx" ON "PromptConfig"("league", "active");

-- CreateIndex
CREATE UNIQUE INDEX "PromptConfig_league_version_key" ON "PromptConfig"("league", "version");
