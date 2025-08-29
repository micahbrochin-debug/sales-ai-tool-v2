'use client';

import { useState } from 'react';
import { 
  Network, 
  Shield, 
  Code, 
  Server, 
  GitBranch,
  Database,
  Cloud,
  Lock,
  AlertTriangle,
  Play,
  RefreshCw,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { Project, TechStackRecon, TechStackItem } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { analyzeTechStack } from '@/lib/ai';
import toast from 'react-hot-toast';

interface StackTabProps {
  project: Project;
}

export function StackTab({ project }: StackTabProps) {
  const { updateTechStackRecon, setLoading, setError } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAnalysis = async () => {
    if (!project.company_name) {
      toast.error('Company name is required');
      return;
    }

    try {
      setIsRunning(true);
      setLoading(true);
      setError(undefined);

      const recon = await analyzeTechStack(
        project.company_name,
        project.company_domain
      );

      updateTechStackRecon(project.id, recon);
      toast.success('Tech stack analysis completed!');
      
    } catch (error) {
      console.error('Stack analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze tech stack');
      toast.error('Failed to analyze tech stack');
    } finally {
      setIsRunning(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Professional Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900 mb-2">
                Tech Stack Reconnaissance
              </h1>
              <p className="text-muted text-lg">
                Discover the development and security technologies powering {project.company_name}
              </p>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isRunning}
              className={`
                btn ${isRunning 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'btn-primary'
                }
              `}
            >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Analysis</span>
              </>
            )}
            </button>
          </div>
        </div>

        {/* Stack Content */}
        {project.tech_stack_recon ? (
          <StackDisplay recon={project.tech_stack_recon} />
        ) : (
          <div className="card-elevated max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Network size={40} className="text-primary-600" />
            </div>
            <h3 className="heading-md text-gray-900 mb-3">
              Ready for Technology Discovery
            </h3>
            <p className="text-muted text-lg mb-6">
              Click "Run Analysis" to discover {project.company_name}'s complete technology stack
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Development tools & frameworks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Security testing & monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>CI/CD & deployment platforms</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Cloud infrastructure & services</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StackDisplay({ recon }: { recon: TechStackRecon }) {
  const [activeTab, setActiveTab] = useState<'dev' | 'security'>('dev');

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'CI/CD': GitBranch,
      'Cloud': Cloud,
      'Database': Database,
      'SCM': Code,
      'Security': Lock,
      'SAST': Shield,
      'DAST': Shield,
      'Infrastructure': Server,
    };
    
    return iconMap[category] || Network;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'CI/CD': 'status-info',
      'Cloud': 'bg-purple-100 text-purple-800',
      'Database': 'status-success',
      'SCM': 'bg-orange-100 text-orange-800',
      'Security': 'status-error',
      'SAST': 'status-error',
      'DAST': 'status-error',
      'Infrastructure': 'bg-gray-100 text-gray-800',
    };
    
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Professional Tab Navigation */}
      <div className="card-elevated">
        <div className="flex bg-gray-100 rounded-lg p-1 m-4">
          <button
            onClick={() => setActiveTab('dev')}
            className={`
              flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 flex-1
              ${activeTab === 'dev' 
                ? 'bg-white text-gray-900 shadow-sm transform scale-105' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
            `}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activeTab === 'dev' ? 'bg-primary-100' : 'bg-gray-200'
            }`}>
              <Code size={16} className={activeTab === 'dev' ? 'text-primary-600' : 'text-gray-500'} />
            </div>
            <span>Development ({recon.dev_stack.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`
              flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 flex-1
              ${activeTab === 'security' 
                ? 'bg-white text-gray-900 shadow-sm transform scale-105' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
            `}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activeTab === 'security' ? 'bg-red-100' : 'bg-gray-200'
            }`}>
              <Shield size={16} className={activeTab === 'security' ? 'text-red-600' : 'text-gray-500'} />
            </div>
            <span>Security ({recon.security_stack.length})</span>
          </button>
        </div>
      </div>

      {/* Stack Items */}
      <div className="grid gap-4">
        {activeTab === 'dev' && (
          <>
            {recon.dev_stack.length > 0 ? (
              <StackGrid items={recon.dev_stack} getCategoryIcon={getCategoryIcon} getCategoryColor={getCategoryColor} />
            ) : (
              <EmptyState type="development" />
            )}
          </>
        )}
        
        {activeTab === 'security' && (
          <>
            {recon.security_stack.length > 0 ? (
              <StackGrid items={recon.security_stack} getCategoryIcon={getCategoryIcon} getCategoryColor={getCategoryColor} />
            ) : (
              <EmptyState type="security" />
            )}
          </>
        )}
      </div>

      {/* Professional Unknowns & Gaps */}
      {recon.unknowns_gaps.length > 0 && (
        <div className="card-elevated border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="heading-md text-orange-900">Analysis Gaps</h3>
                <p className="text-sm text-orange-700">{recon.unknowns_gaps.length} area{recon.unknowns_gaps.length !== 1 ? 's' : ''} requiring further investigation</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {recon.unknowns_gaps.map((gap, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/80 rounded-lg border border-orange-200">
                  <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-900 text-sm font-medium">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Citations */}
      {recon.citations.length > 0 && (
        <div className="card bg-secondary-50">
          <div className="flex items-center space-x-3 mb-4">
            <ExternalLink className="text-secondary-600" size={20} />
            <h4 className="font-medium text-secondary-900">Sources & Citations</h4>
          </div>
          
          <div className="grid gap-2">
            {recon.citations.map((citation, index) => (
              <a
                key={index}
                href={citation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-800 underline break-all"
              >
                {citation}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StackGrid({ 
  items, 
  getCategoryIcon, 
  getCategoryColor 
}: { 
  items: TechStackItem[];
  getCategoryIcon: (category: string) => any;
  getCategoryColor: (category: string) => string;
}) {
  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TechStackItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([category, categoryItems]) => {
        const Icon = getCategoryIcon(category);
        
        return (
          <div key={category} className="card-elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h4 className="heading-md text-gray-900">{category}</h4>
                    <p className="text-subtle">{categoryItems.length} tool{categoryItems.length !== 1 ? 's' : ''} discovered</p>
                  </div>
                </div>
                <span className={`status-badge ${getCategoryColor(category)}`}>
                  {categoryItems.length}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {categoryItems.map((item, index) => (
                  <StackItemCard key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StackItemCard({ item }: { item: TechStackItem }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-primary-300">
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-bold text-gray-900 text-lg">{item.tool}</h5>
        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
      </div>
      
      {item.evidence && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {item.evidence}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs font-medium text-green-700">
            Verified
          </span>
        </div>
        
        {item.source && (
          <a
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>Source</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: 'development' | 'security' }) {
  return (
    <div className="card-elevated text-center py-12">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {type === 'development' ? (
          <Code size={32} className="text-gray-400" />
        ) : (
          <Shield size={32} className="text-gray-400" />
        )}
      </div>
      <h3 className="heading-md text-gray-900 mb-2">
        No {type === 'development' ? 'Development' : 'Security'} Tools Found
      </h3>
      <p className="text-muted mb-4">
        Our analysis couldn't identify any {type} tools in the public domain
      </p>
      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
        <HelpCircle size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600">
          This may indicate private tooling or limited public visibility
        </span>
      </div>
    </div>
  );
}