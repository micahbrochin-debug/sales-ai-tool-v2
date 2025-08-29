'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';

export default function HomePage() {
  const { currentProject, projects, createProject } = useAppStore();

  // Create a demo project if none exist
  useEffect(() => {
    if (projects.length === 0) {
      createProject('Demo Project', 'Acme Corp', 'acme.com');
    }
  }, [projects.length, createProject]);

  return <MainLayout />;
}