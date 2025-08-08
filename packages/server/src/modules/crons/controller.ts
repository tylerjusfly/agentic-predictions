import { Router } from "express";
import { updateCompetitionResults } from "./getresultsForGames";

const router = Router();

router.get("/fetchpremierleague", (req, res) => {
  try {
    updateCompetitionResults({
      tableName: "premierleague",
      scraperMethod: "scrapePremierLeagueGameFromBBC"
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

router.get("/fetchchampionsleague", (req, res) => {
  try {
    updateCompetitionResults({
      tableName: "championsleague",
      scraperMethod: "scrapeChampionsLeagueFromBBC"
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

export const getResultsController = { router };
