import { Router } from "express";
import PublicAPIService from "./service";

const router = Router()

const api = new PublicAPIService()

// Public API
router.get('/get-public-premierLeague', api.getPublicPremierLeagueMatches);
router.get('/get-public-championsLeagues', api.getPublicChampionsMatches);

export const PublicPredictionsController = { router };