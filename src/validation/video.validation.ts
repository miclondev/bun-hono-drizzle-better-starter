import Joi from "joi";

/**
 * Validation schema for creating a video
 */
export const createVideoSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 255 characters",
  }),
  topic: Joi.string().max(100).required().messages({
    "string.empty": "Topic is required",
    "string.max": "Topic must not exceed 100 characters",
  }),
  script: Joi.string().required().messages({
    "string.empty": "Script is required",
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

/**
 * Validation schema for updating a video
 */
export const updateVideoSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  topic: Joi.string().max(100).optional(),
  script: Joi.string().optional(),
  voiceId: Joi.string().max(50).optional(),
  bgStyle: Joi.string().max(50).optional(),
  textStyle: Joi.string().max(50).optional(),
  status: Joi.string().valid("generating", "ready", "posted", "failed").optional(),
  videoUrl: Joi.string().uri().optional().allow(null),
  thumbnailUrl: Joi.string().uri().optional().allow(null),
  views: Joi.number().integer().min(0).optional(),
  tiktokVideoId: Joi.string().optional().allow(null),
  errorMessage: Joi.string().optional().allow(null),
}).min(1);

/**
 * Validation schema for video query filters
 */
export const videoFiltersSchema = Joi.object({
  status: Joi.string().valid("generating", "ready", "posted", "failed").optional(),
  search: Joi.string().max(255).optional(),
});
