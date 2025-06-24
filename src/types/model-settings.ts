// Model type constant - single source of truth
export type ModelType = 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano';

export const MODEL_OPTIONS = [
  { value: 'gpt-4.1' as const, label: 'GPT-4.1', cost: '$2/$8 per 1M tokens' },
  { value: 'gpt-4.1-mini' as const, label: 'GPT-4.1 Mini', cost: '$0.40/$1.60 per 1M tokens' },
  { value: 'gpt-4.1-nano' as const, label: 'GPT-4.1 Nano', cost: '$0.10/$0.40 per 1M tokens' }
] as const;