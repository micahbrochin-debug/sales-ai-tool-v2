'use client';

import { useState } from 'react';
import { 
  Map, 
  Users, 
  Building,
  Crown,
  Heart,
  Eye,
  Zap,
  X,
  HelpCircle,
  Play,
  RefreshCw,
  ExternalLink,
  Download
} from 'lucide-react';
import { Project, AccountMap, OrgMember, RoleAnalysis, StakeholderRole } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { mapAccount } from '@/lib/ai';
import toast from 'react-hot-toast';

interface AccountTabProps {
  project: Project;
}

export function AccountTab({ project }: AccountTabProps) {
  const { updateAccountMap, setLoading, setError } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);

  const handleRunMapping = async () => {
    if (!project.company_name) {
      toast.error('Company name is required');
      return;
    }

    try {
      setIsRunning(true);
      setLoading(true);
      setError(undefined);

      // Use the existing mapAccount function which now supports real employee research
      const accountMap = await mapAccount(
        project.company_name,
        project.company_domain
      );

      updateAccountMap(project.id, accountMap);
      toast.success('Account mapping completed!');
      
    } catch (error) {
      console.error('Account mapping error:', error);
      setError(error instanceof Error ? error.message : 'Failed to map account');
      toast.error('Failed to map account');
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
                Account Mapping & Stakeholder Analysis
              </h1>
              <p className="text-muted text-lg">
                Map organizational structure and identify key decision-makers at {project.company_name}
              </p>
            </div>

            <button
              onClick={handleRunMapping}
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
                <span>Mapping...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Mapping</span>
              </>
            )}
            </button>
          </div>
        </div>

        {/* Account Map Content */}
        {project.account_map ? (
          <AccountMapDisplay accountMap={project.account_map} />
        ) : (
          <div className="card-elevated max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Map size={40} className="text-primary-600" />
            </div>
            <h3 className="heading-md text-gray-900 mb-3">
              Ready for Account Mapping
            </h3>
            <p className="text-muted text-lg mb-6">
              Click "Run Mapping" to analyze {project.company_name}'s organizational structure and stakeholders
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Leadership hierarchy mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Stakeholder role identification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Decision-maker influence analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Contact verification & sourcing</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountMapDisplay({ accountMap }: { accountMap: AccountMap }) {
  const [selectedPerson, setSelectedPerson] = useState<OrgMember | null>(null);
  const [activeView, setActiveView] = useState<'tree' | 'roles'>('tree');

  const handleExportOrgChart = () => {
    const csvContent = [
      'Name,Title,Reports To,Level,Region/Function,Role,Sources',
      ...accountMap.org_tree.map(member => {
        const roleInfo = accountMap.role_analysis.find(r => r.name === member.name);
        return `"${member.name}","${member.title}","${member.reports_to}","${member.level}","${member.region_function}","${roleInfo?.role || 'TBD'}","${member.sources.join('; ')}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${accountMap.company_snapshot.industry}-org-chart.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Company Snapshot */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Building className="text-primary-600" size={24} />
            <h3 className="text-lg font-semibold text-secondary-900">Company Overview</h3>
          </div>
          <button
            onClick={handleExportOrgChart}
            className="btn-secondary text-sm"
            title="Export org chart as CSV"
          >
            <Download size={14} className="mr-1" />
            Export CSV
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Industry</label>
            <p className="text-secondary-900 font-medium">{accountMap.company_snapshot.industry}</p>
          </div>
          <div>
            <label className="form-label">Headquarters</label>
            <p className="text-secondary-700">{accountMap.company_snapshot.hq}</p>
          </div>
          <div>
            <label className="form-label">Company Size</label>
            <p className="text-secondary-700">{accountMap.company_snapshot.size}</p>
          </div>
          <div>
            <label className="form-label">Revenue</label>
            <p className="text-secondary-700">{accountMap.company_snapshot.revenue}</p>
          </div>
        </div>
        
        {accountMap.company_snapshot.structure_summary && (
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <label className="form-label">Structure Summary</label>
            <p className="text-secondary-700">{accountMap.company_snapshot.structure_summary}</p>
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1">
        <button
          onClick={() => setActiveView('tree')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center
            ${activeView === 'tree' 
              ? 'bg-white text-secondary-900 shadow-sm' 
              : 'text-secondary-600 hover:text-secondary-900'
            }
          `}
        >
          <Users size={16} />
          <span>Organization Tree</span>
        </button>
        
        <button
          onClick={() => setActiveView('roles')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center
            ${activeView === 'roles' 
              ? 'bg-white text-secondary-900 shadow-sm' 
              : 'text-secondary-600 hover:text-secondary-900'
            }
          `}
        >
          <Crown size={16} />
          <span>Stakeholder Roles</span>
        </button>
      </div>

      {/* Content based on active view */}
      {activeView === 'tree' && (
        <OrgTreeView 
          orgTree={accountMap.org_tree} 
          roleAnalysis={accountMap.role_analysis}
          onPersonSelect={setSelectedPerson}
        />
      )}
      
      {activeView === 'roles' && (
        <StakeholderRolesView roleAnalysis={accountMap.role_analysis} />
      )}

      {/* Gaps */}
      {accountMap.gaps.length > 0 && (
        <div className="card border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold text-orange-900">Information Gaps</h3>
          </div>
          
          <ul className="space-y-2">
            {accountMap.gaps.map((gap, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-orange-600 mt-1">•</span>
                <span className="text-orange-800 text-sm">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations */}
      {accountMap.citations.length > 0 && (
        <div className="card bg-secondary-50">
          <div className="flex items-center space-x-3 mb-4">
            <ExternalLink className="text-secondary-600" size={20} />
            <h4 className="font-medium text-secondary-900">Sources & Citations</h4>
          </div>
          
          <div className="grid gap-2">
            {accountMap.citations.map((citation, index) => (
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

      {/* Person Detail Modal */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          roleInfo={accountMap.role_analysis.find(r => r.name === selectedPerson.name)}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}

function OrgTreeView({ 
  orgTree, 
  roleAnalysis, 
  onPersonSelect 
}: { 
  orgTree: OrgMember[];
  roleAnalysis: RoleAnalysis[];
  onPersonSelect: (person: OrgMember) => void;
}) {
  // Build hierarchy from flat org tree
  const buildHierarchy = (members: OrgMember[]) => {
    const hierarchy: any = {};
    const roots: OrgMember[] = [];
    
    members.forEach(member => {
      hierarchy[member.name] = { ...member, children: [] };
    });
    
    members.forEach(member => {
      if (member.reports_to && hierarchy[member.reports_to]) {
        hierarchy[member.reports_to].children.push(hierarchy[member.name]);
      } else {
        roots.push(hierarchy[member.name]);
      }
    });
    
    return roots;
  };

  const hierarchyRoots = buildHierarchy(orgTree);

  const getRoleIcon = (role?: StakeholderRole) => {
    switch (role) {
      case 'economic buyer': return Crown;
      case 'champion': return Heart;
      case 'evaluator': return Eye;
      case 'influencer': return Zap;
      case 'blocker': return X;
      default: return HelpCircle;
    }
  };

  const getRoleColor = (role?: StakeholderRole) => {
    switch (role) {
      case 'economic buyer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'champion': return 'bg-green-100 text-green-800 border-green-300';
      case 'evaluator': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'influencer': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'blocker': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-secondary-100 text-secondary-600 border-secondary-300';
    }
  };

  const renderNode = (node: any, level = 0) => {
    const roleInfo = roleAnalysis.find(r => r.name === node.name);
    const RoleIcon = getRoleIcon(roleInfo?.role);
    const roleColor = getRoleColor(roleInfo?.role);

    return (
      <div key={node.name} className={`ml-${level * 8}`}>
        <div
          onClick={() => onPersonSelect(node)}
          className={`
            p-3 bg-white border-2 rounded-lg cursor-pointer transition-all hover:shadow-md mb-2
            ${roleColor}
          `}
        >
          <div className="flex items-center space-x-3">
            <RoleIcon size={16} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{node.name}</h4>
              <p className="text-sm opacity-75 truncate">{node.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                  {node.level}
                </span>
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                  {roleInfo?.role || 'TBD'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="ml-4 border-l-2 border-secondary-200 pl-4">
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="text-primary-600" size={24} />
        <h3 className="text-lg font-semibold text-secondary-900">Organization Structure</h3>
        <span className="text-sm text-secondary-500">
          {orgTree.length} people identified
        </span>
      </div>
      
      {hierarchyRoots.length > 0 ? (
        <div className="space-y-4">
          {hierarchyRoots.map(root => renderNode(root))}
        </div>
      ) : (
        <div className="text-center py-12 text-secondary-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-secondary-700 mb-2">No Real Employees Found</h3>
          <p className="text-sm max-w-md mx-auto mb-4">
            Unable to verify actual employees at this company. Real employee research requires integration with:
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs text-secondary-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>LinkedIn API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>TheOrg.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Crunchbase API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Company Website</span>
            </div>
          </div>
          <p className="text-xs text-secondary-500 mt-4">
            Only verified, real employees will be displayed here
          </p>
        </div>
      )}
    </div>
  );
}

function StakeholderRolesView({ roleAnalysis }: { roleAnalysis: RoleAnalysis[] }) {
  const groupedRoles = roleAnalysis.reduce((acc, person) => {
    if (!acc[person.role]) {
      acc[person.role] = [];
    }
    acc[person.role].push(person);
    return acc;
  }, {} as Record<string, RoleAnalysis[]>);

  const getRoleIcon = (role: StakeholderRole) => {
    switch (role) {
      case 'economic buyer': return Crown;
      case 'champion': return Heart;
      case 'evaluator': return Eye;
      case 'influencer': return Zap;
      case 'blocker': return X;
      default: return HelpCircle;
    }
  };

  const getRoleColor = (role: StakeholderRole) => {
    switch (role) {
      case 'economic buyer': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'champion': return 'bg-green-100 text-green-800 border-green-300';
      case 'evaluator': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'influencer': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'blocker': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-secondary-100 text-secondary-600 border-secondary-300';
    }
  };

  const getRolePriority = (role: StakeholderRole): number => {
    switch (role) {
      case 'economic buyer': return 1;
      case 'champion': return 2;
      case 'evaluator': return 3;
      case 'influencer': return 4;
      case 'blocker': return 5;
      default: return 6;
    }
  };

  const getRoleDescription = (role: StakeholderRole): string => {
    switch (role) {
      case 'economic buyer': return 'Has final budget authority and ROI accountability. Focus on business value and strategic alignment.';
      case 'champion': return 'Internal advocates who will promote your solution. Key to building momentum and overcoming resistance.';
      case 'evaluator': return 'Technical assessors who conduct POCs and vendor comparisons. Critical for product evaluation phase.';
      case 'influencer': return 'Opinion leaders whose recommendations carry weight. Important for technical credibility and adoption.';
      case 'blocker': return 'May resist change or prefer alternatives. Require careful stakeholder management and objection handling.';
      default: return 'Require further validation to determine their role in the decision-making process.';
    }
  };

  const getEngagementStrategy = (role: StakeholderRole): string[] => {
    switch (role) {
      case 'economic buyer':
        return [
          'Lead with business value and ROI metrics',
          'Present executive summary with clear financial impact',
          'Schedule C-level focused demos and briefings',
          'Provide competitive analysis and market validation'
        ];
      case 'champion':
        return [
          'Enable with technical content and proof points',
          'Provide internal presentation materials',
          'Offer exclusive access to product roadmap',
          'Connect with customer references and case studies'
        ];
      case 'evaluator':
        return [
          'Provide detailed technical documentation',
          'Offer hands-on product trials and POCs',
          'Arrange technical deep-dive sessions',
          'Connect with technical support and services teams'
        ];
      case 'influencer':
        return [
          'Share thought leadership and industry insights',
          'Invite to technical advisory panels',
          'Provide early access to new features',
          'Facilitate peer-to-peer networking opportunities'
        ];
      case 'blocker':
        return [
          'Understand objections and resistance points',
          'Address concerns with targeted responses',
          'Find common ground and shared objectives',
          'Involve in solution design to gain buy-in'
        ];
      default:
        return [
          'Schedule discovery calls to understand role',
          'Determine decision-making influence level',
          'Map relationships to other stakeholders'
        ];
    }
  };

  // Sort roles by priority for strategic presentation
  const sortedRoleEntries = Object.entries(groupedRoles).sort(([roleA], [roleB]) => 
    getRolePriority(roleA as StakeholderRole) - getRolePriority(roleB as StakeholderRole)
  );

  return (
    <div className="space-y-8">
      {/* Stakeholder Summary Dashboard */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Sales Stakeholder Intelligence</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sortedRoleEntries.map(([role, people]) => {
            const RoleIcon = getRoleIcon(role as StakeholderRole);
            const roleColor = getRoleColor(role as StakeholderRole);
            
            return (
              <div key={role} className={`p-3 rounded-lg border-2 ${roleColor} text-center`}>
                <RoleIcon size={24} className="mx-auto mb-2" />
                <div className="text-sm font-semibold capitalize">{role.replace('_', ' ')}</div>
                <div className="text-2xl font-bold">{people.length}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-blue-700">
          <strong>Total Verified Stakeholders:</strong> {roleAnalysis.length} • 
          <strong> Economic Buyers:</strong> {groupedRoles['economic buyer']?.length || 0} • 
          <strong> Champions:</strong> {groupedRoles['champion']?.length || 0} • 
          <strong> Technical Evaluators:</strong> {groupedRoles['evaluator']?.length || 0}
        </div>
      </div>

      {/* Detailed Role Analysis */}
      {sortedRoleEntries.map(([role, people]) => {
        const RoleIcon = getRoleIcon(role as StakeholderRole);
        const roleColor = getRoleColor(role as StakeholderRole);
        const roleDescription = getRoleDescription(role as StakeholderRole);
        const engagementStrategy = getEngagementStrategy(role as StakeholderRole);

        return (
          <div key={role} className="card">
            <div className="flex items-center space-x-3 mb-6">
              <RoleIcon className="text-primary-600" size={28} />
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-secondary-900 capitalize">
                  {role.replace('_', ' ')} ({people.length})
                </h4>
                <p className="text-sm text-secondary-600 mt-1">{roleDescription}</p>
              </div>
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${roleColor}`}>
                Priority {getRolePriority(role as StakeholderRole)}
              </span>
            </div>

            {/* Engagement Strategy */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-3">💡 Engagement Strategy</h5>
              <ul className="space-y-2">
                {engagementStrategy.map((strategy, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Stakeholder Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {people.map((person, index) => (
                <div key={index} className={`p-4 border-2 rounded-lg ${roleColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-secondary-900">{person.name}</h5>
                      <p className="text-sm text-secondary-600">{person.title}</p>
                      
                      {/* Email Pattern Suggestion */}
                      <div className="mt-2 text-xs text-secondary-500">
                        📧 Likely: {person.name.toLowerCase().replace(/\s+/g, '.')}@company.com
                      </div>
                    </div>
                    <RoleIcon size={16} className="text-secondary-500 flex-shrink-0 mt-1" />
                  </div>
                  
                  {person.notes && (
                    <div className="mb-3 p-2 bg-white bg-opacity-50 rounded text-xs text-secondary-700">
                      {person.notes}
                    </div>
                  )}

                  {/* Action Items */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-secondary-700 mb-1">🎯 Next Actions:</div>
                    <div className="text-xs text-secondary-600">
                      {role === 'economic buyer' && '• Schedule executive briefing • Present ROI analysis'}
                      {role === 'champion' && '• Provide technical content • Enable internal advocacy'}
                      {role === 'evaluator' && '• Offer product trial • Schedule technical demo'}
                      {role === 'influencer' && '• Share thought leadership • Connect with peers'}
                      {role === 'blocker' && '• Understand objections • Find common ground'}
                      {role === 'Lead to validate' && '• Discovery call • Map influence level'}
                    </div>
                  </div>
                  
                  {/* Verification Sources */}
                  <div className="flex flex-wrap gap-1">
                    {person.sources.slice(0, 3).map((source, sourceIndex) => (
                      <a
                        key={sourceIndex}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded hover:bg-opacity-90 transition-colors"
                        title={source}
                      >
                        Source {sourceIndex + 1}
                      </a>
                    ))}
                    {person.sources.length > 3 && (
                      <span className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded">
                        +{person.sources.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Sales Strategy Summary */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h4 className="text-lg font-semibold text-green-900 mb-4">🎯 Account Strategy Summary</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-800 mb-2">Key Decision Makers</h5>
            <div className="space-y-1 text-sm text-green-700">
              {groupedRoles['economic buyer']?.map((person, index) => (
                <div key={index}>• {person.name} ({person.title})</div>
              ))}
              {!groupedRoles['economic buyer']?.length && (
                <div className="text-orange-600">⚠️ Economic buyer not yet identified</div>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-green-800 mb-2">Champion Network</h5>
            <div className="space-y-1 text-sm text-green-700">
              {groupedRoles['champion']?.map((person, index) => (
                <div key={index}>• {person.name} ({person.title})</div>
              ))}
              {!groupedRoles['champion']?.length && (
                <div className="text-orange-600">⚠️ Champions need to be developed</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white bg-opacity-70 rounded-lg">
          <div className="text-sm text-green-800">
            <strong>Account Score:</strong> {Math.min(100, Math.round((
              (groupedRoles['economic buyer']?.length || 0) * 30 +
              (groupedRoles['champion']?.length || 0) * 25 +
              (groupedRoles['evaluator']?.length || 0) * 20 +
              (groupedRoles['influencer']?.length || 0) * 15 +
              Math.max(0, 10 - (groupedRoles['blocker']?.length || 0) * 5)
            )))}% • 
            <strong> Readiness:</strong> {
              (groupedRoles['economic buyer']?.length || 0) > 0 && (groupedRoles['champion']?.length || 0) > 0 
                ? 'High - Key stakeholders identified' 
                : (groupedRoles['champion']?.length || 0) > 0 
                  ? 'Medium - Champions available, need economic buyer'
                  : 'Low - Stakeholder development required'
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonDetailModal({ 
  person, 
  roleInfo, 
  onClose 
}: { 
  person: OrgMember;
  roleInfo?: RoleAnalysis;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">{person.name}</h3>
              <p className="text-secondary-600">{person.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-secondary-600 rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="form-label">Reports To</label>
              <p className="text-secondary-700">{person.reports_to}</p>
            </div>
            
            <div>
              <label className="form-label">Level</label>
              <p className="text-secondary-700">{person.level}</p>
            </div>
            
            <div>
              <label className="form-label">Region/Function</label>
              <p className="text-secondary-700">{person.region_function}</p>
            </div>

            {roleInfo && (
              <>
                <div>
                  <label className="form-label">Stakeholder Role</label>
                  <p className="text-secondary-700 capitalize">{roleInfo.role.replace('_', ' ')}</p>
                </div>
                
                {roleInfo.notes && (
                  <div>
                    <label className="form-label">Notes</label>
                    <p className="text-secondary-700">{roleInfo.notes}</p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="form-label">Sources</label>
              <div className="space-y-1">
                {person.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary-600 hover:text-primary-800 underline break-all"
                  >
                    {source}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}