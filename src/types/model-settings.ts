// Model type constant - single source of truth for GPT-5 family
export type ModelType = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano';

export const MODEL_OPTIONS = [
  { value: 'gpt-5' as const, label: 'GPT-5', cost: '$1.25/$10 per 1M tokens' },
  { value: 'gpt-5-mini' as const, label: 'GPT-5 Mini', cost: '$0.25/$2 per 1M tokens' },
  { value: 'gpt-5-nano' as const, label: 'GPT-5 Nano', cost: '$0.05/$0.40 per 1M tokens' }
] as const;

// GPT-5 specific parameter types
export type VerbosityLevel = 'low' | 'medium' | 'high';
export type ReasoningEffortLevel = 'minimal' | 'low' | 'medium' | 'high';

export const VERBOSITY_OPTIONS = [
  { value: 'low' as const, label: 'Low', description: 'Concise responses' },
  { value: 'medium' as const, label: 'Medium', description: 'Balanced detail' },
  { value: 'high' as const, label: 'High', description: 'Comprehensive responses' }
] as const;

export const REASONING_EFFORT_OPTIONS = [
  { value: 'minimal' as const, label: 'Minimal', description: 'Fastest responses' },
  { value: 'low' as const, label: 'Low', description: 'Quick reasoning' },
  { value: 'medium' as const, label: 'Medium', description: 'Balanced reasoning' },
  { value: 'high' as const, label: 'High', description: 'Deep reasoning' }
] as const;