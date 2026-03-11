import Joi from "joi";

/**
 * Validation schema for creating an automation
 */
export const createAutomationSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    "string.empty": "Automation name is required",
    "string.max": "Automation name must not exceed 100 characters",
  }),
  topic: Joi.string().max(100).required().messages({
    "string.empty": "Topic is required",
    "string.max": "Topic must not exceed 100 characters",
  }),
  frequency: Joi.number().integer().min(1).max(10).required().messages({
    "number.base": "Frequency must be a number",
    "number.min": "Frequency must be at least 1",
    "number.max": "Frequency must not exceed 10",
  }),
  templateId: Joi.string().uuid().optional().allow(null),
  active: Joi.boolean().optional(),
});

/**
 * Validation schema for updating an automation
 */
export const updateAutomationSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  topic: Joi.string().max(100).optional(),
  frequency: Joi.number().integer().min(1).max(10).optional(),
  templateId: Joi.string().uuid().optional().allow(null),
  active: Joi.boolean().optional(),
}).min(1);
