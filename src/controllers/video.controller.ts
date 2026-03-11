import type { Context } from "hono";
import { videoRepository } from "../db/repositories";
import { createVideoSchema, updateVideoSchema, videoFiltersSchema } from "../validation/video.validation";
import { aiService } from "../services/ai.service";

/**
 * Get all videos for the authenticated user
 */
export async function getVideos(c: Context) {
  try {
    const userId = c.get("userId");
    const { status, search } = c.req.query();

    // Validate filters
    const { error, value } = videoFiltersSchema.validate({ status, search });
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    const videos = await videoRepository.findByUserId(userId, value);
    return c.json({ videos }, 200);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return c.json({ error: "Failed to fetch videos" }, 500);
  }
}

/**
 * Get a single video by ID
 */
export async function getVideo(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const video = await videoRepository.findById(id, userId);
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    return c.json({ video }, 200);
  } catch (error) {
    console.error("Error fetching video:", error);
    return c.json({ error: "Failed to fetch video" }, 500);
  }
}

/**
 * Create a new video
 */
export async function createVideo(c: Context) {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    // Validate request body
    const { error, value } = createVideoSchema.validate(body);
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    // Create video with "generating" status
    const video = await videoRepository.create({
      ...value,
      userId,
      status: "generating",
      views: 0,
    });

    // TODO: Trigger video generation job here (mock for now)
    // In production, this would call Shotstack API or similar

    return c.json({ video }, 201);
  } catch (error) {
    console.error("Error creating video:", error);
    return c.json({ error: "Failed to create video" }, 500);
  }
}

/**
 * Update a video
 */
export async function updateVideo(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();
    const body = await c.req.json();

    // Validate request body
    const { error, value } = updateVideoSchema.validate(body);
    if (error) {
      return c.json({ error: error.details[0].message }, 400);
    }

    const video = await videoRepository.update(id, userId, value);
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    return c.json({ video }, 200);
  } catch (error) {
    console.error("Error updating video:", error);
    return c.json({ error: "Failed to update video" }, 500);
  }
}

/**
 * Delete a video
 */
export async function deleteVideo(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const deleted = await videoRepository.delete(id, userId);
    if (!deleted) {
      return c.json({ error: "Video not found" }, 404);
    }

    return c.json({ message: "Video deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting video:", error);
    return c.json({ error: "Failed to delete video" }, 500);
  }
}

/**
 * Regenerate a failed video
 */
export async function regenerateVideo(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const video = await videoRepository.findById(id, userId);
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    if (video.status !== "failed") {
      return c.json({ error: "Only failed videos can be regenerated" }, 400);
    }

    // Update status to generating and clear error message
    const updatedVideo = await videoRepository.updateStatus(id, userId, "generating");

    // TODO: Trigger video generation job here (mock for now)

    return c.json({ video: updatedVideo }, 200);
  } catch (error) {
    console.error("Error regenerating video:", error);
    return c.json({ error: "Failed to regenerate video" }, 500);
  }
}

/**
 * Post video to TikTok
 */
export async function postToTikTok(c: Context) {
  try {
    const userId = c.get("userId");
    const { id } = c.req.param();

    const video = await videoRepository.findById(id, userId);
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    if (video.status !== "ready") {
      return c.json({ error: "Only ready videos can be posted to TikTok" }, 400);
    }

    if (!video.videoUrl) {
      return c.json({ error: "Video URL is missing" }, 400);
    }

    // TODO: Implement TikTok posting logic
    // This will use the TikTok API to upload and publish the video
    // For now, we'll just update the status

    const updatedVideo = await videoRepository.update(id, userId, {
      status: "posted",
      tiktokVideoId: `mock_tiktok_${Date.now()}`, // Mock TikTok video ID
    });

    return c.json({ video: updatedVideo, message: "Video posted to TikTok successfully" }, 200);
  } catch (error) {
    console.error("Error posting to TikTok:", error);
    return c.json({ error: "Failed to post video to TikTok" }, 500);
  }
}

/**
 * Generate a video script using AI
 */
export async function generateScript(c: Context) {
  try {
    const { topic, duration } = await c.req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return c.json({ error: "Topic is required" }, 400);
    }

    const scriptDuration = duration && typeof duration === "number" ? duration : 60;

    const script = await aiService.generateScript(topic, scriptDuration);
    return c.json({ script }, 200);
  } catch (error) {
    console.error("Error generating script:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to generate script" },
      500
    );
  }
}

/**
 * Generate a video title using AI
 */
export async function generateTitle(c: Context) {
  try {
    const { topic } = await c.req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return c.json({ error: "Topic is required" }, 400);
    }

    const title = await aiService.generateTitle(topic);
    return c.json({ title }, 200);
  } catch (error) {
    console.error("Error generating title:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to generate title" },
      500
    );
  }
}

/**
 * Improve an existing script using AI
 */
export async function improveScript(c: Context) {
  try {
    const { script } = await c.req.json();

    if (!script || typeof script !== "string" || script.trim().length === 0) {
      return c.json({ error: "Script is required" }, 400);
    }

    const improvedScript = await aiService.improveScript(script);
    return c.json({ script: improvedScript }, 200);
  } catch (error) {
    console.error("Error improving script:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to improve script" },
      500
    );
  }
}
