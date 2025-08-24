-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "public"."Championsleague" (
    "id" SERIAL NOT NULL,
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
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Championsleague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Premierleague" (
    "id" SERIAL NOT NULL,
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
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Premierleague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transactions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "payment_month" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passkey" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "subsribed_at" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roles" "public"."Role"[] DEFAULT ARRAY['USER']::"public"."Role"[],

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Championsleague_game_id_key" ON "public"."Championsleague"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Premierleague_game_id_key" ON "public"."Premierleague"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");
