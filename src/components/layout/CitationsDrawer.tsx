'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, Calendar, Search, Filter, Download } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface Citation {
  url: string;
  title: string;
  date?: string;
  type: 'research' | 'stack' | 'account' | 'plan';
  excerpt?: string;
}

export function CitationsDrawer() {
  const { currentProject } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Extract citations from all project data
  const allCitations = useMemo(() => {
    if (!currentProject) return [];

    const citations: Citation[] = [];

    // From research data
    if (currentProject.company_research?.citations) {
      currentProject.company_research.citations.forEach(url => {
        citations.push({
          url,
          title: extractTitleFromUrl(url),
          type: 'research',
          date: new Date().toISOString().split('T')[0],
        });
      });
    }

    // From tech stack data
    if (currentProject.tech_stack_recon?.citations) {
      currentProject.tech_stack_recon.citations.forEach(url => {
        citations.push({
          url,
          title: extractTitleFromUrl(url),
          type: 'stack',
          date: new Date().toISOString().split('T')[0],
        });
      });
    }

    // From account map data
    if (currentProject.account_map?.citations) {
      currentProject.account_map.citations.forEach(url => {
        citations.push({
          url,
          title: extractTitleFromUrl(url),
          type: 'account',
          date: new Date().toISOString().split('T')[0],
        });
      });
    }

    // From sales plan data
    if (currentProject.sales_plan?.citations) {
      currentProject.sales_plan.citations.forEach(url => {
        citations.push({
          url,
          title: extractTitleFromUrl(url),
          type: 'plan',
          date: new Date().toISOString().split('T')[0],
        });
      });
    }

    return citations;
  }, [currentProject]);

  // Filter citations based on search and type
  const filteredCitations = useMemo(() => {
    return allCitations.filter(citation => {
      const matchesSearch = searchTerm === '' || 
        citation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citation.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || citation.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [allCitations, searchTerm, filterType]);

  const handleExportCitations = () => {
    const csvContent = [
      'Title,URL,Type,Date',
      ...filteredCitations.map(citation => 
        `"${citation.title}","${citation.url}","${citation.type}","${citation.date || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name || 'citations'}-citations.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTypeColor = (type: Citation['type']) => {
    switch (type) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'stack': return 'bg-green-100 text-green-800';
      case 'account': return 'bg-purple-100 text-purple-800';
      case 'plan': return 'bg-orange-100 text-orange-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Sources & Citations
          </h3>
          <button
            onClick={handleExportCitations}
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-md"
            title="Export Citations"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sources..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-200 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={14} className="text-secondary-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border-secondary-200 rounded-md focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Sources</option>
            <option value="research">Research</option>
            <option value="stack">Tech Stack</option>
            <option value="account">Account</option>
            <option value="plan">Sales Plan</option>
          </select>
        </div>
      </div>

      {/* Citations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredCitations.length === 0 ? (
          <div className="p-4 text-center text-secondary-500">
            <ExternalLink size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No citations found</p>
            {currentProject && (
              <p className="text-xs mt-1">
                Citations will appear as you generate research data
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredCitations.map((citation, index) => (
              <CitationCard key={index} citation={citation} />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {allCitations.length > 0 && (
        <div className="p-4 border-t border-secondary-200 bg-secondary-50">
          <div className="text-xs text-secondary-600">
            <p>{filteredCitations.length} of {allCitations.length} sources</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CitationCard({ citation }: { citation: Citation }) {
  const getTypeColor = (type: Citation['type']) => {
    switch (type) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'stack': return 'bg-green-100 text-green-800';
      case 'account': return 'bg-purple-100 text-purple-800';
      case 'plan': return 'bg-orange-100 text-orange-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="p-3 bg-white border border-secondary-200 rounded-md hover:border-secondary-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-secondary-900 line-clamp-2">
          {citation.title}
        </h4>
        <span className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${getTypeColor(citation.type)}`}>
          {citation.type}
        </span>
      </div>
      
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary-600 hover:text-primary-800 underline break-all flex items-center space-x-1"
      >
        <span className="truncate">{citation.url}</span>
        <ExternalLink size={10} className="flex-shrink-0" />
      </a>
      
      {citation.date && (
        <div className="flex items-center space-x-1 mt-2 text-xs text-secondary-500">
          <Calendar size={10} />
          <span>{citation.date}</span>
        </div>
      )}

      {citation.excerpt && (
        <p className="text-xs text-secondary-600 mt-2 line-clamp-2">
          {citation.excerpt}
        </p>
      )}
    </div>
  );
}

// Utility function to extract title from URL
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;
    
    if (path === '/' || path === '') {
      return domain;
    }
    
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Clean up the last segment
    const title = lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '') // Remove file extension
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    
    return title || domain;
  } catch {
    return url.length > 50 ? url.substring(0, 47) + '...' : url;
  }
}