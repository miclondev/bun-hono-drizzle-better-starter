import type { Context } from "hono";
import { videoRepository, automationRepository, templateRepository } from "../db/repositories";

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
