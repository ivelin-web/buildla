'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw, Loader2 } from 'lucide-react';
import { ModelSettings, UpdateModelSettings } from '@/lib/supabase/types';
import { MODEL_OPTIONS, ModelType, VERBOSITY_OPTIONS, REASONING_EFFORT_OPTIONS, VerbosityLevel, ReasoningEffortLevel } from '@/types/model-settings';
import { getModelSettings, updateModelSettings } from '@/lib/actions/model-settings';
import { showSuccess, showError } from '@/lib/toast';

interface ModelSettingsPanelProps {
  onSettingsChange: (settings: ModelSettings) => void;
}

export default function ModelSettingsPanel({ 
  onSettingsChange
}: ModelSettingsPanelProps) {
  const [settings, setSettings] = useState<ModelSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getModelSettings();
      setSettings(data);
      onSettingsChange(data);
      
      // Store in localStorage for quick access
      localStorage.setItem('model-settings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to load model settings:', error);
      showError('Failed to load settings', 'Using default values');
      
      // Use default settings
      const defaultWithId = {
        id: 'default',
        model: 'gpt-5-nano' as ModelType,
        max_tokens: 3000,
        verbosity: 'low' as VerbosityLevel,
        reasoning_effort: 'low' as ReasoningEffortLevel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(defaultWithId);
      onSettingsChange(defaultWithId);
    } finally {
      setIsLoading(false);
    }
  }, [onSettingsChange]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const debouncedSave = useMemo(
    () =>
      debounce(async (newSettings: UpdateModelSettings) => {
        try {
          setIsSaving(true);
          const updatedSettings = await updateModelSettings(newSettings);
          
          // Update localStorage
          localStorage.setItem('model-settings', JSON.stringify(updatedSettings));
          
          setSettings(updatedSettings);
          onSettingsChange(updatedSettings);
          
          showSuccess('Settings saved');
        } catch (error) {
          console.error('Failed to save settings:', error);
          showError('Failed to save settings');
        } finally {
          setIsSaving(false);
        }
      }, 1000),
    [onSettingsChange]
  );

  useEffect(() => () => {
    debouncedSave.cancel();
  }, [debouncedSave]);

  const handleSettingChange = (key: keyof UpdateModelSettings, value: string | number) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);

    // Update localStorage immediately
    localStorage.setItem('model-settings', JSON.stringify(newSettings));

    // Save to database with debounce
    debouncedSave({ [key]: value });
  };

  const resetToDefaults = async () => {
    try {
      setIsSaving(true);
      const defaultSettings: UpdateModelSettings = {
        model: 'gpt-5-nano' as ModelType,
        max_tokens: 3000,
        verbosity: 'low' as VerbosityLevel,
        reasoning_effort: 'low' as ReasoningEffortLevel
      };
      const updatedSettings = await updateModelSettings(defaultSettings);
      setSettings(updatedSettings);
      onSettingsChange(updatedSettings);
      localStorage.setItem('model-settings', JSON.stringify(updatedSettings));
      showSuccess('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      showError('Failed to reset settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-80">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Model Settings
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Configure AI model parameters for testing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">
              Model
            </Label>
            <Select 
              value={settings.model} 
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger className="w-full cursor-pointer px-3 py-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="px-3 py-2 cursor-pointer">
                    <div className="w-full text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.cost}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Verbosity */}
          <div className="space-y-2">
            <Label htmlFor="verbosity" className="text-sm font-medium">
              Verbosity
            </Label>
            <Select
              value={settings.verbosity}
              onValueChange={(value) => handleSettingChange('verbosity', value)}
            >
              <SelectTrigger className="w-full cursor-pointer px-3 py-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERBOSITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="px-3 py-2 cursor-pointer">
                    <div className="w-full text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Controls response length and detail level
            </p>
          </div>

          {/* Reasoning Effort */}
          <div className="space-y-2">
            <Label htmlFor="reasoning_effort" className="text-sm font-medium">
              Reasoning Effort
            </Label>
            <Select
              value={settings.reasoning_effort}
              onValueChange={(value) => handleSettingChange('reasoning_effort', value)}
            >
              <SelectTrigger className="w-full cursor-pointer px-3 py-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONING_EFFORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="px-3 py-2 cursor-pointer">
                    <div className="w-full text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Controls reasoning depth and response time
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens" className="text-sm font-medium">
              Max Tokens
            </Label>
            <Input
              id="maxTokens"
              type="number"
              min={100}
              max={32768}
              value={settings.max_tokens}
              onChange={(e) => handleSettingChange('max_tokens', parseInt(e.target.value))}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Maximum response length (100-32,768)
            </p>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={isSaving}
            className="w-full cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
      </CardContent>
    </Card>
  );
}

type DebouncedFunction<T extends (...args: Parameters<T>) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => void) & { cancel: () => void };

// Debounce utility function
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
