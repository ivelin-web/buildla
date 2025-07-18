'use server';

import { createClient } from '@/lib/supabase/server';
import { ModelSettings, InsertModelSettings, UpdateModelSettings } from '@/lib/supabase/types';
import { ModelType } from '@/types/model-settings';

export async function getModelSettings(): Promise<ModelSettings> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('model_settings')
    .select('*')
    .single();

  if (error || !data) {
    // If no settings exist, create default settings
    const defaultSettings: InsertModelSettings = {
      model: 'gpt-4.1-nano' as ModelType,
      temperature: 0.20,
      max_tokens: 2048,
      top_p: 1.00
    };

    const { data: newSettings, error: createError } = await supabase
      .from('model_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create default settings: ${createError.message}`);
    }

    return newSettings;
  }

  return data;
}

export async function updateModelSettings(settings: UpdateModelSettings): Promise<ModelSettings> {
  const supabase = await createClient();

  // Get current settings first
  const currentSettings = await getModelSettings();

  const { data, error } = await supabase
    .from('model_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentSettings.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update model settings: ${error.message}`);
  }

  return data;
}