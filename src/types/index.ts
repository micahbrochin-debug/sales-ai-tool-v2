// Core data types based on the JSON schemas from the blueprint

export interface Contact {
  email?: string;
  phone?: string;
  linkedin_url?: string;
}

export interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  location: string;
  summary_bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  start_year: string;
  end_year: string;
}

export interface LicenseCertification {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
}

export interface ProspectProfile {
  full_name: string;
  headline?: string;
  location?: string;
  contact?: Contact;
  experience: Experience[];
  education: Education[];
  licenses_certifications: LicenseCertification[];
  notes: string[];
}

export interface SecurityIncident {
  date: string;
  summary: string;
  sources: string[];
}

export interface CompanySnapshot {
  legal_name: string;
  aka: string[];
  industry: string;
  hq: string;
  employee_count: string;
  revenue_estimate: string;
  compliance_frameworks: string[];
  recent_security_incidents: SecurityIncident[];
}

export interface HiringSignal {
  role: string;
  team: string;
  location: string;
  source: string;
}

export interface MEDDPICCBANT {
  metrics: string;
  economic_buyer: string;
  decision_criteria: string;
  decision_process: string;
  paper_process: string;
  pain_identified: string;
  implicated_champion: string;
  competition: string;
  budget: string;
  authority: string;
  need: string;
  timeline: string;
}

export interface CompanyResearch {
  company_snapshot: CompanySnapshot;
  hiring_signals: HiringSignal[];
  meddpicc_bant: MEDDPICCBANT;
  prospect_relevance: string;
  citations: string[];
}

export interface TechStackItem {
  category: string;
  tool: string;
  evidence: string;
  source: string;
}

export interface TechStackRecon {
  dev_stack: TechStackItem[];
  security_stack: TechStackItem[];
  unknowns_gaps: string[];
  citations: string[];
}

export interface OrgMember {
  name: string;
  title: string;
  reports_to: string;
  level: string;
  region_function: string;
  sources: string[];
}

export type StakeholderRole = 
  | "economic buyer"
  | "champion"
  | "evaluator"
  | "influencer"
  | "blocker"
  | "Lead to validate";

export interface RoleAnalysis {
  name: string;
  title: string;
  role: StakeholderRole;
  notes: string;
  sources: string[];
}

export interface AccountMap {
  company_snapshot: {
    industry: string;
    hq: string;
    size: string;
    revenue: string;
    structure_summary: string;
    confidence_score?: number;
    last_updated?: string;
    total_sources?: number;
  };
  org_tree: OrgMember[];
  role_analysis: RoleAnalysis[];
  gaps: string[];
  citations: string[];
}

export interface ValueMapItem {
  problem: string;
  impact: string;
  portswigger_solution: string;
  proof_points: string[];
}

export interface StakeholderStrategy {
  name: string;
  title: string;
  role: string;
  goals: string;
  talk_track: string;
  next_actions: string[];
}

export interface MutualActionPlan {
  milestone: string;
  owner: string;
  due_date: string;
}

export interface SalesPlan {
  executive_summary: string;
  current_state: string;
  opportunity_hypotheses: string[];
  value_map: ValueMapItem[];
  stakeholder_strategy: StakeholderStrategy[];
  meddpicc_summary: string;
  mutual_action_plan: MutualActionPlan[];
  risks: string[];
  citations: string[];
}

export interface Project {
  id: string;
  name: string;
  company_name: string;
  company_domain?: string;
  created_at: string;
  updated_at: string;
  prospect_profile?: ProspectProfile;
  company_research?: CompanyResearch;
  tech_stack_recon?: TechStackRecon;
  account_map?: AccountMap;
  sales_plan?: SalesPlan;
  status: 'draft' | 'research' | 'planning' | 'complete';
}

export interface AppSettings {
  claude_api_key?: string;
  openai_api_key?: string;
  serp_api_key?: string;
  preferred_model: 'claude' | 'gpt4' | 'dual';
  auto_save: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  project_id?: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  citations?: string[];
}

// UI State types
export type TabType = 
  | 'profile'
  | 'research'
  | 'stack'
  | 'account'
  | 'plan'
  | 'chat';

export interface UIState {
  activeTab: TabType;
  selectedProject?: string;
  isLoading: boolean;
  error?: string;
  showSettings: boolean;
  showSidebar: boolean;
}