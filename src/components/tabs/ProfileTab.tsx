'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, User, Briefcase, GraduationCap, Award, StickyNote, AlertCircle, CheckCircle } from 'lucide-react';
import { Project, ProspectProfile } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { extractTextFromPDF, extractTextFromImage, isValidFileType, formatFileSize, validateExtractedText, ExtractionProgress } from '@/lib/pdfExtractor';
import { extractProspectProfile } from '@/lib/ai';
import toast from 'react-hot-toast';

interface ProfileTabProps {
  project: Project;
}

export function ProfileTab({ project }: ProfileTabProps) {
  const { updateProspectProfile, setLoading, setError } = useAppStore();
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
      
      updateProspectProfile(project.id, profile);
      
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
          <ProfileDisplay profile={project.prospect_profile} />
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

function ProfileDisplay({ profile }: { profile: ProspectProfile }) {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Professional Header Card */}
      <div className="card-elevated overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile.full_name}</h1>
                  {profile.headline && (
                    <h2 className="text-lg text-blue-100 font-medium">{profile.headline}</h2>
                  )}
                </div>
              </div>
              
              {/* Professional Contact Information */}
              <div className="flex flex-wrap gap-6 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{profile.location}</span>
                  </div>
                )}
                {profile.contact?.email && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="font-medium">{profile.contact.email}</span>
                  </div>
                )}
                {profile.contact?.phone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="font-medium">{profile.contact.phone}</span>
                  </div>
                )}
                {profile.contact?.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">LinkedIn Profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {profile.notes.length > 0 && (
        <div className="card-elevated">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="heading-md text-gray-900">Professional Summary</h3>
                <p className="text-subtle">Key insights and highlights</p>
              </div>
            </div>
            <div className="space-y-4">
              {profile.notes.map((note, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {note.replace(/^(Skills|Summary):\s*/, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {profile.experience.length > 0 && (
        <div className="card-elevated">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="heading-md text-gray-900">Professional Experience</h3>
                  <p className="text-subtle">{profile.experience.length} position{profile.experience.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>
              <div className="text-subtle text-sm">
                Most recent first
              </div>
            </div>
            
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {/* Timeline indicator */}
                  {index !== profile.experience.length - 1 && (
                    <div className="absolute left-6 top-16 w-px h-full bg-gray-200"></div>
                  )}
                  
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{exp.title}</h4>
                          <h5 className="text-lg text-primary-600 font-semibold mb-2">{exp.company}</h5>
                          {exp.location && (
                            <p className="text-gray-600 flex items-center gap-1 text-sm">
                              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {exp.location}
                            </p>
                          )}
                        </div>
                        <div className="lg:text-right mt-2 lg:mt-0">
                          <span className="status-info">
                            {exp.start_date} - {exp.end_date}
                          </span>
                        </div>
                      </div>
                      
                      {exp.summary_bullets.length > 0 && (
                        <div>
                          <h6 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Key Achievements & Responsibilities
                          </h6>
                          <ul className="space-y-3">
                            {exp.summary_bullets.map((bullet, bulletIndex) => (
                              <li key={bulletIndex} className="flex items-start gap-3 group">
                                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0 group-hover:bg-primary-600 transition-colors"></div>
                                <span className="text-gray-700 leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <div className="card-elevated">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="heading-md text-gray-900">Education</h3>
                <p className="text-subtle">{profile.education.length} institution{profile.education.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {profile.education.map((edu, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{edu.school}</h4>
                      <p className="text-gray-700 font-medium">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="status-info bg-blue-100 text-blue-800">
                      {edu.start_year} - {edu.end_year}
                    </span>
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Licenses & Certifications */}
      {profile.licenses_certifications.length > 0 && (
        <div className="card-elevated">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="heading-md text-gray-900">Professional Certifications</h3>
                <p className="text-subtle">{profile.licenses_certifications.length} certification{profile.licenses_certifications.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {profile.licenses_certifications.map((cert, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{cert.name}</h4>
                      <p className="text-gray-700 font-medium">{cert.issuer}</p>
                    </div>
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    {cert.credential_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-.257-.257A6 6 0 1118 8zm-1.402 1.911l1.402-1.911-1.402 1.911zm-2.598-2.911a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span><strong>ID:</strong> {cert.credential_id}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {cert.issue_date && (
                        <span className="status-success text-xs">
                          Issued {cert.issue_date}
                        </span>
                      )}
                      {cert.expiry_date && (
                        <span className="status-warning text-xs">
                          Expires {cert.expiry_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}