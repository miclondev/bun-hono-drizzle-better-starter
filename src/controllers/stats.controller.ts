import type { Context } from "hono";
import { videoRepository, automationRepository, templateRepository } from "../db/repositories";
import { analyticsService } from "../services/analytics.service";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(c: Context) {
  try {
    const userId = c.get("userId");

    // Get video statistics
    const videoStats = await videoRepository.getStats(userId);

    // Get recent videos
    const recentVideos = await videoRepository.getRecent(userId, 5);

    // Get automation statistics
    const automationStats = await automationRepository.getStats(userId);

    // Get template count
    const templates = await templateRepository.findByUserId(userId);

    // Calculate top topics from videos
    const allVideos = await videoRepository.findByUserId(userId, {});
    const topicCounts: Record<string, number> = {};
    
    for (const video of allVideos) {
      topicCounts[video.topic] = (topicCounts[video.topic] || 0) + 1;
    }

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Performance data (mock for now - in production, calculate from actual data)
    const performanceData = [
      { date: "Mon", views: 120 },
      { date: "Tue", views: 180 },
      { date: "Wed", views: 150 },
      { date: "Thu", views: 220 },
      { date: "Fri", views: 280 },
      { date: "Sat", views: 350 },
      { date: "Sun", views: 300 },
    ];

    return c.json({
      stats: {
        videosGenerated: videoStats.total,
        posted: videoStats.posted,
        scheduled: videoStats.ready,
        totalViews: videoStats.totalViews,
        activeAutomations: automationStats.active,
        totalAutomations: automationStats.total,
        templates: templates.length,
      },
      recentVideos: recentVideos.map((v) => ({
        id: v.id,
        title: v.title,
        status: v.status,
        views: v.views,
        topic: v.topic,
        createdAt: v.createdAt,
      })),
      topTopics,
      performanceData,
    }, 200);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json({ error: "Failed to fetch dashboard statistics" }, 500);
  }
}

/**
 * Get detailed analytics metrics
 */
export async function getAnalyticsMetrics(c: Context) {
  try {
    const userId = c.get("userId");
    const { startDate, endDate } = c.req.query();

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const metrics = await analyticsService.getOverallMetrics(userId, start, end);

    return c.json({ metrics }, 200);
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);
    return c.json({ error: "Failed to fetch analytics metrics" }, 500);
  }
}

/**
 * Get top performing videos
 */
export async function getTopVideos(c: Context) {
  try {
    const userId = c.get("userId");
    const { limit } = c.req.query();

    const videoLimit = limit ? parseInt(limit) : 10;
    const topVideos = await analyticsService.getTopVideos(userId, videoLimit);

    return c.json({ videos: topVideos }, 200);
  } catch (error) {
    console.error("Error fetching top videos:", error);
    return c.json({ error: "Failed to fetch top videos" }, 500);
  }
}

/**
 * Get topic performance
 */
export async function getTopicPerformance(c: Context) {
  try {
    const userId = c.get("userId");
    const topicPerformance = await analyticsService.getTopicPerformance(userId);

    return c.json({ topics: topicPerformance }, 200);
  } catch (error) {
    console.error("Error fetching topic performance:", error);
    return c.json({ error: "Failed to fetch topic performance" }, 500);
  }
}

/**
 * Get time series data
 */
export async function getTimeSeriesData(c: Context) {
  try {
    const userId = c.get("userId");
    const { startDate, endDate, interval } = c.req.query();

    if (!startDate || !endDate) {
      return c.json({ error: "startDate and endDate are required" }, 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const intervalType = (interval as "day" | "week" | "month") || "day";

    const timeSeriesData = await analyticsService.getTimeSeriesData(
      userId,
      start,
      end,
      intervalType
    );

    return c.json({ data: timeSeriesData }, 200);
  } catch (error) {
    console.error("Error fetching time series data:", error);
    return c.json({ error: "Failed to fetch time series data" }, 500);
  }
}

/**
 * Get automation performance
 */
export async function getAutomationPerformance(c: Context) {
  try {
    const userId = c.get("userId");
    const automationPerformance = await analyticsService.getAutomationPerformance(userId);

    return c.json({ automations: automationPerformance }, 200);
  } catch (error) {
    console.error("Error fetching automation performance:", error);
    return c.json({ error: "Failed to fetch automation performance" }, 500);
  }
}

/**
 * Get growth metrics
 */
export async function getGrowthMetrics(c: Context) {
  try {
    const userId = c.get("userId");
    const { startDate, endDate } = c.req.query();

    if (!startDate || !endDate) {
      return c.json({ error: "startDate and endDate are required" }, 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const growthMetrics = await analyticsService.getGrowthMetrics(userId, start, end);

    return c.json({ growth: growthMetrics }, 200);
  } catch (error) {
    console.error("Error fetching growth metrics:", error);
    return c.json({ error: "Failed to fetch growth metrics" }, 500);
  }
}

/**
 * Get engagement rate
 */
export async function getEngagementRate(c: Context) {
  try {
    const userId = c.get("userId");
    const engagementRate = await analyticsService.getEngagementRate(userId);

    return c.json({ engagementRate }, 200);
  } catch (error) {
    console.error("Error fetching engagement rate:", error);
    return c.json({ error: "Failed to fetch engagement rate" }, 500);
  }
}

/**
 * Get success rate
 */
export async function getSuccessRate(c: Context) {
  try {
    const userId = c.get("userId");
    const successRate = await analyticsService.getSuccessRate(userId);

    return c.json({ successRate }, 200);
  } catch (error) {
    console.error("Error fetching success rate:", error);
    return c.json({ error: "Failed to fetch success rate" }, 500);
  }
}
