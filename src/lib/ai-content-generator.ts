import OpenAI from 'openai';

export class AIContentGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateContent(params: {
    businessName: string;
    businessType: string;
    contentType: string;
    platform: string;
    strategyName: string;
    postDate: string;
  }): Promise<{
    image_description: string;
    caption: string;
    hashtags: string;
    cta: string;
  }> {
    const prompt = `
# SOCIAL MEDIA CONTENT GENERATOR

## BUSINESS CONTEXT
Business Name: ${params.businessName}
Business Type: ${params.businessType}
Strategy: ${params.strategyName}
Content Type: ${params.contentType}
Platform: ${params.platform}
Posting Date: ${params.postDate}

## TASK
Generate a complete ${params.contentType} social media post optimized for ${params.platform} that:
- Follows ${params.strategyName} strategy principles
- Uses professional but engaging tone
- Includes relevant hashtags
- Has a clear call-to-action

## OUTPUT FORMAT (JSON)
{
  "image_description": "Detailed description for AI image generation (max 50 words)",
  "caption": "Engaging caption optimized for ${params.platform} (max 150 words)",
  "hashtags": "5-8 relevant hashtags separated by spaces",
  "cta": "Clear call-to-action aligned with business goals"
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content generated');

      return JSON.parse(content);
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.getFallbackContent(params.contentType);
    }
  }

  private getFallbackContent(contentType: string) {
    const fallbacks = {
      community: {
        image_description: "Engaging community-focused image",
        caption: "Join our community and share your thoughts!",
        hashtags: "#community #engagement #together",
        cta: "Comment below with your thoughts!"
      },
      educational: {
        image_description: "Educational infographic or tips image", 
        caption: "Here's a valuable tip for your business growth.",
        hashtags: "#tips #education #business #growth",
        cta: "Save this post for later reference!"
      },
      behind_scenes: {
        image_description: "Behind-the-scenes workplace image",
        caption: "Take a peek behind the scenes of our daily operations.",
        hashtags: "#behindthescenes #team #work #culture", 
        cta: "What would you like to see more of?"
      },
      promotional: {
        image_description: "Product or service promotional image",
        caption: "Discover our latest offering designed just for you.",
        hashtags: "#newproduct #offer #business #quality",
        cta: "Learn more in our bio link!"
      }
    };

    return fallbacks[contentType as keyof typeof fallbacks] || fallbacks.community;
  }
}
