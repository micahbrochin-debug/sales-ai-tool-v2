'use client';

import { useState } from 'react';
import { 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  CheckSquare,
  AlertTriangle,
  Play,
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  DollarSign,
  Download
} from 'lucide-react';
import { Project, SalesPlan, ValueMapItem, StakeholderStrategy, MutualActionPlan } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { generateSalesPlan } from '@/lib/ai';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface PlanTabProps {
  project: Project;
}

export function PlanTab({ project }: PlanTabProps) {
  const { updateSalesPlan, setLoading, setError } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);

  const canGeneratePlan = project.prospect_profile && 
                         project.company_research && 
                         project.tech_stack_recon && 
                         project.account_map;

  const handleGeneratePlan = async () => {
    if (!canGeneratePlan) {
      toast.error('Complete all previous research steps first');
      return;
    }

    try {
      setIsRunning(true);
      setLoading(true);
      setError(undefined);

      const plan = await generateSalesPlan(
        project.prospect_profile!,
        project.company_research!,
        project.tech_stack_recon!,
        project.account_map!
      );

      updateSalesPlan(project.id, plan);
      toast.success('Sales plan generated successfully!');
      
    } catch (error) {
      console.error('Plan generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate sales plan');
      toast.error('Failed to generate sales plan');
    } finally {
      setIsRunning(false);
      setLoading(false);
    }
  };

  const handleExportPlan = () => {
    if (!project.sales_plan) return;

    const plan = project.sales_plan;
    const content = `
# Sales Plan: ${project.company_name}

## Executive Summary
${plan.executive_summary}

## Current State
${plan.current_state}

## Opportunity Hypotheses
${plan.opportunity_hypotheses.map(hyp => `• ${hyp}`).join('\n')}

## Value Mapping
${plan.value_map.map(vm => `
### ${vm.problem}
**Impact:** ${vm.impact}
**Solution:** ${vm.portswigger_solution}
**Proof Points:**
${vm.proof_points.map(pp => `• ${pp}`).join('\n')}
`).join('\n')}

## Stakeholder Strategy
${plan.stakeholder_strategy.map(ss => `
### ${ss.name} - ${ss.title}
**Role:** ${ss.role}
**Goals:** ${ss.goals}
**Talk Track:** ${ss.talk_track}
**Next Actions:**
${ss.next_actions.map(action => `• ${action}`).join('\n')}
`).join('\n')}

## MEDDPICC Summary
${plan.meddpicc_summary}

## Mutual Action Plan
${plan.mutual_action_plan.map(map => `• ${map.milestone} (${map.owner} - ${map.due_date})`).join('\n')}

## Risks
${plan.risks.map(risk => `• ${risk}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.company_name}-sales-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Professional Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900 mb-2">
                Enterprise Sales Strategy
              </h1>
              <p className="text-muted text-lg">
                AI-generated sales strategy and execution plan for {project.company_name}
              </p>
            </div>

            <div className="flex space-x-3">
              {project.sales_plan && (
                <button
                  onClick={handleExportPlan}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Export Plan</span>
                </button>
              )}
              
              <button
                onClick={handleGeneratePlan}
                disabled={isRunning || !canGeneratePlan}
                className={`
                  btn ${isRunning || !canGeneratePlan
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'btn-primary'
                  }
                `}
              >
              {isRunning ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Generate Plan</span>
                </>
              )}
              </button>
            </div>
          </div>
        </div>

        {/* Professional Prerequisites Check */}
        {!canGeneratePlan && (
          <div className="card-elevated border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 mb-8 animate-fade-in">
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-yellow-600" size={20} />
                </div>
                <div>
                  <h3 className="heading-md text-yellow-900 mb-2">Complete Prerequisites First</h3>
                  <p className="text-yellow-800 mb-4">
                    Generate your comprehensive sales plan after completing all research phases:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`flex items-center space-x-3 p-3 rounded-lg bg-white/80 ${project.prospect_profile ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
                      <CheckSquare size={16} className={project.prospect_profile ? 'text-green-600' : 'text-yellow-600'} />
                      <span className={`font-medium ${project.prospect_profile ? 'text-green-700' : 'text-yellow-700'}`}>Prospect Profile</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg bg-white/80 ${project.company_research ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
                      <CheckSquare size={16} className={project.company_research ? 'text-green-600' : 'text-yellow-600'} />
                      <span className={`font-medium ${project.company_research ? 'text-green-700' : 'text-yellow-700'}`}>Company Research</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg bg-white/80 ${project.tech_stack_recon ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
                      <CheckSquare size={16} className={project.tech_stack_recon ? 'text-green-600' : 'text-yellow-600'} />
                      <span className={`font-medium ${project.tech_stack_recon ? 'text-green-700' : 'text-yellow-700'}`}>Tech Stack Analysis</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg bg-white/80 ${project.account_map ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
                      <CheckSquare size={16} className={project.account_map ? 'text-green-600' : 'text-yellow-600'} />
                      <span className={`font-medium ${project.account_map ? 'text-green-700' : 'text-yellow-700'}`}>Account Mapping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Plan Content */}
        {project.sales_plan ? (
          <SalesPlanDisplay plan={project.sales_plan} />
        ) : (
          <div className="card-elevated max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <Target size={40} className="text-primary-600" />
            </div>
            <h3 className="heading-md text-gray-900 mb-3">
              Ready to Generate Sales Strategy
            </h3>
            <p className="text-muted text-lg mb-6">
              Complete all research phases and click "Generate Plan" to create your comprehensive enterprise sales strategy
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Executive summary & opportunity analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Value proposition mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Stakeholder engagement strategy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>MEDDPICC assessment & action plan</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SalesPlanDisplay({ plan }: { plan: SalesPlan }) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-secondary-900">Executive Summary</h3>
        </div>
        <p className="text-secondary-700 leading-relaxed">{plan.executive_summary}</p>
      </div>

      {/* Current State */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-secondary-900">Current State</h3>
        </div>
        <p className="text-secondary-700 leading-relaxed">{plan.current_state}</p>
      </div>

      {/* Opportunity Hypotheses */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-secondary-900">Opportunity Hypotheses</h3>
        </div>
        <ul className="space-y-2">
          {plan.opportunity_hypotheses.map((hypothesis, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="text-primary-600 mt-1.5 w-2 h-2 rounded-full bg-current flex-shrink-0"></span>
              <span className="text-secondary-700">{hypothesis}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Value Map */}
      <ValueMapSection valueMap={plan.value_map} />

      {/* Stakeholder Strategy */}
      <StakeholderStrategySection strategy={plan.stakeholder_strategy} />

      {/* MEDDPICC Summary */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <CheckSquare className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-secondary-900">MEDDPICC Summary</h3>
        </div>
        <p className="text-secondary-700 leading-relaxed">{plan.meddpicc_summary}</p>
      </div>

      {/* Mutual Action Plan */}
      <MutualActionPlanSection actionPlan={plan.mutual_action_plan} />

      {/* Risks */}
      {plan.risks.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-red-900">Risks & Mitigation</h3>
          </div>
          <ul className="space-y-2">
            {plan.risks.map((risk, index) => (
              <li key={index} className="flex items-start space-x-3">
                <AlertTriangle size={14} className="text-red-600 mt-1 flex-shrink-0" />
                <span className="text-red-800">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations */}
      {plan.citations.length > 0 && (
        <div className="card bg-secondary-50">
          <div className="flex items-center space-x-3 mb-4">
            <ExternalLink className="text-secondary-600" size={20} />
            <h4 className="font-medium text-secondary-900">Sources & Citations</h4>
          </div>
          
          <div className="grid gap-2">
            {plan.citations.map((citation, index) => (
              <span key={index} className="text-sm text-secondary-600">
                {citation}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ValueMapSection({ valueMap }: { valueMap: ValueMapItem[] }) {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <DollarSign className="text-primary-600" size={24} />
        <h3 className="text-lg font-semibold text-secondary-900">Value Proposition Map</h3>
      </div>
      
      <div className="space-y-4">
        {valueMap.map((item, index) => (
          <div key={index} className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-red-900 mb-2">Problem</h4>
                <p className="text-sm text-red-800">{item.problem}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-900 mb-2">Business Impact</h4>
                <p className="text-sm text-orange-800">{item.impact}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-green-900 mb-2">PortSwigger Solution</h4>
                <p className="text-sm text-green-800">{item.portswigger_solution}</p>
              </div>
            </div>
            
            {item.proof_points.length > 0 && (
              <div className="mt-4 pt-3 border-t border-secondary-300">
                <h4 className="font-medium text-blue-900 mb-2">Proof Points</h4>
                <ul className="space-y-1">
                  {item.proof_points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-sm text-blue-800">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StakeholderStrategySection({ strategy }: { strategy: StakeholderStrategy[] }) {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <Users className="text-primary-600" size={24} />
        <h3 className="text-lg font-semibold text-secondary-900">Stakeholder Engagement Strategy</h3>
      </div>
      
      <div className="space-y-4">
        {strategy.map((stakeholder, index) => (
          <div key={index} className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-secondary-900">{stakeholder.name}</h4>
                <p className="text-sm text-secondary-600">{stakeholder.title}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                  {stakeholder.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium text-secondary-900 mb-1">Goals</h5>
                <p className="text-sm text-secondary-700">{stakeholder.goals}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-secondary-900 mb-1">Talk Track</h5>
                <p className="text-sm text-secondary-700">{stakeholder.talk_track}</p>
              </div>
              
              {stakeholder.next_actions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-secondary-900 mb-1">Next Actions</h5>
                  <ul className="space-y-1">
                    {stakeholder.next_actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start space-x-2">
                        <CheckSquare size={12} className="text-primary-600 mt-0.5" />
                        <span className="text-sm text-secondary-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MutualActionPlanSection({ actionPlan }: { actionPlan: MutualActionPlan[] }) {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <Calendar className="text-primary-600" size={24} />
        <h3 className="text-lg font-semibold text-secondary-900">Mutual Action Plan</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="text-left py-2 text-secondary-600 font-medium">Milestone</th>
              <th className="text-left py-2 text-secondary-600 font-medium">Owner</th>
              <th className="text-left py-2 text-secondary-600 font-medium">Due Date</th>
              <th className="text-left py-2 text-secondary-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {actionPlan.map((item, index) => {
              const dueDate = new Date(item.due_date);
              const isOverdue = dueDate < new Date();
              const isUpcoming = dueDate > new Date() && dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <tr key={index} className="border-b border-secondary-100">
                  <td className="py-3">
                    <div className="font-medium text-secondary-900">{item.milestone}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-secondary-400" />
                      <span className="text-secondary-700">{item.owner}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-secondary-400" />
                      <span className={`text-sm ${isOverdue ? 'text-red-600' : isUpcoming ? 'text-orange-600' : 'text-secondary-700'}`}>
                        {item.due_date}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isOverdue 
                        ? 'bg-red-100 text-red-800' 
                        : isUpcoming 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {isOverdue ? 'Overdue' : isUpcoming ? 'Upcoming' : 'On Track'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}