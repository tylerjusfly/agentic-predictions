import Joi from "joi";

class PaystackSchema {
  createCharge = Joi.object({
    email: Joi.string().email().required(),
    amount: Joi.number().required(),
    card: Joi.object({
      number: Joi.string().required(),
      cvv: Joi.string().required(),
      expiry_month: Joi.string().required(),
      expiry_year: Joi.string().required()
    })
      .strict()
      .required()
  });

  submitPin = Joi.object({
    reference: Joi.string().required(),
    pin: Joi.number().required()
  });

  submitOTP = Joi.object({
    reference: Joi.string().required(),
    otp: Joi.number().required()
  });
}

export default PaystackSchema;
