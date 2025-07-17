import { createClient } from '@supabase/supabase-js';
import { DataMapper } from './data-mapper';

export class ContentGenerator {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async generateContent(templateKey: string, onboardingData: any) {
    try {
      // Get template from database
      const { data: template, error } = await this.supabase
        .from('content_prompt_templates')
        .select('*')
        .eq('template_key', templateKey)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Map onboarding data to template variables
      const mappedData = DataMapper.mapOnboardingData(onboardingData);

      // Replace variables in prompt
      let personalizedPrompt = template.prompt_content;
      Object.entries(mappedData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        personalizedPrompt = personalizedPrompt.replace(regex, String(value));
      });

      return {
        success: true,
        prompt: personalizedPrompt,
        template: template.template_name,
        caption_structure: template.caption_structure,
        image_design_notes: template.image_design_notes
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
} 