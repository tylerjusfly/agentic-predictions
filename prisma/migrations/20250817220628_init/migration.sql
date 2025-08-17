-- CreateTable
CREATE TABLE "Championsleague" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_id" TEXT NOT NULL,
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,
    "predicted_score" TEXT NOT NULL,
    "predicted_winner" TEXT,
    "month" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "bts" TEXT NOT NULL,
    "home_win_probability" TEXT,
    "away_win_probability" TEXT,
    "confidence_level" TEXT,
    "actual_score" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Premierleague" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_id" TEXT NOT NULL,
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,
    "predicted_score" TEXT NOT NULL,
    "predicted_winner" TEXT,
    "month" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "bts" TEXT NOT NULL,
    "home_win_probability" TEXT,
    "away_win_probability" TEXT,
    "confidence_level" TEXT,
    "actual_score" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "payment_month" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passkey" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "subsribed_at" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Championsleague_game_id_key" ON "Championsleague"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Premierleague_game_id_key" ON "Premierleague"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
