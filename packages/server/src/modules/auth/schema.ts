import Joi from 'joi'

class AuthSchema {

  createUser = Joi.object({
    // name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  loginUser = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().required(),
  });


}

export default AuthSchema;