'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/lib/toast';

const generateSnippet = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
  return `<!-- Buildla AI Chat Widget -->
<div id="buildla-container" style="width: 100%; height: 400px; margin: 0 auto;">
  <iframe
    src="${baseUrl}/widget"
    style="display: block; width: 100%; height: 100%; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"
    title="Buildla AI Assistant">
  </iframe>
</div>
<script>
  (function() {
    function initBuildlaWidget() {
      var container = document.getElementById('buildla-container');
      var block = container.closest('.sqs-block');
      
      if (container && block) {
        var setDimensions = function() {
          // Get dimensions from the resizable Squarespace block.
          var blockHeight = block.clientHeight;
          var blockWidth = block.clientWidth;
          
          // Calculate max height as 90% of the viewport height to avoid overflow.
          var maxHeight = window.innerHeight * 0.9;
          // Use the smaller of the two values for height.
          var newHeight = Math.min(blockHeight, maxHeight);
          
          // Set responsive width with reasonable constraints
          var minWidth = 320; // Minimum width for mobile
          var maxWidth = 800; // Maximum reasonable width for desktop
          var newWidth = Math.max(minWidth, Math.min(blockWidth, maxWidth));
          
          if (newHeight > 0) {
            container.style.height = newHeight + 'px';
          }
          
          if (newWidth > 0) {
            container.style.width = newWidth + 'px';
          }
        };
        
        setDimensions();
        // Update on resize of the block (in editor) or the window (for responsiveness).
        new ResizeObserver(setDimensions).observe(block);
        window.addEventListener('resize', setDimensions);
      }
    }
    
    if (document.readyState === 'complete') {
      initBuildlaWidget();
    } else {
      window.addEventListener('load', initBuildlaWidget);
    }
  })();
</script>`;
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