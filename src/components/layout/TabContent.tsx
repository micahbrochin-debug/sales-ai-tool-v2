'use client';

import { useAppStore } from '@/stores/appStore';
import { ProfileTab } from '../tabs/ProfileTab';
import { ResearchTab } from '../tabs/ResearchTab';
import { StackTab } from '../tabs/StackTab';
import { AccountTab } from '../tabs/AccountTab';
import { PlanTab } from '../tabs/PlanTab';
import { ChatTab } from '../tabs/ChatTab';
import { EmptyStateUpload } from '../ui/EmptyStateUpload';

export function TabContent() {
  const { activeTab, currentProject } = useAppStore();

  if (!currentProject) {
    return (
      <div className="flex-1 bg-gray-50">
        <EmptyStateUpload />
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