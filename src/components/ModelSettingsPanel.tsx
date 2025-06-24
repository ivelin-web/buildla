'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw, Loader2 } from 'lucide-react';
import { ModelSettings, UpdateModelSettings } from '@/lib/supabase/types';
import { MODEL_OPTIONS, ModelType } from '@/types/model-settings';
import { getModelSettings, updateModelSettings } from '@/lib/actions/model-settings';
import { showSuccess, showError } from '@/lib/toast';

interface ModelSettingsPanelProps {
  onSettingsChange: (settings: ModelSettings) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ModelSettingsPanel({ 
  onSettingsChange, 
  isCollapsed, 
  onToggleCollapse 
}: ModelSettingsPanelProps) {
  const [settings, setSettings] = useState<ModelSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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
        model: 'gpt-4.1-nano' as ModelType,
        temperature: 0.20,
        max_tokens: 2048,
        top_p: 1.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSettings(defaultWithId);
      onSettingsChange(defaultWithId);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSave = useCallback(
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
    []
  );

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
        model: 'gpt-4.1-nano' as ModelType,
        temperature: 0.20,
        max_tokens: 2048,
        top_p: 1.00
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
    <Card className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={isCollapsed ? 'hidden' : 'block'}>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Model Settings
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Configure AI model parameters for testing
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.cost}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Temperature</Label>
              <span className="text-sm text-gray-500">{settings.temperature}</span>
            </div>
            <Slider
              value={[settings.temperature]}
              onValueChange={([value]) => handleSettingChange('temperature', value)}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Controls randomness. Lower = more focused, Higher = more creative
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
            />
            <p className="text-xs text-gray-500">
              Maximum response length (100-32,768)
            </p>
          </div>

          {/* Top P */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Top P</Label>
              <span className="text-sm text-gray-500">{settings.top_p}</span>
            </div>
            <Slider
              value={[settings.top_p]}
              onValueChange={([value]) => handleSettingChange('top_p', value)}
              max={1}
              min={0}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Alternative to temperature. Controls diversity of responses
            </p>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={isSaving}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

// Debounce utility function
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}