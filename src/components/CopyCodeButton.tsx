'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const generateSnippet = (taskId: string = 'bathroom') => {
  return `<!-- Buildla AI Chat Widget -->
<div id="buildla-chat-${taskId}" style="max-width: 600px; margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
    <h3 style="margin: 0 0 10px 0; font-size: 1.2em; font-weight: 600;">AI Assistant</h3>
    <p style="margin: 0; color: rgba(255,255,255,0.9);">Get instant assistance and quotes</p>
  </div>
  <div style="padding: 20px; text-align: center;">
    <p style="margin: 0; color: #666;">Chat widget will load here</p>
    <button onclick="loadBuildlaChat('${taskId}')" style="margin-top: 15px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 24px; cursor: pointer; font-size: 14px;">
      Start Chat
    </button>
  </div>
</div>

<script>
function loadBuildlaChat(taskId) {
  // This would normally load the full chat functionality
  alert('Chat functionality would load here. TaskId: ' + taskId);
}
</script>`;
};

export default function CopyCodeButton() {
  const handleCopy = () => {
    navigator.clipboard.writeText(generateSnippet());
    alert('HTML code copied to clipboard!');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="cursor-pointer"
    >
      <Copy className="w-4 h-4 mr-2" />
      Copy Embed Code
    </Button>
  );
} 