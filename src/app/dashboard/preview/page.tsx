import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ChatWidget from '@/components/chat/ChatWidget';
import CopyCodeButton from '@/components/CopyCodeButton';

export default function ChatPreviewPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Chat Preview</CardTitle>
            <CardDescription>
              Test your AI assistants and see how they interact with customers
            </CardDescription>
          </div>
          <CopyCodeButton />
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            This is a live preview of how your chat widget will appear to customers. 
            You can test all functionality here before embedding it on your website.
          </p>
        </div>
        <ChatWidget />
      </CardContent>
    </Card>
  );
} 