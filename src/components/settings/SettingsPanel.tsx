'use client';

import { useState } from 'react';
import { X, Key, Brain, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { AppSettings } from '@/types';
import toast from 'react-hot-toast';

export function SettingsPanel() {
  const { settings, updateSettings, toggleSettings } = useAppStore();
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showSerpKey, setShowSerpKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateSettings(formData);
      toast.success('Settings saved successfully!');
      
      // Initialize AI service with new settings
      // initializeAI(formData);
      
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      preferred_model: 'claude',
      auto_save: true,
    };
    
    setFormData(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">Settings</h2>
            <p className="text-secondary-600 text-sm">Configure API keys and preferences</p>
          </div>
          <button
            onClick={toggleSettings}
            className="p-2 text-secondary-400 hover:text-secondary-600 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Keys Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Key className="text-primary-600" size={20} />
              <h3 className="text-lg font-medium text-secondary-900">API Keys</h3>
            </div>
            
            <div className="space-y-4">
              {/* Claude API Key */}
              <div>
                <label className="form-label">Claude API Key</label>
                <div className="relative">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    value={formData.claude_api_key || ''}
                    onChange={(e) => setFormData({ ...formData, claude_api_key: e.target.value })}
                    placeholder="sk-ant-api..."
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Get your API key from{' '}
                  <a 
                    href="https://console.anthropic.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary-600 hover:text-primary-800 underline"
                  >
                    Anthropic Console
                  </a>
                </p>
              </div>

              {/* OpenAI API Key */}
              <div>
                <label className="form-label">OpenAI API Key (optional)</label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={formData.openai_api_key || ''}
                    onChange={(e) => setFormData({ ...formData, openai_api_key: e.target.value })}
                    placeholder="sk-..."
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  For GPT-4 with browsing capabilities
                </p>
              </div>

              {/* SERP API Key */}
              <div>
                <label className="form-label">SERP API Key (optional)</label>
                <div className="relative">
                  <input
                    type={showSerpKey ? 'text' : 'password'}
                    value={formData.serp_api_key || ''}
                    onChange={(e) => setFormData({ ...formData, serp_api_key: e.target.value })}
                    placeholder="Your SERP API key..."
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSerpKey(!showSerpKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showSerpKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  For enhanced web search capabilities
                </p>
              </div>
            </div>
          </div>

          {/* AI Model Preferences */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="text-primary-600" size={20} />
              <h3 className="text-lg font-medium text-secondary-900">AI Model Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Preferred Model</label>
                <select
                  value={formData.preferred_model}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    preferred_model: e.target.value as 'claude' | 'gpt4' | 'dual' 
                  })}
                  className="form-input"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="gpt4">GPT-4 with Web Browsing</option>
                  <option value="dual">Dual Processing (Both Models)</option>
                </select>
                <p className="text-xs text-secondary-500 mt-1">
                  Claude is recommended for most tasks. Dual processing compares results from both models.
                </p>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Application Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label mb-0">Auto-save Progress</label>
                  <p className="text-xs text-secondary-500">
                    Automatically save research progress and data
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auto_save}
                    onChange={(e) => setFormData({ ...formData, auto_save: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Data Management</h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-2">Storage Location</h4>
                <p className="text-sm text-secondary-600 mb-2">
                  All data is stored locally in your browser. No data is sent to external servers except for AI API calls.
                </p>
                <p className="text-xs text-secondary-500">
                  Your API keys are encrypted and stored securely in local storage.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Data Retention</h4>
                <p className="text-sm text-orange-800 mb-3">
                  Clearing your browser data will remove all projects and settings.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="btn-danger text-sm py-2"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-200 bg-secondary-50">
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            <RefreshCw size={16} className="mr-2" />
            Reset to Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={toggleSettings}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                btn-primary flex items-center space-x-2
                ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSaving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}