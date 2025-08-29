'use client';

import { useState } from 'react';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  Filter,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Project } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export function Sidebar() {
  const { 
    projects, 
    currentProject, 
    createProject, 
    setSelectedProject,
    deleteProject 
  } = useAppStore();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDomain, setNewCompanyDomain] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && newCompanyName.trim()) {
      createProject(newProjectName.trim(), newCompanyName.trim(), newCompanyDomain.trim() || undefined);
      setNewProjectName('');
      setNewCompanyName('');
      setNewCompanyDomain('');
      setShowCreateForm(false);
    }
  };

  const openLinkedIn = () => {
    window.open('https://linkedin.com', '_blank');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Projects</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-md"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-2">
          <button
            onClick={openLinkedIn}
            className="w-full btn-primary text-sm py-2"
          >
            Open LinkedIn
          </button>
          
          <button
            onClick={() => document.getElementById('pdf-upload')?.click()}
            className="w-full btn-secondary text-sm py-2"
          >
            Upload PDF
          </button>
          
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              // TODO: Handle PDF upload
              const file = e.target.files?.[0];
              if (file) {
                console.log('PDF uploaded:', file.name);
              }
            }}
          />
        </div>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-secondary-200 bg-secondary-50">
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div>
              <label className="form-label">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="form-input text-sm"
                placeholder="Q1 Enterprise Deal"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                className="form-input text-sm"
                placeholder="Acme Corporation"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Domain (optional)</label>
              <input
                type="text"
                value={newCompanyDomain}
                onChange={(e) => setNewCompanyDomain(e.target.value)}
                className="form-input text-sm"
                placeholder="acme.com"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 btn-primary text-xs py-2"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 btn-secondary text-xs py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-2">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects yet</p>
              <p className="text-xs">Create your first project</p>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={currentProject?.id === project.id}
                onSelect={() => setSelectedProject(project.id)}
                onDelete={() => deleteProject(project.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center space-x-2 text-sm text-secondary-600">
          <Filter size={14} />
          <span>Filters</span>
        </div>
        <div className="mt-2 space-y-1">
          <label className="flex items-center space-x-2 text-xs">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Active Projects</span>
          </label>
          <label className="flex items-center space-x-2 text-xs">
            <input type="checkbox" className="rounded" />
            <span>Completed</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ 
  project, 
  isSelected, 
  onSelect, 
  onDelete 
}: {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div
      className={`
        p-3 rounded-lg border cursor-pointer transition-colors relative
        ${isSelected 
          ? 'bg-primary-50 border-primary-200' 
          : 'bg-white border-secondary-200 hover:bg-secondary-50'
        }
      `}
      onClick={onSelect}
    >
      {/* Project Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm text-secondary-900 truncate">
            {project.name}
          </h3>
          <p className="text-xs text-secondary-600 truncate">
            {project.company_name}
          </p>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-secondary-400 hover:text-secondary-600 rounded"
          >
            <MoreVertical size={12} />
          </button>
        </div>
      </div>

      {/* Project Meta */}
      <div className="flex items-center space-x-4 text-xs text-secondary-500">
        <div className="flex items-center space-x-1">
          <Calendar size={10} />
          <span>{formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-2 top-8 bg-white border border-secondary-200 rounded-md shadow-lg z-10 py-1 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement edit
              setShowMenu(false);
            }}
            className="w-full px-3 py-1 text-left text-xs text-secondary-700 hover:bg-secondary-50 flex items-center space-x-2"
          >
            <Edit size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-3 py-1 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}