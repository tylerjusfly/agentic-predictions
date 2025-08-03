import { Router } from "express";
import AuthService from "./service";
import AuthSchema from "./schema";
import { validateBody } from "../../middlewares/schemaValidation";

const controller = new AuthService()
const schema = new AuthSchema()

const router = Router()

// router.post('/register', validateBody(schema.createUser), controller.register);
router.post('/login', validateBody(schema.loginUser), controller.login);

export const AuthController = { router };