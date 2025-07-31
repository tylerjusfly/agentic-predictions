import { Router } from "express";
import PublicAPIService from "./service";
import { getChampionsLeagueResults } from "../crons/getResultsforChampionsLeague";


const router = Router()

const api = new PublicAPIService()

// Public API
router.get('/get-public-premierLeague', api.getPublicPremierLeagueMatches);
router.get('/get-public-championsLeagues', api.getPublicChampionsMatches);

router.get('/fetchplayed', (req, res )=> {
    getChampionsLeagueResults()
    res.send("done")
});

export const PublicPredictionsController = { router };