// Zustand store for global app state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Project, 
  AppSettings, 
  ChatMessage, 
  UIState, 
  TabType,
  ProspectProfile,
  CompanyResearch,
  TechStackRecon,
  AccountMap,
  SalesPlan
} from '@/types';

interface AppStore extends UIState {
  // Projects
  projects: Project[];
  currentProject?: Project;
  
  // Settings
  settings: AppSettings;
  
  // Chat
  chatMessages: ChatMessage[];
  
  // Actions
  setActiveTab: (tab: TabType) => void;
  setSelectedProject: (projectId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | undefined) => void;
  toggleSettings: () => void;
  toggleSidebar: () => void;
  
  // Project actions
  createProject: (name: string, companyName: string, companyDomain?: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  // Data actions
  updateProspectProfile: (projectId: string, profile: ProspectProfile) => void;
  updateCompanyResearch: (projectId: string, research: CompanyResearch) => void;
  updateTechStackRecon: (projectId: string, recon: TechStackRecon) => void;
  updateAccountMap: (projectId: string, accountMap: AccountMap) => void;
  updateSalesPlan: (projectId: string, plan: SalesPlan) => void;
  
  // Chat actions
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Utility actions
  reset: () => void;
}

const defaultSettings: AppSettings = {
  preferred_model: 'claude',
  auto_save: true,
};

const defaultUIState: UIState = {
  activeTab: 'profile',
  isLoading: false,
  showSettings: false,
  showSidebar: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultUIState,
      projects: [],
      settings: defaultSettings,
      chatMessages: [],
      
      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setSelectedProject: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        set({ selectedProject: projectId, currentProject: project });
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      toggleSettings: () => set(state => ({ showSettings: !state.showSettings })),
      
      toggleSidebar: () => set(state => ({ showSidebar: !state.showSidebar })),
      
      // Project Actions
      createProject: (name, companyName, companyDomain) => {
        const newProject: Project = {
          id: Date.now().toString(),
          name,
          company_name: companyName,
          company_domain: companyDomain,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'draft',
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
          selectedProject: newProject.id,
          currentProject: newProject,
        }));
      },
      
      updateProject: (projectId, updates) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, ...updates, updated_at: new Date().toISOString() }
              : p
          ),
          currentProject: state.currentProject?.id === projectId 
            ? { ...state.currentProject, ...updates, updated_at: new Date().toISOString() }
            : state.currentProject,
        }));
      },
      
      deleteProject: (projectId) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== projectId),
          selectedProject: state.selectedProject === projectId ? undefined : state.selectedProject,
          currentProject: state.currentProject?.id === projectId ? undefined : state.currentProject,
        }));
      },
      
      // Data Actions
      updateProspectProfile: (projectId, profile) => {
        get().updateProject(projectId, { prospect_profile: profile });
      },
      
      updateCompanyResearch: (projectId, research) => {
        get().updateProject(projectId, { company_research: research });
      },
      
      updateTechStackRecon: (projectId, recon) => {
        get().updateProject(projectId, { tech_stack_recon: recon });
      },
      
      updateAccountMap: (projectId, accountMap) => {
        get().updateProject(projectId, { account_map: accountMap });
      },
      
      updateSalesPlan: (projectId, plan) => {
        get().updateProject(projectId, { sales_plan: plan });
      },
      
      // Chat Actions
      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage],
        }));
      },
      
      clearChat: () => set({ chatMessages: [] }),
      
      // Settings Actions
      updateSettings: (updates) => {
        set(state => ({
          settings: { ...state.settings, ...updates },
        }));
      },
      
      // Utility Actions
      reset: () => set({
        ...defaultUIState,
        projects: [],
        currentProject: undefined,
        chatMessages: [],
        settings: defaultSettings,
      }),
    }),
    {
      name: 'ai-sales-tool-store',
      partialize: (state) => ({
        projects: state.projects,
        settings: state.settings,
        selectedProject: state.selectedProject,
      }),
    }
  )
);