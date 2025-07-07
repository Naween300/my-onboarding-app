import { createClient } from '@supabase/supabase-js';
import { AIContentGenerator } from './ai-content-generator';
import { getContentMixForStrategy, OPTIMAL_POSTING_TIMES } from './content-strategy-mapping';

export class ContentCalendarService {
  private supabase;
  private aiGenerator: AIContentGenerator;

  constructor(supabaseUrl: string, supabaseKey: string, openaiKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.aiGenerator = new AIContentGenerator(openaiKey);
  }

  async generateMonthlyCalendar(
    userId: string,
    strategyId: string,
    month: number,
    year: number,
    userProfile: any
  ) {
    // Check if calendar already exists
    const existingCalendar = await this.getCalendar(userId, month, year);
    if (existingCalendar) {
      return existingCalendar;
    }

    // 1. Create calendar skeleton
    const { data: calendar, error: calendarError } = await this.supabase
      .from('content_calendars')
      .insert({
        clerk_user_id: userId,
        strategy_id: strategyId,
        month,
        year
      })
      .select()
      .single();

    if (calendarError) throw calendarError;

    // 2. Generate content distribution
    const contentMix = getContentMixForStrategy(strategyId);
    const totalDays = this.getDaysInMonth(month, year);
    const contentSchedule = this.distributeContentTypes(contentMix, totalDays);

    // 3. Generate AI content for each day
    const dailyContent = await this.generateAllContent(
      userProfile,
      contentSchedule,
      strategyId,
      month,
      year
    );

    // 4. Save daily content to database
    const contentToInsert = dailyContent.map(content => ({
      ...content,
      calendar_id: calendar.id,
      clerk_user_id: userId
    }));

    const { error: contentError } = await this.supabase
      .from('daily_content')
      .insert(contentToInsert);

    if (contentError) throw contentError;

    // 5. Return complete calendar with content
    return await this.getCalendar(userId, month, year);
  }

  async getCalendar(userId: string, month: number, year: number) {
    const { data, error } = await this.supabase
      .from('content_calendars')
      .select(`
        *,
        daily_content (*)
      `)
      .eq('clerk_user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private distributeContentTypes(contentMix: Record<string, number>, totalDays: number) {
    const platforms = ['instagram', 'facebook', 'linkedin'];
    const schedule = [];

    for (let day = 1; day <= totalDays; day++) {
      const contentType = this.selectContentTypeForDay(day, contentMix, totalDays);
      const platform = platforms[day % platforms.length];
      const optimalTime = this.getOptimalTime(platform);

      schedule.push({
        date: day,
        contentType,
        platform,
        optimalTime
      });
    }

    return schedule;
  }

  private selectContentTypeForDay(
    day: number,
    contentMix: Record<string, number>,
    totalDays: number
  ): string {
    const dayRatio = day / totalDays;
    let cumulative = 0;

    for (const [type, percentage] of Object.entries(contentMix)) {
      cumulative += percentage / 100;
      if (dayRatio <= cumulative) {
        return type;
      }
    }

    return Object.keys(contentMix)[0] || 'educational';
  }

  private getOptimalTime(platform: string): string {
    const times = OPTIMAL_POSTING_TIMES[platform as keyof typeof OPTIMAL_POSTING_TIMES] || ['12:00'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private async generateAllContent(
    userProfile: any,
    contentSchedule: any[],
    strategyId: string,
    month: number,
    year: number
  ) {
    const dailyContent = [];

    console.log('🎯 Generating content with user profile:', {
      business_name: userProfile.business_name,
      business_type: userProfile.business_type,
      customer_type: userProfile.customer_type
    });

    for (const schedule of contentSchedule) {
      const variables = {
        businessName: userProfile.business_name,
        businessType: userProfile.business_type,
        contentType: schedule.contentType,
        platform: schedule.platform,
        strategyName: strategyId,
        postDate: `${year}-${month.toString().padStart(2, '0')}-${schedule.date.toString().padStart(2, '0')}`
      };

      console.log('🤖 Generating AI content with variables:', variables);

      const generatedContent = await this.aiGenerator.generateContent(variables);

      dailyContent.push({
        post_date: variables.postDate,
        content_type: schedule.contentType,
        platform: schedule.platform,
        optimal_time: schedule.optimalTime,
        image_description: generatedContent.image_description,
        caption: generatedContent.caption,
        hashtags: generatedContent.hashtags,
        cta: generatedContent.cta,
        status: 'scheduled'
      });
    }

    return dailyContent;
  }

  private getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  async updateDailyContent(contentId: string, updates: any) {
    const { error } = await this.supabase
      .from('daily_content')
      .update(updates)
      .eq('id', contentId);

    if (error) throw error;
  }

  async deleteCalendar(userId: string, month: number, year: number) {
    const { error } = await this.supabase
      .from('content_calendars')
      .delete()
      .eq('clerk_user_id', userId)
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
  }
}
