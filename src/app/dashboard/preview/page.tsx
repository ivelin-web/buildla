import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CopyCodeButton from '@/components/CopyCodeButton';
import PreviewClientWrapper from '@/components/PreviewClientWrapper';
import { getModelSettings } from '@/lib/actions/model-settings';

export default async function ChatPreviewPage() {
  // Fetch initial settings on the server
  let initialSettings = null;
  try {
    initialSettings = await getModelSettings();
  } catch (error) {
    console.error('Failed to load initial model settings:', error);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Chat Preview</CardTitle>
            <CardDescription>
              Test your AI assistants with different model settings
            </CardDescription>
          </div>
          <CopyCodeButton />
        </div>
      </CardHeader>
      <CardContent>
        <PreviewClientWrapper initialSettings={initialSettings} />
      </CardContent>
    </Card>
  );
} 