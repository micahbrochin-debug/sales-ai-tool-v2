'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, User, Briefcase, GraduationCap, Award, StickyNote, AlertCircle, CheckCircle } from 'lucide-react';
import { Project, ProspectProfile } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { extractTextFromPDF, extractTextFromImage, isValidFileType, formatFileSize, validateExtractedText, ExtractionProgress } from '@/lib/pdfExtractor';
import { extractProspectProfile } from '@/lib/ai';
import { ProfessionalResumeDisplay } from '@/components/profile/ProfessionalResumeDisplay';
import toast from 'react-hot-toast';

interface ProfileTabProps {
  project: Project;
}

export function ProfileTab({ project }: ProfileTabProps) {
  const { updateProspectProfile, setLoading, setError, createProject, setSelectedProject } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ExtractionProgress | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    console.log('File upload started:', { name: file.name, type: file.type, size: file.size });
    
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
      
      let text: string;
      
      if (file.type === 'application/pdf') {
        console.log('Processing PDF with PDF.js...');
        text = await extractTextFromPDF(file, setUploadProgress);
      } else {
        console.log('Processing image with OCR...');
        text = await extractTextFromImage(file, setUploadProgress);
      }

      console.log('Text extracted, length:', text.length);
      setExtractedText(text);
      
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
      
      // Now extract the prospect profile from the text
      setUploadProgress({ status: 'Extracting profile data...', progress: 95 });
      console.log('Calling AI service to extract profile...');
      
      const profile = await extractProspectProfile(text);
      console.log('Profile extracted:', profile);
      
      // Auto-create project if needed and extract company information
      let targetProjectId = project.id;
      let companyName = '';
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
      
      // Auto-create a new project if this upload seems to be for a different company
      const shouldCreateNewProject = companyName && companyName !== 'Unknown Company' && 
        (!project.company_name || 
         project.company_name.toLowerCase() !== companyName.toLowerCase() ||
         project.company_name === 'Demo Company');
      
      if (shouldCreateNewProject) {
        console.log('Auto-creating new project for:', companyName, 'with contact:', personName);
        setUploadProgress({ status: 'Creating project...', progress: 97 });
        
        const projectName = `${companyName} - ${personName}`;
        createProject(projectName, companyName);
        
        // Get the newly created project ID (it will be the most recent)
        // We need to wait a moment for the store to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The new project should now be the current project
        // But we'll use the project passed in for now and let the store handle the switch
        toast.success(`New project created: ${projectName}`, { duration: 4000 });
      }
      
      updateProspectProfile(targetProjectId, profile);
      
      setUploadProgress({ status: 'Complete!', progress: 100 });
      toast.success('Profile extracted successfully!');
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);

      // Start automatic research pipeline
      setTimeout(() => {
        startAutomaticResearch(profile);
      }, 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const startAutomaticResearch = async (profile: ProspectProfile) => {
    try {
      console.log('Starting automatic research pipeline...');
      toast.success('Starting automatic research pipeline...', { duration: 3000 });
      
      // Extract company name from experience
      const currentExperience = profile.experience[0];
      if (currentExperience && currentExperience.company) {
        console.log('Triggering research for company:', currentExperience.company);
        // This would trigger the other tabs to start their research
        // For now, we'll just show a notification
        toast.success(`Research initiated for ${currentExperience.company}`, { duration: 5000 });
      }
    } catch (error) {
      console.error('Error starting research pipeline:', error);
      toast.error('Failed to start automatic research');
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

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Professional Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-gray-900 mb-2">
                Prospect Profile
              </h1>
              <p className="text-muted text-lg">
                Extract comprehensive prospect information from LinkedIn profiles and documents
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Supports PDF, PNG, JPG formats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Upload Section */}
        {!project.prospect_profile && (
          <div className="mb-12 animate-fade-in">
            <div className="card-elevated max-w-2xl mx-auto">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative p-12 text-center transition-all duration-300 rounded-xl border-2 border-dashed cursor-pointer
                  ${isDragging 
                    ? 'border-primary-400 bg-primary-50 scale-105' 
                    : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                  }
                  ${isProcessing ? 'pointer-events-none' : ''}
                `}
              >
                {uploadProgress ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="heading-md text-gray-900 mb-2">Processing Document</h3>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${uploadProgress.progress}%` }}
                        />
                      </div>
                      <p className="text-muted font-medium">
                        {uploadProgress.status}
                        {uploadProgress.currentPage && uploadProgress.totalPages && (
                          <span className="ml-2 text-gray-500">
                            (Page {uploadProgress.currentPage} of {uploadProgress.totalPages})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                      <Upload size={32} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="heading-md text-gray-900 mb-2">
                        Upload LinkedIn Profile
                      </h3>
                      <p className="text-muted mb-6">
                        Drop your LinkedIn PDF here or click to browse and upload
                      </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                      <button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="btn-primary px-8 py-3"
                        disabled={isProcessing}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                      </button>
                      <p className="text-subtle">
                        PDF, PNG, JPG • Maximum 50MB
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile Display */}
        {project.prospect_profile ? (
          <ProfessionalResumeDisplay profile={project.prospect_profile} />
        ) : (
          <div className="card-elevated max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText size={40} className="text-gray-400" />
            </div>
            <h3 className="heading-md text-gray-900 mb-3">
              No Profile Data Available
            </h3>
            <p className="text-muted text-lg mb-6">
              Upload a LinkedIn profile to begin comprehensive prospect analysis
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Upload a document above to get started</span>
            </div>
          </div>
        )}

        {/* Raw Text Preview (for debugging) */}
        {extractedText && (
          <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
            <h4 className="font-medium text-secondary-900 mb-2">
              Extracted Text Preview
            </h4>
            <pre className="text-xs text-secondary-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {extractedText.substring(0, 1000)}...
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

