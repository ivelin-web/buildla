import AssistantsManager from '@/components/AssistantsManager';
import { getAssistants } from '@/lib/actions/assistants';

export default async function AssistantsPage() {
  const assistants = await getAssistants();

  return <AssistantsManager assistants={assistants} />;
}