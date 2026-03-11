import Joi from "joi";

/**
 * Validation schema for TikTok OAuth callback
 */
export const tiktokCallbackSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.empty": "Authorization code is required",
  }),
  state: Joi.string().required().messages({
    "string.empty": "State parameter is required",
  }),
});

/**
 * Validation schema for posting video to TikTok
 */
export const postToTikTokSchema = Joi.object({
  videoId: Joi.string().uuid().required().messages({
    "string.empty": "Video ID is required",
    "string.guid": "Invalid video ID format",
  }),
});
