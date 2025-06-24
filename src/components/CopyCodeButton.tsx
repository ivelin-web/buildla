'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/lib/toast';

const generateSnippet = () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://buildla.vercel.app' 
    : 'http://localhost:3000';
    
  return `<!-- Buildla AI Chat Widget -->
<iframe 
  src="${baseUrl}/widget" 
  width="500" 
  height="600"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"
  title="Buildla AI Assistant">
</iframe>`;
};

export default function CopyCodeButton() {
  const handleCopy = () => {
    navigator.clipboard.writeText(generateSnippet());
    showSuccess('Code copied to clipboard!', 'You can now paste it into your Squarespace site.');
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