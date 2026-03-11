import Joi from "joi";

/**
 * Validation schema for creating an RSS feed
 */
export const createRssFeedSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.empty": "RSS feed URL is required",
    "string.uri": "Invalid RSS feed URL format",
  }),
  label: Joi.string().max(100).required().messages({
    "string.empty": "Label is required",
    "string.max": "Label must not exceed 100 characters",
  }),
});
