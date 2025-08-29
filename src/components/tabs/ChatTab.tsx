'use client';

import { Project } from '@/types';
import { ChatPanel } from '../chat/ChatPanel';

interface ChatTabProps {
  project: Project;
}

export function ChatTab({ project }: ChatTabProps) {
  return (
    <div className="h-full">
      <ChatPanel />
    </div>
  );
}