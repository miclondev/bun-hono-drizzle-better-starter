import Parser from "rss-parser";

/**
 * RSS Feed Item
 */
export interface RssFeedItem {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  categories?: string[];
  author?: string;
}

/**
 * Parsed RSS Feed
 */
export interface ParsedRssFeed {
  title: string;
  description?: string;
  link: string;
  items: RssFeedItem[];
}

/**
 * RSS Service for parsing and fetching RSS feeds
 */
export class RssService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "ViralSak/1.0",
      },
    });
  }

  /**
   * Parse an RSS feed from URL
   */
  async parseFeed(url: string): Promise<ParsedRssFeed> {
    try {
      const feed = await this.parser.parseURL(url);

      return {
        title: feed.title || "Untitled Feed",
        description: feed.description,
        link: feed.link || url,
        items: feed.items.map((item) => ({
          title: item.title || "Untitled",
          link: item.link || "",
          pubDate: item.pubDate,
          content: item.content,
          contentSnippet: item.contentSnippet,
          guid: item.guid,
          categories: item.categories,
          author: item.author,
        })),
      };
    } catch (error) {
      console.error("Error parsing RSS feed:", error);
      throw new Error(
        `Failed to parse RSS feed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get latest items from RSS feed
   */
  async getLatestItems(url: string, limit: number = 10): Promise<RssFeedItem[]> {
    const feed = await this.parseFeed(url);
    return feed.items.slice(0, limit);
  }

  /**
   * Extract topic from RSS item
   */
  extractTopic(item: RssFeedItem): string {
    // Try categories first
    if (item.categories && item.categories.length > 0) {
      return item.categories[0];
    }

    // Fallback to extracting from title
    const words = item.title.split(" ");
    if (words.length > 0) {
      return words.slice(0, 3).join(" ");
    }

    return "General";
  }

  /**
   * Generate script prompt from RSS item
   */
  generateScriptPrompt(item: RssFeedItem): string {
    const content = item.contentSnippet || item.content || item.title;
    
    // Clean HTML tags if present
    const cleanContent = content.replace(/<[^>]*>/g, "");
    
    // Truncate to reasonable length
    const maxLength = 500;
    const truncated = cleanContent.length > maxLength 
      ? cleanContent.substring(0, maxLength) + "..."
      : cleanContent;

    return `Create a short-form video script based on this article:

Title: ${item.title}

Content: ${truncated}

Make it engaging and suitable for TikTok/YouTube Shorts format.`;
  }

  /**
   * Check if RSS feed URL is valid
   */
  async validateFeedUrl(url: string): Promise<boolean> {
    try {
      await this.parseFeed(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get feed metadata without items
   */
  async getFeedMetadata(url: string): Promise<{ title: string; description?: string; link: string }> {
    const feed = await this.parseFeed(url);
    return {
      title: feed.title,
      description: feed.description,
      link: feed.link,
    };
  }
}

// Export singleton instance
export const rssService = new RssService();
