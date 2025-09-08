import Joi from "joi";

const admitSchema = Joi.object({
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid("male", "female", "other").required(),
  phone: Joi.string().trim().max(20).optional(),
  email: Joi.string().trim().email().optional(),
  careUnit: Joi.string().required(),
  bed: Joi.string().required(),
});

const updateSchema = Joi.object({
  firstName: Joi.string().trim().max(100),
  lastName: Joi.string().trim().max(100),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid("male", "female", "other"),
  phone: Joi.string().trim().max(20),
  email: Joi.string().trim().email(),
  careUnit: Joi.string(),
  bed: Joi.string(),
  dischargedAt: Joi.date(),
  isActive: Joi.boolean(),
});

const validateAdmitPatient = (req, res, next) => {
  const { error } = admitSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateUpdatePatient = (req, res, next) => {
  const { error } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

export { validateAdmitPatient, validateUpdatePatient };


