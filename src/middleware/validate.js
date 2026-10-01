const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }
    next();
  };
};

module.exports = { validate };
