'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { extractTextFromPDF, extractTextFromImage, isValidFileType, formatFileSize, validateExtractedText, ExtractionProgress } from '@/lib/pdfExtractor';
import { extractProspectProfile } from '@/lib/ai';
import toast from 'react-hot-toast';

export function EmptyStateUpload() {
  const { createProject, setSelectedProject, updateProspectProfile, setLoading, setError, setActiveTab, projects } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ExtractionProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    console.log('EmptyState - File upload started:', { name: file.name, type: file.type, size: file.size });
    
    if (!isValidFileType(file)) {
      console.error('Invalid file type:', file.type);
      toast.error('Please upload a PDF or image file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      console.error('File too large:', file.size);
      toast.error('File size must be less than 50MB');
      return;
    }

    try {
      console.log('Starting file processing...');
      setLoading(true);
      setError(undefined);
      setIsProcessing(true);
      
      let text: string;
      
      if (file.type === 'application/pdf') {
        console.log('Processing PDF with PDF.js...');
        text = await extractTextFromPDF(file, setUploadProgress);
      } else {
        console.log('Processing image with OCR...');
        text = await extractTextFromImage(file, setUploadProgress);
      }

      console.log('Text extracted, length:', text.length);
      
      // Validate extracted text quality
      const validation = validateExtractedText(text);
      if (!validation.isValid) {
        console.warn('Text validation issues:', validation.issues);
        if (validation.issues.includes('No text content found')) {
          throw new Error('No text could be extracted from the file');
        }
        // Show warnings but continue processing
        validation.issues.forEach(issue => {
          toast.error(`Warning: ${issue}`, { duration: 3000 });
        });
      }
      
      // Extract the prospect profile from the text
      setUploadProgress({ status: 'Extracting profile data...', progress: 95 });
      console.log('Calling AI service to extract profile...');
      
      const profile = await extractProspectProfile(text);
      console.log('Profile extracted:', profile);
      
      // Extract company and person information
      let companyName = '';
      let companyDomain = '';
      let personName = profile.full_name || 'Professional Contact';
      
      // Extract company name from current experience
      if (profile.experience && profile.experience.length > 0) {
        companyName = profile.experience[0].company || 'Unknown Company';
      }
      
      // If no company name found in experience, try to extract from notes or other fields
      if (!companyName || companyName === 'Unknown Company') {
        // Look for company mentions in notes, headline, or other fields
        const textToSearch = [profile.headline, ...profile.notes].join(' ').toLowerCase();
        
        // Try to extract company name from headline (e.g., "Senior Engineer at TechCorp")
        const atMatch = textToSearch.match(/\bat\s+([a-z][a-z\s&.-]+(?:inc|llc|corp|ltd|co|company)?)/i);
        if (atMatch) {
          companyName = atMatch[1].trim();
        }
      }
      
      // Ensure we have a company name
      if (!companyName || companyName === 'Unknown Company') {
        companyName = 'New Company'; // Fallback
      }
      
      // Generate company domain from company name
      companyDomain = companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '') // Remove spaces
        .replace(/(inc|llc|corp|ltd|co|company)$/g, '') // Remove common suffixes
        + '.com';
      
      // Try to extract actual domain from text (look for email domains or website mentions)
      const fullText = [profile.headline, ...profile.notes, ...profile.experience.map(e => e.company)].join(' ');
      const domainMatch = fullText.match(/(?:@|https?:\/\/(?:www\.)?)([\w-]+\.(?:com|org|net|io|co|ai))/i);
      if (domainMatch) {
        companyDomain = domainMatch[1].toLowerCase();
      }
      
      // Create new project automatically
      setUploadProgress({ status: 'Creating project...', progress: 97 });
      console.log('Auto-creating new project for:', companyName, 'with contact:', personName, 'domain:', companyDomain);
      
      const projectName = `${companyName} - ${personName}`;
      createProject(projectName, companyName, companyDomain);
      
      // Wait for project creation and get the new project
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the most recently created project (should be the one we just created)
      const newProject = projects[projects.length - 1] || projects[0];
      if (newProject) {
        console.log('Using project:', newProject.id, newProject.name);
        updateProspectProfile(newProject.id, profile);
        setSelectedProject(newProject.id);
        setActiveTab('profile');
      }
      
      setUploadProgress({ status: 'Complete!', progress: 100 });
      toast.success(`Project created: ${projectName}`);
      toast.success('Profile extracted successfully!');
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      setUploadProgress(null);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCreateProject = () => {
    // This could open a modal or form to create a project manually
    const projectName = prompt('Enter project name:');
    const companyName = prompt('Enter company name:');
    
    if (projectName && companyName) {
      createProject(projectName, companyName);
      toast.success(`Project created: ${projectName}`);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-6">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="heading-lg text-gray-900 mb-4">
            Welcome to AI Sales Tool
          </h1>
          <p className="text-muted text-xl max-w-2xl mx-auto">
            Start by uploading a LinkedIn PDF to automatically create a project and extract prospect intelligence,
            or create a new project manually to begin your sales research.
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`
              card-elevated max-w-2xl mx-auto p-12 border-2 border-dashed transition-all duration-300
              ${isDragging 
                ? 'border-primary-500 bg-primary-50 transform scale-105' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30'
              }
              ${isProcessing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {uploadProgress ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
                  </div>
                </div>
                <div>
                  <h3 className="heading-md text-gray-900 mb-2">{uploadProgress.status}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{uploadProgress.progress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <Upload size={32} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="heading-md text-gray-900 mb-2">Upload LinkedIn Profile</h3>
                  <p className="text-muted mb-4">
                    Drag and drop a LinkedIn PDF or image here, or click to browse files
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FileText size={16} />
                      <span>PDF</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Images</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Max 50MB</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-primary-600">
                    <Sparkles size={16} />
                    <span className="font-medium">Auto-creates project with extracted company & contact info</span>
                  </div>
                </div>
              </div>
            )}
            
            <input
              id="file-upload"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Alternative Action */}
        <div className="flex items-center justify-center space-x-8">
          <div className="w-24 h-px bg-gray-300"></div>
          <span className="text-gray-500 font-medium">OR</span>
          <div className="w-24 h-px bg-gray-300"></div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleCreateProject}
            className="btn-secondary flex items-center space-x-2 mx-auto"
            disabled={isProcessing}
          >
            <Plus size={18} />
            <span>Create Empty Project</span>
            <ArrowRight size={16} />
          </button>
          <p className="text-subtle mt-2">
            Start with a blank project and add information manually
          </p>
        </div>
      </div>
    </div>
  );
}