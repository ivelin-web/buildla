import { type MessageSource, type ChatMessagePart, type ToolOutputPartWithType } from '../types';

export interface FaqToolResponse {
  results: MessageSource[];
}

export interface SaveOfferResponse {
  success: boolean;
}

export function isToolOutputPartOfType<TType extends string>(
  part: ChatMessagePart,
  type: TType
): part is ToolOutputPartWithType<TType> {
  return (
    part.type === type &&
    'state' in part &&
    (part as { state?: unknown }).state === 'output-available' &&
    'output' in part
  );
}

export const isFaqToolResponse = (value: unknown): value is FaqToolResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { results?: unknown };

  if (!Array.isArray(candidate.results)) {
    return false;
  }

  return candidate.results.every((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const result = item as { url?: unknown };
    return typeof result.url === 'string';
  });
};

export const isSaveOfferResponse = (value: unknown): value is SaveOfferResponse =>
  !!value &&
  typeof value === 'object' &&
  'success' in value &&
  typeof (value as { success: unknown }).success === 'boolean';

export const parseToolOutput = <T,>(rawOutput: unknown): T | null => {
  if (typeof rawOutput === 'string') {
    try {
      return JSON.parse(rawOutput) as T;
    } catch (error) {
      console.error('Failed to parse tool result:', error);
      return null;
    }
  }

  if (rawOutput && typeof rawOutput === 'object') {
    return rawOutput as T;
  }

  return null;
};
