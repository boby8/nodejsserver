import Joi from "joi";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    req.body = value; // Replace req.body with validated and sanitized value
    next();
  };
};

