/*
  Warnings:

  - You are about to drop the `Championsleague` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Premierleague" ADD COLUMN     "both_team_to_score" TEXT,
ADD COLUMN     "over_two_goals" TEXT,
ALTER COLUMN "bts" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Championsleague";
