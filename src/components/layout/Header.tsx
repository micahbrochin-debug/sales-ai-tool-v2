'use client';

import { 
  Settings, 
  Menu, 
  X, 
  FileText, 
  Search, 
  Network, 
  Map, 
  Target, 
  MessageCircle 
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { TabType } from '@/types';

const tabs = [
  { id: 'profile' as TabType, label: 'Profile', icon: FileText },
  { id: 'research' as TabType, label: 'Research', icon: Search },
  { id: 'stack' as TabType, label: 'Stack', icon: Network },
  { id: 'account' as TabType, label: 'Account Map', icon: Map },
  { id: 'plan' as TabType, label: 'Sales Plan', icon: Target },
  { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
];

export function Header() {
  const { 
    activeTab, 
    setActiveTab, 
    showSidebar, 
    toggleSidebar, 
    toggleSettings,
    currentProject 
  } = useAppStore();

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Toggle and Project */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-md"
          >
            {showSidebar ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-secondary-900">
              {currentProject?.name || 'AI Sales Tool'}
            </h1>
            {currentProject && (
              <p className="text-sm text-secondary-500">
                {currentProject.company_name}
              </p>
            )}
          </div>
        </div>

        {/* Center - Tab Navigation */}
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side - Settings */}
        <button
          onClick={toggleSettings}
          className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-md"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}