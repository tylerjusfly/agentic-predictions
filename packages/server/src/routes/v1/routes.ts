// const standings_url = "https://fbref.com/en/comps/9/Premier-League-Stats"

import { Router } from "express";
import { DailyPredictionsController } from "../../modules/getDailyPredictions/controller";
import { ChromaController } from "../../modules/chromaDb/controller";
import { AuthController } from "../../modules/auth/controller";

const router = Router()

router.use('/monthly', DailyPredictionsController.router);
router.use('/chroma', ChromaController.router);
router.use('/auth', AuthController.router);

export const v1Router = router;
