import { db } from "../db/config";
import { videos, automations } from "../db/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

/**
 * Analytics metrics for a time period
 */
export interface AnalyticsMetrics {
  totalVideos: number;
  videosGenerated: number;
  videosPosted: number;
  videosFailed: number;
  totalViews: number;
  averageViews: number;
  totalAutomations: number;
  activeAutomations: number;
  videosFromAutomations: number;
}

/**
 * Video performance data
 */
export interface VideoPerformance {
  id: string;
  title: string;
  topic: string;
  views: number;
  status: string;
  createdAt: Date;
  postedAt?: Date;
}

/**
 * Topic performance data
 */
export interface TopicPerformance {
  topic: string;
  videoCount: number;
  totalViews: number;
  averageViews: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesData {
  date: string;
  videos: number;
  views: number;
  posted: number;
}

/**
 * Automation performance data
 */
export interface AutomationPerformance {
  id: string;
  name: string;
  videosGenerated: number;
  totalViews: number;
  averageViews: number;
  lastRunAt?: Date;
}

/**
 * Analytics Service for performance metrics
 */
export class AnalyticsService {
  /**
   * Get overall analytics metrics for a user
   */
  async getOverallMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsMetrics> {
    const dateFilter = startDate && endDate
      ? and(
          eq(videos.userId, userId),
          gte(videos.createdAt, startDate),
          lte(videos.createdAt, endDate)
        )
      : eq(videos.userId, userId);

    // Get video statistics
    const videoStats = await db
      .select({
        total: count(),
        posted: sql<number>`COUNT(CASE WHEN ${videos.status} = 'posted' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${videos.status} = 'failed' THEN 1 END)`,
        totalViews: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
        avgViews: sql<number>`COALESCE(AVG(${videos.views}), 0)`,
      })
      .from(videos)
      .where(dateFilter);

    // Get automation statistics
    const automationStats = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(CASE WHEN ${automations.active} = true THEN 1 END)`,
        videosGenerated: sql<number>`COALESCE(SUM(${automations.videosGenerated}), 0)`,
      })
      .from(automations)
      .where(eq(automations.userId, userId));

    const stats = videoStats[0];
    const autoStats = automationStats[0];

    return {
      totalVideos: Number(stats.total),
      videosGenerated: Number(stats.total),
      videosPosted: Number(stats.posted),
      videosFailed: Number(stats.failed),
      totalViews: Number(stats.totalViews),
      averageViews: Math.round(Number(stats.avgViews)),
      totalAutomations: Number(autoStats.total),
      activeAutomations: Number(autoStats.active),
      videosFromAutomations: Number(autoStats.videosGenerated),
    };
  }

  /**
   * Get top performing videos
   */
  async getTopVideos(userId: string, limit: number = 10): Promise<VideoPerformance[]> {
    const topVideos = await db
      .select({
        id: videos.id,
        title: videos.title,
        topic: videos.topic,
        views: videos.views,
        status: videos.status,
        createdAt: videos.createdAt,
      })
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.views))
      .limit(limit);

    return topVideos.map((v): VideoPerformance => ({
      id: v.id,
      title: v.title,
      topic: v.topic,
      views: v.views || 0,
      status: v.status,
      createdAt: v.createdAt!,
    }));
  }

  /**
   * Get performance by topic
   */
  async getTopicPerformance(userId: string): Promise<TopicPerformance[]> {
    const topicStats = await db
      .select({
        topic: videos.topic,
        videoCount: count(),
        totalViews: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
        avgViews: sql<number>`COALESCE(AVG(${videos.views}), 0)`,
      })
      .from(videos)
      .where(eq(videos.userId, userId))
      .groupBy(videos.topic)
      .orderBy(desc(sql`COALESCE(SUM(${videos.views}), 0)`))
      .limit(10);

    return topicStats.map((t): TopicPerformance => ({
      topic: t.topic,
      videoCount: Number(t.videoCount),
      totalViews: Number(t.totalViews),
      averageViews: Math.round(Number(t.avgViews)),
    }));
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    userId: string,
    startDate: Date,
    endDate: Date,
    interval: "day" | "week" | "month" = "day"
  ): Promise<TimeSeriesData[]> {
    // Format date based on interval
    let dateFormat: string;
    switch (interval) {
      case "week":
        dateFormat = "YYYY-IW"; // ISO week
        break;
      case "month":
        dateFormat = "YYYY-MM";
        break;
      default:
        dateFormat = "YYYY-MM-DD";
    }

    const timeSeriesData = await db
      .select({
        date: sql<string>`TO_CHAR(${videos.createdAt}, ${dateFormat})`,
        videos: count(),
        views: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
        posted: sql<number>`COUNT(CASE WHEN ${videos.status} = 'posted' THEN 1 END)`,
      })
      .from(videos)
      .where(
        and(
          eq(videos.userId, userId),
          gte(videos.createdAt, startDate),
          lte(videos.createdAt, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${videos.createdAt}, ${dateFormat})`)
      .orderBy(sql`TO_CHAR(${videos.createdAt}, ${dateFormat})`);

    return timeSeriesData.map((d): TimeSeriesData => ({
      date: d.date,
      videos: Number(d.videos),
      views: Number(d.views),
      posted: Number(d.posted),
    }));
  }

  /**
   * Get automation performance
   */
  async getAutomationPerformance(userId: string): Promise<AutomationPerformance[]> {
    const automationData = await db
      .select({
        id: automations.id,
        name: automations.name,
        videosGenerated: automations.videosGenerated,
        lastRunAt: automations.lastRunAt,
      })
      .from(automations)
      .where(eq(automations.userId, userId))
      .orderBy(desc(automations.videosGenerated));

    // For each automation, calculate total views from its videos
    const performanceData = await Promise.all(
      automationData.map(async (auto): Promise<AutomationPerformance> => {
        // Note: This is a simplified version. In production, you'd want to track
        // which videos came from which automation in the database
        const viewStats = await db
          .select({
            totalViews: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
            avgViews: sql<number>`COALESCE(AVG(${videos.views}), 0)`,
          })
          .from(videos)
          .where(
            and(
              eq(videos.userId, userId),
              eq(videos.topic, auto.name) // Simplified: match by topic
            )
          );

        return {
          id: auto.id,
          name: auto.name,
          videosGenerated: auto.videosGenerated || 0,
          totalViews: Number(viewStats[0]?.totalViews || 0),
          averageViews: Math.round(Number(viewStats[0]?.avgViews || 0)),
          lastRunAt: auto.lastRunAt || undefined,
        };
      })
    );

    return performanceData;
  }

  /**
   * Get growth metrics (comparison with previous period)
   */
  async getGrowthMetrics(userId: string, currentStart: Date, currentEnd: Date) {
    const periodLength = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - periodLength);
    const previousEnd = currentStart;

    const currentMetrics = await this.getOverallMetrics(userId, currentStart, currentEnd);
    const previousMetrics = await this.getOverallMetrics(userId, previousStart, previousEnd);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      videosGrowth: calculateGrowth(currentMetrics.videosGenerated, previousMetrics.videosGenerated),
      viewsGrowth: calculateGrowth(currentMetrics.totalViews, previousMetrics.totalViews),
      postedGrowth: calculateGrowth(currentMetrics.videosPosted, previousMetrics.videosPosted),
      avgViewsGrowth: calculateGrowth(currentMetrics.averageViews, previousMetrics.averageViews),
    };
  }

  /**
   * Get engagement rate (views per video)
   */
  async getEngagementRate(userId: string): Promise<number> {
    const stats = await db
      .select({
        totalVideos: count(),
        totalViews: sql<number>`COALESCE(SUM(${videos.views}), 0)`,
      })
      .from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.status, "posted")));

    const totalVideos = Number(stats[0]?.totalVideos || 0);
    const totalViews = Number(stats[0]?.totalViews || 0);

    return totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
  }

  /**
   * Get success rate (posted vs failed)
   */
  async getSuccessRate(userId: string): Promise<number> {
    const stats = await db
      .select({
        total: count(),
        posted: sql<number>`COUNT(CASE WHEN ${videos.status} = 'posted' THEN 1 END)`,
      })
      .from(videos)
      .where(eq(videos.userId, userId));

    const total = Number(stats[0]?.total || 0);
    const posted = Number(stats[0]?.posted || 0);

    return total > 0 ? Math.round((posted / total) * 100) : 0;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
