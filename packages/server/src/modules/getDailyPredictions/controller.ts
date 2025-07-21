import { Router } from "express";
import { getChampionsLeauge, getPremierLeagueMatches } from "./service";

const router = Router()

router.get('/get-premierLeague', getPremierLeagueMatches);
router.get('/get-championsLeague', getChampionsLeauge);

export const DailyPredictionsController = { router };