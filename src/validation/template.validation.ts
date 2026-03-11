import Joi from "joi";

/**
 * Validation schema for creating a video template
 */
export const createTemplateSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    "string.empty": "Template name is required",
    "string.max": "Template name must not exceed 100 characters",
  }),
  voiceId: Joi.string().max(50).required().messages({
    "string.empty": "Voice ID is required",
  }),
  bgStyle: Joi.string().max(50).required().messages({
    "string.empty": "Background style is required",
  }),
  textStyle: Joi.string().max(50).required().messages({
    "string.empty": "Text style is required",
  }),
});
