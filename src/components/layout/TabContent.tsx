'use client';

import { useAppStore } from '@/stores/appStore';
import { ProfileTab } from '../tabs/ProfileTab';
import { ResearchTab } from '../tabs/ResearchTab';
import { StackTab } from '../tabs/StackTab';
import { AccountTab } from '../tabs/AccountTab';
import { PlanTab } from '../tabs/PlanTab';
import { ChatTab } from '../tabs/ChatTab';

export function TabContent() {
  const { activeTab, currentProject } = useAppStore();

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No Project Selected
          </h3>
          <p className="text-secondary-600">
            Select a project from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab project={currentProject} />;
      case 'research':
        return <ResearchTab project={currentProject} />;
      case 'stack':
        return <StackTab project={currentProject} />;
      case 'account':
        return <AccountTab project={currentProject} />;
      case 'plan':
        return <PlanTab project={currentProject} />;
      case 'chat':
        return <ChatTab project={currentProject} />;
      default:
        return <ProfileTab project={currentProject} />;
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto custom-scrollbar">
      <div className="tab-content tab-active">
        {renderTabContent()}
      </div>
    </div>
  );
}