'use client';

import { User, Briefcase, GraduationCap, Award, MapPin, Mail, Phone, Calendar, Building2 } from 'lucide-react';
import { ProspectProfile } from '@/types';

interface ProfessionalResumeDisplayProps {
  profile: ProspectProfile;
}

export function ProfessionalResumeDisplay({ profile }: ProfessionalResumeDisplayProps) {
  // Calculate total years of experience
  const calculateExperienceYears = () => {
    if (!profile.experience.length) return 0;
    
    const currentDate = new Date();
    let totalMonths = 0;
    
    profile.experience.forEach(exp => {
      const startDate = new Date(exp.start_date);
      let endDate;
      
      if (exp.end_date.toLowerCase().includes('present') || exp.end_date.toLowerCase().includes('current')) {
        endDate = currentDate;
      } else {
        endDate = new Date(exp.end_date);
      }
      
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
      totalMonths += monthsDiff;
    });
    
    return Math.round(totalMonths / 12);
  };

  const experienceYears = calculateExperienceYears();
  const currentRole = profile.experience[0];

  return (
    <div className="animate-fade-in">
      {/* Professional Resume Header */}
      <div className="card-elevated bg-white shadow-xl border-l-4 border-primary-600 mb-8">
        <div className="p-8">
          {/* Name and Title Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
                {profile.headline && (
                  <h2 className="text-xl text-gray-600 font-medium mb-4">{profile.headline}</h2>
                )}
                
                {/* Key Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                  {experienceYears > 0 && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-medium">{experienceYears}+ years experience</span>
                    </div>
                  )}
                  {currentRole && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">Currently at {currentRole.company}</span>
                    </div>
                  )}
                  {profile.experience.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">{profile.experience.length} positions held</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Professional Avatar */}
              <div className="ml-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            
            {/* Professional Contact Bar */}
            <div className="flex flex-wrap gap-6 text-gray-600 text-sm">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.contact.email}</span>
                </div>
              )}
              {profile.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{profile.contact.phone}</span>
                </div>
              )}
              {profile.contact?.linkedin_url && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn Profile</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {profile.notes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Professional Summary
              </h3>
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border-l-4 border-primary-500 shadow-sm">
                <div className="space-y-3">
                  {profile.notes.map((note, index) => (
                    <p key={index} className="text-gray-800 leading-relaxed text-lg font-medium">
                      {note.replace(/^(Skills|Summary):\s*/, '')}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Career History */}
      {profile.experience.length > 0 && (
        <div className="card-elevated bg-white shadow-xl mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-primary-600" />
                Career History
              </h3>
              <div className="text-gray-500 text-sm">
                {profile.experience.length} position{profile.experience.length !== 1 ? 's' : ''} • {experienceYears}+ years total
              </div>
            </div>
            
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={index} className="group">
                  {/* Job Entry Card */}
                  <div className={`bg-white border-2 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    index === 0 && (exp.end_date.toLowerCase().includes('present') || exp.end_date.toLowerCase().includes('current'))
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-blue-50' 
                      : 'border-gray-200 hover:border-primary-200'
                  }`}>
                    {/* Job Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                              {exp.title}
                            </h4>
                            <h5 className="text-xl text-primary-600 font-semibold mb-4">{exp.company}</h5>
                            
                            {/* Job Details */}
                            <div className="flex flex-wrap gap-6 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-primary-500" />
                                <span className="font-medium">
                                  {exp.start_date} - {exp.end_date}
                                </span>
                              </div>
                              {exp.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-primary-500" />
                                  <span>{exp.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Current Position Badge */}
                          {index === 0 && (exp.end_date.toLowerCase().includes('present') || exp.end_date.toLowerCase().includes('current')) && (
                            <div>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Current Position
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Achievements & Responsibilities */}
                    {exp.summary_bullets.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h6 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center">
                          <Award className="w-4 h-4 mr-2 text-primary-600" />
                          Key Achievements & Responsibilities
                        </h6>
                        <div className="space-y-3">
                          {exp.summary_bullets.map((bullet, bulletIndex) => (
                            <div key={bulletIndex} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700 leading-relaxed flex-1">{bullet}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Spacer between jobs */}
                  {index < profile.experience.length - 1 && (
                    <div className="h-8 flex items-center justify-center">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Education and Certifications Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Education Section */}
        <div className="card-elevated bg-white shadow-xl">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <GraduationCap className="w-6 h-6 mr-3 text-primary-600" />
              Education
            </h3>
            
            {profile.education && profile.education.length > 0 ? (
              <div className="space-y-6">
                {profile.education.map((edu, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{edu.degree}</h4>
                        <h5 className="text-lg text-primary-600 font-semibold mb-2">{edu.school}</h5>
                        {edu.field && (
                          <p className="text-gray-700 font-medium">{edu.field}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            {edu.start_year} - {edu.end_year}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No education information available</p>
                <p className="text-sm">Education details not found in uploaded document</p>
              </div>
            )}
          </div>
        </div>

        {/* Licenses & Certifications Section */}
        <div className="card-elevated bg-white shadow-xl">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-primary-600" />
              Licenses & Certifications
            </h3>
            
            {profile.licenses_certifications && profile.licenses_certifications.length > 0 ? (
              <div className="space-y-6">
                {profile.licenses_certifications.map((cert, index) => (
                  <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{cert.name}</h4>
                        <h5 className="text-lg text-amber-600 font-semibold mb-2">{cert.issuer}</h5>
                        {cert.credential_id && (
                          <p className="text-gray-600 text-sm font-mono bg-gray-100 px-3 py-1 rounded-md inline-block">
                            ID: {cert.credential_id}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">
                            Issued: {cert.issue_date}
                          </span>
                        </div>
                        {cert.expiry_date && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-red-500" />
                            <span className="font-medium">
                              Expires: {cert.expiry_date}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No certifications available</p>
                <p className="text-sm">License and certification details not found in uploaded document</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}