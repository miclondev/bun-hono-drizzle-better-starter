# AI Features Documentation

Complete guide to AI-powered features in ViralSak using Anthropic Claude.

## Overview

ViralSak uses **Anthropic Claude 3.5 Sonnet** to generate high-quality, engaging video scripts optimized for short-form content platforms like TikTok and YouTube Shorts.

## Features

### 1. Script Generation
Generate complete video scripts from a simple topic input.

### 2. Title Generation
Create attention-grabbing, click-worthy titles.

### 3. Script Improvement
Enhance existing scripts for better engagement.

---

## Setup

### 1. Get Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-...`)

### 2. Configure Backend

Add to `viralsak-backend/.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 3. Restart Backend

```bash
cd viralsak-backend
bun run dev
```

---

## Script Generation

### How It Works

1. **User Input**: Topic and optional duration
2. **AI Processing**: Claude analyzes and creates script
3. **Optimization**: Paced for ~2.5 words per second
4. **Output**: Engaging script with strong hook

### Features

- **Hook-First**: Grabs attention in first 3 seconds
- **Optimal Pacing**: ~150 words for 60-second video
- **Conversational**: Natural, easy-to-read language
- **Narrative Arc**: Hook → Value → Payoff
- **Platform-Optimized**: Perfect for TikTok/Shorts
- **Clean Output**: No hashtags or emojis

### API Endpoint

```http
POST /api/v1/videos/ai/generate-script
Content-Type: application/json

{
  "topic": "Why coffee boosts productivity",
  "duration": 60
}
```

**Response:**
```json
{
  "script": "Ever wonder why that morning coffee hits different? Here's the science nobody talks about...\n\n[Full script content]"
}
```

### Frontend Usage

```typescript
import { useGenerateScript } from '@/hooks/use-videos';

const generateScript = useGenerateScript();

const handleGenerate = async () => {
  const script = await generateScript.mutateAsync({
    topic: "Why coffee boosts productivity",
    duration: 60
  });
  
  console.log(script); // Generated script
};
```

### Example Output

**Input:**
```
Topic: "The science of sleep"
Duration: 60 seconds
```

**Output:**
```
Did you know your brain is MORE active during sleep than when you're awake? 
Sounds crazy, right?

Here's what's actually happening. While you sleep, your brain is running a 
full maintenance cycle. It's clearing out toxins, consolidating memories, 
and literally rewiring neural pathways.

That's why pulling an all-nighter destroys your performance. You're not 
just tired - you're running on a brain that hasn't been maintained.

The fix? Prioritize those 7-9 hours. Your brain will thank you with better 
focus, creativity, and decision-making.

Sleep isn't lazy. It's essential maintenance for peak performance.
```

---

## Title Generation

### How It Works

1. **Input**: Video topic
2. **AI Analysis**: Identifies key hooks
3. **Optimization**: Creates curiosity gap
4. **Output**: Click-worthy title (max 60 chars)

### Features

- **Attention-Grabbing**: Uses power words
- **Curiosity-Driven**: Creates information gap
- **Length-Optimized**: Under 60 characters
- **Platform-Friendly**: Works on all platforms
- **No Clickbait**: Compelling but honest

### API Endpoint

```http
POST /api/v1/videos/ai/generate-title
Content-Type: application/json

{
  "topic": "The science of sleep"
}
```

**Response:**
```json
{
  "title": "The Dark Truth About Sleep Nobody Tells You"
}
```

### Frontend Usage

```typescript
import { useGenerateTitle } from '@/hooks/use-videos';

const generateTitle = useGenerateTitle();

const handleGenerate = async () => {
  const title = await generateTitle.mutateAsync(
    "The science of sleep"
  );
  
  console.log(title); // Generated title
};
```

### Example Outputs

| Topic | Generated Title |
|-------|----------------|
| Coffee benefits | "Why Your Morning Coffee Is Actually Genius" |
| Productivity tips | "The 3-Minute Trick That Doubled My Output" |
| Sleep science | "Your Brain's Secret Nighttime Routine" |
| Exercise myths | "Everything You Know About Exercise Is Wrong" |

---

## Script Improvement

### How It Works

1. **Input**: Existing script
2. **AI Analysis**: Identifies weak points
3. **Enhancement**: Improves hook, pacing, impact
4. **Output**: Polished, engaging script

### Features

- **Stronger Hook**: More compelling opening
- **Better Pacing**: Improved flow and rhythm
- **Emotional Impact**: Increased engagement
- **Message Preservation**: Keeps core content
- **Professional Polish**: Refined language

### API Endpoint

```http
POST /api/v1/videos/ai/improve-script
Content-Type: application/json

{
  "script": "Original script content here..."
}
```

**Response:**
```json
{
  "script": "Improved script with better hook and pacing..."
}
```

### Frontend Usage

```typescript
import { useImproveScript } from '@/hooks/use-videos';

const improveScript = useImproveScript();

const handleImprove = async (originalScript: string) => {
  const improved = await improveScript.mutateAsync(originalScript);
  
  console.log(improved); // Improved script
};
```

### Before/After Example

**Before:**
```
Coffee has caffeine which helps you focus. It blocks adenosine receptors 
in your brain. This makes you feel more alert and awake. Many people 
drink coffee in the morning for this reason.
```

**After:**
```
Here's why that morning coffee actually works magic on your brain.

Caffeine doesn't just wake you up - it literally blocks the chemical that 
makes you tired. It's like putting a "do not disturb" sign on your brain's 
sleep receptors.

The result? Instant clarity, laser focus, and that feeling like you can 
conquer anything.

That's not just caffeine. That's chemistry working in your favor.
```

---

## Best Practices

### 1. Topic Selection

**Good Topics:**
- Specific and focused
- Interesting or surprising
- Relevant to target audience
- Has a clear angle

**Examples:**
- ✅ "Why morning routines fail"
- ✅ "The psychology of procrastination"
- ✅ "How sleep affects memory"
- ❌ "General health tips" (too broad)
- ❌ "Everything about fitness" (too vague)

### 2. Duration Guidelines

| Duration | Word Count | Best For |
|----------|-----------|----------|
| 15 sec | ~35 words | Quick tips, facts |
| 30 sec | ~75 words | Short explanations |
| 60 sec | ~150 words | Full stories (recommended) |
| 90 sec | ~225 words | Detailed content |

### 3. Script Editing

After generation:
1. **Read aloud** - Check natural flow
2. **Adjust pacing** - Add/remove pauses
3. **Personalize** - Add your voice
4. **Test hook** - First 3 seconds crucial
5. **Check length** - Match video duration

### 4. Iteration

Don't settle for first generation:
- Generate multiple versions
- Mix and match best parts
- Use improvement feature
- A/B test different hooks

---

## Advanced Usage

### Custom Prompts (Backend)

Modify `src/services/ai.service.ts` for custom behavior:

```typescript
const prompt = `You are a viral short-form video script writer...

Custom requirements:
- Target audience: ${audience}
- Tone: ${tone}
- Call-to-action: ${cta}

Create a ${duration}-second script about: "${topic}"`;
```

### Batch Generation

Generate multiple scripts at once:

```typescript
const topics = [
  "Topic 1",
  "Topic 2", 
  "Topic 3"
];

const scripts = await Promise.all(
  topics.map(topic => 
    generateScript.mutateAsync({ topic, duration: 60 })
  )
);
```

### Template Integration

Combine AI with templates:

```typescript
// 1. Generate script
const script = await generateScript.mutateAsync({ topic });

// 2. Apply template
const video = await createVideo.mutateAsync({
  title: await generateTitle.mutateAsync(topic),
  script,
  voiceId: template.voiceId,
  bgStyle: template.bgStyle,
  textStyle: template.textStyle
});
```

---

## Troubleshooting

### API Key Issues

**Error:** `ANTHROPIC_API_KEY is not configured`

**Solution:**
1. Check `.env` file exists
2. Verify key is correct
3. Restart backend server
4. Check key hasn't expired

### Rate Limiting

**Error:** `429 Too Many Requests`

**Solution:**
- Anthropic has rate limits
- Free tier: 50 requests/day
- Paid tier: Higher limits
- Implement request queuing

### Quality Issues

**Problem:** Generated scripts are generic

**Solutions:**
1. **Be more specific** with topics
2. **Add context** in topic description
3. **Use improvement** feature
4. **Iterate** multiple times
5. **Edit manually** for personalization

### Timeout Errors

**Error:** Request timeout

**Solution:**
- Increase timeout in API client
- Check network connection
- Verify Anthropic API status
- Retry with exponential backoff

---

## Cost Management

### Anthropic Pricing

Claude 3.5 Sonnet pricing (as of 2024):
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens

### Estimated Costs

| Action | Tokens | Cost |
|--------|--------|------|
| Generate Script | ~500 | $0.0075 |
| Generate Title | ~100 | $0.0015 |
| Improve Script | ~600 | $0.0090 |

**Monthly estimates:**
- 100 scripts: ~$0.75
- 500 scripts: ~$3.75
- 1000 scripts: ~$7.50

### Optimization Tips

1. **Cache results** - Store generated scripts
2. **Batch requests** - Group similar topics
3. **Reuse scripts** - Adapt existing content
4. **Set limits** - Implement usage quotas
5. **Monitor usage** - Track API calls

---

## Future Enhancements

### Planned Features

1. **Multi-language Support**
   - Generate scripts in multiple languages
   - Automatic translation

2. **Voice Matching**
   - Suggest voice based on script tone
   - Optimize pacing for voice

3. **Trend Integration**
   - Generate scripts from trending topics
   - Real-time trend analysis

4. **A/B Testing**
   - Generate multiple variants
   - Track performance metrics

5. **Custom Training**
   - Fine-tune on your best scripts
   - Learn your style and voice

---

## Examples & Templates

### Hook Templates

```
Pattern 1: Question Hook
"Did you know [surprising fact]?"
"Ever wonder why [common thing]?"

Pattern 2: Statement Hook
"Here's the truth about [topic]..."
"Nobody talks about [hidden aspect]..."

Pattern 3: Story Hook
"I used to think [misconception]..."
"Last week I discovered [revelation]..."
```

### Script Structure

```
[HOOK - 3 seconds]
Attention-grabbing opening

[CONTEXT - 10 seconds]
Set up the problem/topic

[VALUE - 35 seconds]
Main content/explanation

[PAYOFF - 12 seconds]
Key takeaway/call-to-action
```

### Topic Ideas

**Education:**
- "Why [common belief] is wrong"
- "The science behind [phenomenon]"
- "What [experts] don't tell you"

**Productivity:**
- "The [number]-minute trick for [result]"
- "How to [achieve goal] without [common method]"
- "Why [popular method] doesn't work"

**Psychology:**
- "The hidden reason you [behavior]"
- "What your [habit] says about you"
- "The psychology of [common situation]"

---

## API Reference

### AIService Class

```typescript
class AIService {
  // Generate video script
  async generateScript(
    topic: string, 
    duration?: number
  ): Promise<string>

  // Generate video title
  async generateTitle(
    topic: string
  ): Promise<string>

  // Improve existing script
  async improveScript(
    script: string
  ): Promise<string>
}
```

### React Hooks

```typescript
// Generate script
const generateScript = useGenerateScript();
const { mutateAsync, isPending, error } = generateScript;

// Generate title
const generateTitle = useGenerateTitle();

// Improve script
const improveScript = useImproveScript();
```

---

## Resources

- [Anthropic Documentation](https://docs.anthropic.com)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Best Practices](https://docs.anthropic.com/claude/docs/best-practices)

---

## Support

For AI-related issues:
1. Check Anthropic API status
2. Verify API key configuration
3. Review error messages
4. Check rate limits
5. Contact support if needed

**Anthropic Support:** support@anthropic.com
