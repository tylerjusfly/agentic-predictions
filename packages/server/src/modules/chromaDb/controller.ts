import { Router } from "express";
import ChromaService from "./service";
import ChromaSchema from "./schema";
import { validateBody } from "../../middlewares/schemaValidation";

const router = Router()
const controller = new ChromaService()
const schema = new ChromaSchema()

router.post('/', validateBody(schema.createCollection), controller.createCollection);
router.post('/populate', controller.populateCollection);

export const ChromaController = { router };