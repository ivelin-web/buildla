import { type UIMessage } from 'ai';

export type MessageSource = {
  url: string;
  title?: string | null;
  source?: string | null;
  similarity?: number;
  content?: string;
};

export type ChatMessagePart = UIMessage['parts'][number];

export type ToolOutputPartWithType<TType extends string> = ChatMessagePart & {
  type: TType;
  state: 'output-available';
  output: unknown;
};
