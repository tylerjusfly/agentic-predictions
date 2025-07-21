import Joi from 'joi'

class ChromaSchema {

  createCollection = Joi.object({
    name: Joi.string().required(),
  });


}

export default ChromaSchema;