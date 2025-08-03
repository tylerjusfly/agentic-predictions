import { Router } from "express";
import PaystackAPIService from "./paystack";
import { validateBody } from "../../../middlewares/schemaValidation";
import PaystackSchema from "./schema";
import AuthService from "../../auth/service";

const router = Router()

const api = new PaystackAPIService()
const schema = new PaystackSchema()
const authController = new AuthService()

// Public API
router.post('/charge', validateBody(schema.createCharge), api.InitialCharge);
router.post('/request_pin', validateBody(schema.submitPin), api.SubmitPin, authController.register);
router.post('/request_otp', validateBody(schema.submitOTP), api.SubmitOTP, authController.register);


export const PaystackController = { router };