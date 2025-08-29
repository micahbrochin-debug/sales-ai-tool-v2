'use client';

import { Toaster } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TabContent } from './TabContent';
import { ChatPanel } from '../chat/ChatPanel';
import { SettingsPanel } from '../settings/SettingsPanel';
import { CitationsDrawer } from './CitationsDrawer';
import { useAppStore } from '@/stores/appStore';
import { LoadingOverlay } from '../ui/LoadingOverlay';

export function MainLayout() {
  const { 
    showSidebar, 
    showSettings, 
    isLoading, 
    error 
  } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
      
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 shadow-sm">
          <div className="animate-slide-in">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <Header />
        </div>
        
        {/* Content Area with improved layout */}
        <div className="flex-1 flex min-h-0">
          {/* Main Tab Content */}
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex-1 animate-fade-in">
              <TabContent />
            </div>
            
            {/* Professional Chat Panel */}
            <div className="h-80 bg-white border-t border-gray-200 shadow-lg">
              <ChatPanel />
            </div>
          </div>
          
          {/* Enhanced Citations Drawer */}
          <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 shadow-sm">
            <CitationsDrawer />
          </div>
        </div>
      </div>
      
      {/* Professional Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in">
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl animate-slide-in">
            <SettingsPanel />
          </div>
        </div>
      )}
      
      {/* Professional Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
          },
          success: {
            style: {
              borderLeft: '4px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              borderLeft: '4px solid #3b82f6',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      {/* Professional Error Display */}
      {error && (
        <div className="fixed bottom-6 right-6 max-w-md animate-slide-in">
          <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900">Something went wrong</h3>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}