import { Router } from "express";
import PaystackAPIService from "./paystack";
import { validateBody } from "../../../middlewares/schemaValidation";
import PaystackSchema from "./schema";

const router = Router()

const api = new PaystackAPIService()
const schema = new PaystackSchema()

// Public API
router.post('/charge', validateBody(schema.createCharge), api.InitialCharge);
router.post('/request_pin', validateBody(schema.submitPin), api.SubmitPin);
router.post('/request_otp', validateBody(schema.submitOTP), api.SubmitOTP);


export const PaystackController = { router };