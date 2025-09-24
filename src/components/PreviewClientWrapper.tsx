'use client';

import { useState } from 'react';
import ChatWidget from '@/components/chat/ChatWidget';
import ModelSettingsPanel from '@/components/ModelSettingsPanel';
import { ModelSettings } from '@/lib/supabase/types';

interface PreviewClientWrapperProps {
  initialSettings?: ModelSettings | null;
}

export default function PreviewClientWrapper({ initialSettings }: PreviewClientWrapperProps) {
  const [modelSettings, setModelSettings] = useState<ModelSettings | null>(initialSettings || null);

  const handleSettingsChange = (settings: ModelSettings) => {
    setModelSettings(settings);
  };

  return (
    <div className="flex gap-6">
      {/* Settings Panel */}
      <div className="flex-shrink-0">
        <ModelSettingsPanel
          onSettingsChange={handleSettingsChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            This is a live preview of how your chat widget will appear to customers. 
            You can test all functionality here before embedding it on your website.
            {modelSettings && (
              <span className="block mt-2 font-medium">
                Current: {modelSettings.model} | Verbosity: {modelSettings.verbosity} | Reasoning: {modelSettings.reasoning_effort} | Tokens: {modelSettings.max_tokens}
              </span>
            )}
          </p>
        </div>
        <ChatWidget modelSettings={modelSettings} />
      </div>
    </div>
  );
}