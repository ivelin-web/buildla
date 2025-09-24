import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Assistant } from '@/types';

interface AssistantSelectorProps {
  assistants: Assistant[];
  selectedAssistant: string;
  onChange: (assistantId: string) => void | Promise<void>;
}

export function AssistantSelector({ assistants, selectedAssistant, onChange }: AssistantSelectorProps) {
  return (
    <div className="p-5 border-b border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Välj assistent:
      </label>
      <Select
        value={selectedAssistant}
        onValueChange={(assistantId) => {
          void onChange(assistantId);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Välj en assistent..." />
        </SelectTrigger>
        <SelectContent>
          {assistants.map((assistant) => (
            <SelectItem key={assistant.id} value={assistant.id}>
              {assistant.name} ({assistant.description})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
