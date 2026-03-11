import Anthropic from "@anthropic-ai/sdk";

/**
 * AI Service for script generation using Anthropic Claude
 */
export class AIService {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate a video script based on a topic
   */
  async generateScript(topic: string, duration: number = 60): Promise<string> {
    const prompt = `You are a viral short-form video script writer. Create an engaging, attention-grabbing script for a ${duration}-second video about: "${topic}"

Requirements:
- Hook the viewer in the first 3 seconds
- Keep it concise and punchy
- Use simple, conversational language
- Include a clear narrative arc (hook, value, payoff)
- Make it suitable for TikTok/YouTube Shorts format
- No hashtags or emojis
- Aim for approximately ${Math.floor(duration / 0.4)} words (assuming 2.5 words per second)

Write ONLY the script text that will be spoken. No stage directions, no descriptions, just the words to be said.`;

    try {
      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return content.text.trim();
      }

      throw new Error("Unexpected response format from Claude");
    } catch (error) {
      console.error("Error generating script with Claude:", error);
      throw new Error(
        `Failed to generate script: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate a video title based on a topic
   */
  async generateTitle(topic: string): Promise<string> {
    const prompt = `Create a catchy, attention-grabbing title for a short-form video about: "${topic}"

Requirements:
- Maximum 60 characters
- Make it intriguing and clickable
- Use power words that create curiosity
- No clickbait, but make it compelling
- Suitable for TikTok/YouTube Shorts

Respond with ONLY the title, nothing else.`;

    try {
      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return content.text.trim();
      }

      throw new Error("Unexpected response format from Claude");
    } catch (error) {
      console.error("Error generating title with Claude:", error);
      throw new Error(
        `Failed to generate title: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Improve an existing script
   */
  async improveScript(script: string): Promise<string> {
    const prompt = `Improve this short-form video script to make it more engaging and viral-worthy:

"${script}"

Requirements:
- Keep the same general topic and message
- Make the hook stronger (first 3 seconds)
- Improve pacing and flow
- Add more emotional impact
- Keep it concise
- No hashtags or emojis

Write ONLY the improved script text, nothing else.`;

    try {
      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return content.text.trim();
      }

      throw new Error("Unexpected response format from Claude");
    } catch (error) {
      console.error("Error improving script with Claude:", error);
      throw new Error(
        `Failed to improve script: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
