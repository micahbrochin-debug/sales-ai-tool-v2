'use client';

import { useState } from 'react';
import { 
  Search, 
  Building, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Shield, 
  Target,
  Clock,
  DollarSign,
  Play,
  RefreshCw,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Project, CompanyResearch, SecurityIncident } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { researchCompany } from '@/lib/ai';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ResearchTabProps {
  project: Project;
}

export function ResearchTab({ project }: ResearchTabProps) {
  const { updateCompanyResearch, setLoading, setError } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);

  const handleRunResearch = async () => {
    if (!project.company_name) {
      toast.error('Company name is required');
      return;
    }

    try {
      setIsRunning(true);
      setLoading(true);
      setError(undefined);

      const research = await researchCompany(
        project.company_name,
        project.company_domain,
        project.prospect_profile?.full_name
      );

      updateCompanyResearch(project.id, research);
      toast.success('Company research completed!');
      
    } catch (error) {
      console.error('Research error:', error);
      setError(error instanceof Error ? error.message : 'Failed to research company');
      toast.error('Failed to research company');
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
                Company & Prospect Research
              </h1>
              <p className="text-muted text-lg">
                AI-powered intelligence gathering and market analysis for {project.company_name}
              </p>
            </div>

            <button
              onClick={handleRunResearch}
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
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Research</span>
              </>
            )}
            </button>
          </div>
        </div>

        {/* Research Content */}
        {project.company_research ? (
          <ResearchDisplay research={project.company_research} />
        ) : (
          <div className="card-elevated max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Search size={40} className="text-primary-600" />
            </div>
            <h3 className="heading-md text-gray-900 mb-3">
              Ready for AI Research
            </h3>
            <p className="text-muted text-lg mb-6">
              Click "Run Research" to begin comprehensive analysis of {project.company_name}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Company intelligence & market position</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Security posture & compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Hiring signals & team growth</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>MEDDPICC + BANT qualification</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResearchDisplay({ research }: { research: CompanyResearch }) {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Company Snapshot */}
      <div className="card-elevated">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building className="text-primary-600" size={20} />
            </div>
            <div>
              <h3 className="heading-md text-gray-900">Company Intelligence</h3>
              <p className="text-subtle">Comprehensive business profile</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="form-label">Legal Name</label>
              <p className="text-gray-900 font-semibold">{research.company_snapshot.legal_name}</p>
              {research.company_snapshot.aka.length > 0 && (
                <p className="text-sm text-gray-600">
                  Also known as: {research.company_snapshot.aka.join(', ')}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="form-label">Industry</label>
              <p className="text-gray-700 font-medium">{research.company_snapshot.industry}</p>
            </div>
            
            <div className="space-y-2">
              <label className="form-label">Headquarters</label>
              <p className="text-gray-700 font-medium">{research.company_snapshot.hq}</p>
            </div>
            
            <div className="space-y-2">
              <label className="form-label">Employee Count</label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <p className="text-gray-900 font-semibold">{research.company_snapshot.employee_count}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="form-label">Revenue Estimate</label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <p className="text-gray-900 font-semibold">{research.company_snapshot.revenue_estimate}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="form-label">Compliance Frameworks</label>
              <div className="flex flex-wrap gap-2">
                {research.company_snapshot.compliance_frameworks.map((framework, index) => (
                  <span key={index} className="status-success text-xs">
                    {framework}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Security Incidents */}
          {research.company_snapshot.recent_security_incidents.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-orange-600" size={16} />
                </div>
                <h4 className="font-semibold text-gray-900">Security Incidents</h4>
                <span className="status-warning text-xs">
                  {research.company_snapshot.recent_security_incidents.length} found
                </span>
              </div>
              
              <div className="space-y-3">
                {research.company_snapshot.recent_security_incidents.map((incident, index) => (
                  <SecurityIncidentCard key={index} incident={incident} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiring Signals */}
      {research.hiring_signals.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="text-primary-600" size={24} />
            <h3 className="text-lg font-semibold text-secondary-900">Hiring Signals</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 text-secondary-600">Role</th>
                  <th className="text-left py-2 text-secondary-600">Team</th>
                  <th className="text-left py-2 text-secondary-600">Location</th>
                  <th className="text-left py-2 text-secondary-600">Source</th>
                </tr>
              </thead>
              <tbody>
                {research.hiring_signals.map((signal, index) => (
                  <tr key={index} className="border-b border-secondary-100">
                    <td className="py-2 font-medium text-secondary-900">{signal.role}</td>
                    <td className="py-2 text-secondary-700">{signal.team}</td>
                    <td className="py-2 text-secondary-700">{signal.location}</td>
                    <td className="py-2">
                      <a
                        href={signal.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline text-xs flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEDDPICC + BANT Analysis */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-secondary-900">MEDDPICC + BANT Analysis</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* MEDDPICC */}
          <div>
            <h4 className="font-medium text-secondary-900 mb-3">MEDDPICC</h4>
            <div className="space-y-3">
              <MEDDPICCField label="Metrics" value={research.meddpicc_bant.metrics} />
              <MEDDPICCField label="Economic Buyer" value={research.meddpicc_bant.economic_buyer} />
              <MEDDPICCField label="Decision Criteria" value={research.meddpicc_bant.decision_criteria} />
              <MEDDPICCField label="Decision Process" value={research.meddpicc_bant.decision_process} />
              <MEDDPICCField label="Paper Process" value={research.meddpicc_bant.paper_process} />
              <MEDDPICCField label="Pain Identified" value={research.meddpicc_bant.pain_identified} />
              <MEDDPICCField label="Implicated Champion" value={research.meddpicc_bant.implicated_champion} />
              <MEDDPICCField label="Competition" value={research.meddpicc_bant.competition} />
            </div>
          </div>
          
          {/* BANT */}
          <div>
            <h4 className="font-medium text-secondary-900 mb-3">BANT</h4>
            <div className="space-y-3">
              <MEDDPICCField label="Budget" value={research.meddpicc_bant.budget} />
              <MEDDPICCField label="Authority" value={research.meddpicc_bant.authority} />
              <MEDDPICCField label="Need" value={research.meddpicc_bant.need} />
              <MEDDPICCField label="Timeline" value={research.meddpicc_bant.timeline} />
            </div>
          </div>
        </div>
      </div>

      {/* Prospect Relevance */}
      {research.prospect_relevance && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="text-primary-600" size={24} />
            <h3 className="text-lg font-semibold text-secondary-900">Prospect Relevance</h3>
          </div>
          <p className="text-secondary-700 leading-relaxed">
            {research.prospect_relevance}
          </p>
        </div>
      )}

      {/* Citations */}
      {research.citations.length > 0 && (
        <div className="card bg-secondary-50">
          <div className="flex items-center space-x-3 mb-4">
            <ExternalLink className="text-secondary-600" size={20} />
            <h4 className="font-medium text-secondary-900">Sources & Citations</h4>
          </div>
          
          <div className="grid gap-2">
            {research.citations.map((citation, index) => (
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

function SecurityIncidentCard({ incident }: { incident: SecurityIncident }) {
  return (
    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock size={14} className="text-orange-600 mt-0.5" />
          <span className="text-sm font-medium text-orange-900">{incident.date}</span>
        </div>
      </div>
      
      <p className="text-sm text-orange-800 mb-2">{incident.summary}</p>
      
      <div className="flex flex-wrap gap-2">
        {incident.sources.map((source, index) => (
          <a
            key={index}
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-600 hover:text-orange-800 underline"
          >
            Source {index + 1}
          </a>
        ))}
      </div>
    </div>
  );
}

function MEDDPICCField({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div>
      <label className="text-xs font-medium text-secondary-600 uppercase tracking-wide">
        {label}
      </label>
      <p className="text-sm text-secondary-700 mt-1">{value}</p>
    </div>
  );
}