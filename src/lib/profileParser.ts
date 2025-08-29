// Real LinkedIn profile parser that extracts actual data from PDF text

import { ProspectProfile, Experience, Education, LicenseCertification } from '@/types';

export function parseLinkedInProfile(text: string): ProspectProfile {
  console.log('Parsing LinkedIn profile from text:', text.substring(0, 500) + '...');
  
  const profile: ProspectProfile = {
    full_name: extractFullName(text),
    headline: extractHeadline(text),
    location: extractLocation(text),
    contact: extractContact(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    licenses_certifications: extractCertifications(text),
    notes: extractNotes(text)
  };

  console.log('Parsed profile:', profile);
  return profile;
}

function extractFullName(text: string): string {
  console.log('Extracting name from text:', text.substring(0, 300));
  
  // Look for name patterns at the beginning of the document
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Try different patterns for names
  const namePatterns = [
    // Direct name patterns
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/,
    // Name followed by credentials or title
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*(?:MBA|PhD|MD|CPA|PE|Jr\.?|Sr\.?|II|III)*$/i,
    // Name at start of line
    /^([A-Z][a-z]+ [A-Z][a-z]+)/
  ];
  
  // Search through first 10 lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    console.log(`Line ${i}: "${line}"`);
    
    // Skip obvious non-name lines
    if (line.toLowerCase().includes('linkedin') || 
        line.toLowerCase().includes('profile') ||
        line.toLowerCase().includes('contact') ||
        line.toLowerCase().includes('phone') ||
        line.toLowerCase().includes('email') ||
        line.toLowerCase().includes('@') ||
        line.includes('www.') ||
        line.includes('http') ||
        /^\d/.test(line) || // starts with number
        line.length < 4 ||
        line.length > 50) {
      continue;
    }
    
    // Try each pattern
    for (const pattern of namePatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1] || match[0];
        console.log('Found name match:', name);
        
        // Validate the name looks reasonable
        const words = name.split(' ').filter(w => w.length > 0);
        if (words.length >= 2 && words.length <= 4) {
          const isValidName = words.every(word => 
            /^[A-Z][a-z]*$/.test(word) && // Proper capitalization
            word.length >= 2 && 
            word.length <= 20
          );
          
          if (isValidName) {
            console.log('Valid name found:', name);
            return name;
          }
        }
      }
    }
    
    // Fallback: check if line looks like a simple name pattern
    const words = line.split(' ').filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 4) {
      const isLikelyName = words.every(word => 
        /^[A-Z][a-z]+$/.test(word) && // Starts with capital, followed by lowercase only
        word.length >= 2 && 
        word.length <= 15 &&
        !['The', 'And', 'For', 'With', 'At'].includes(word) // exclude common words
      );
      
      if (isLikelyName) {
        console.log('Fallback name found:', line);
        return line;
      }
    }
  }
  
  console.log('No name found, using fallback');
  return 'Unknown Name';
}

function extractHeadline(text: string): string | undefined {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for headline patterns after the name
  const headlinePatterns = [
    /^(.+)\s+at\s+(.+)$/i,  // "Senior Engineer at Company"
    /^(.+)\s+\|\s+(.+)$/,   // "Title | Company"
    /^(.+)\s+-\s+(.+)$/,    // "Title - Company"
  ];
  
  for (let i = 1; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    for (const pattern of headlinePatterns) {
      if (pattern.test(line) && line.length > 10 && line.length < 100) {
        return line;
      }
    }
    
    // Also look for lines that contain job titles
    if (containsJobTitle(line) && line.length < 100) {
      return line;
    }
  }
  
  return undefined;
}

function extractLocation(text: string): string | undefined {
  // Common location patterns
  const locationPatterns = [
    /(?:^|\n)(.*(?:CA|California|NY|New York|TX|Texas|FL|Florida|WA|Washington|IL|Illinois|MA|Massachusetts).*?)(?:\n|$)/gim,
    /(?:^|\n)(.*(?:United States|USA|US).*?)(?:\n|$)/gim,
    /(?:^|\n)(.*(?:San Francisco|New York|Los Angeles|Chicago|Boston|Seattle|Austin|Denver).*?)(?:\n|$)/gim,
  ];
  
  for (const pattern of locationPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const location = match.trim().replace(/^\n|\n$/g, '');
        if (location.length > 3 && location.length < 100 && !location.toLowerCase().includes('experience')) {
          return location;
        }
      }
    }
  }
  
  return undefined;
}

function extractContact(text: string): any {
  const contact: any = {};
  
  // Email pattern
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    contact.email = emailMatch[1];
  }
  
  // Phone pattern
  const phoneMatch = text.match(/(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
  if (phoneMatch) {
    contact.phone = phoneMatch[1];
  }
  
  // LinkedIn URL pattern
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/);
  if (linkedinMatch) {
    contact.linkedin_url = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }
  
  return Object.keys(contact).length > 0 ? contact : undefined;
}

function extractExperience(text: string): Experience[] {
  const experiences: Experience[] = [];
  
  // Split text into sections and look for experience section
  const sections = text.split(/\n\s*\n/);
  let experienceSection = '';
  
  for (const section of sections) {
    if (section.toLowerCase().includes('experience') || 
        section.toLowerCase().includes('work history') ||
        containsJobTitle(section)) {
      experienceSection = section;
      break;
    }
  }
  
  // If no clear experience section, look for job patterns throughout
  if (!experienceSection) {
    experienceSection = text;
  }
  
  // Parse individual jobs
  const jobPatterns = [
    /(.+?)\s+at\s+(.+?)[\n\r]+(.*?)(?=\n\s*[A-Z][^a-z]*at\s+|\n\s*Education|\n\s*Skills|$)/gi,
    /(.+?)\s+\|\s+(.+?)[\n\r]+(.*?)(?=\n\s*[A-Z][^a-z]*\|\s+|\n\s*Education|\n\s*Skills|$)/gi,
  ];
  
  for (const pattern of jobPatterns) {
    let match;
    while ((match = pattern.exec(experienceSection)) !== null) {
      const title = match[1]?.trim();
      const company = match[2]?.trim();
      const details = match[3]?.trim();
      
      if (title && company && title.length < 100 && company.length < 100) {
        const dates = extractDates(details || '');
        const bullets = extractBullets(details || '');
        
        experiences.push({
          title,
          company,
          start_date: dates.start || 'Unknown',
          end_date: dates.end || 'Present',
          location: extractLocationFromText(details || '') || '',
          summary_bullets: bullets
        });
      }
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }
  
  return experiences;
}

function extractEducation(text: string): Education[] {
  const education: Education[] = [];
  
  // Look for education section
  const educationMatch = text.match(/Education[^]*?(?=\n\s*(?:Skills|Experience|Certifications|$))/i);
  const educationText = educationMatch ? educationMatch[0] : text;
  
  // University patterns
  const universityPatterns = [
    /([A-Z][a-zA-Z\s&]+(?:University|College|Institute|School))[^]*?([A-Z][a-zA-Z\s,]+)(?:\s*-\s*([A-Z][a-zA-Z\s,]+))?\s*(\d{4})\s*[-–]\s*(\d{4}|\w+)/gi,
    /([A-Z][a-zA-Z\s&]+(?:University|College|Institute|School))[^]*?(\d{4})\s*[-–]\s*(\d{4}|\w+)/gi,
  ];
  
  for (const pattern of universityPatterns) {
    let match;
    while ((match = pattern.exec(educationText)) !== null) {
      const school = match[1]?.trim();
      let degree = match[2]?.trim();
      let field = match[3]?.trim();
      let startYear = match[4]?.trim();
      let endYear = match[5]?.trim();
      
      // Handle different match patterns
      if (match.length === 4) {
        startYear = match[2];
        endYear = match[3];
        degree = 'Degree';
        field = '';
      }
      
      if (school) {
        education.push({
          school,
          degree: degree || 'Degree',
          field: field || '',
          start_year: startYear || '',
          end_year: endYear || ''
        });
      }
    }
    pattern.lastIndex = 0;
  }
  
  return education;
}

function extractCertifications(text: string): LicenseCertification[] {
  const certifications: LicenseCertification[] = [];
  
  // Look for certification patterns
  const certPatterns = [
    /([A-Z][a-zA-Z\s]+(?:Certified|Certificate|Certification))[^]*?([A-Z][a-zA-Z\s&]+)(?:\s*(?:Issued|Earned)\s*(\w+\s+\d{4}))?\s*(?:Expires?\s*(\w+\s+\d{4}))?/gi,
    /(AWS|Microsoft|Google|Cisco|Oracle|PMP|Scrum)\s+([A-Z][a-zA-Z\s]+)/gi,
  ];
  
  for (const pattern of certPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1]?.trim();
      const issuer = match[2]?.trim() || 'Unknown Issuer';
      const issueDate = match[3]?.trim() || '';
      const expiryDate = match[4]?.trim() || '';
      
      if (name && name.length < 100) {
        certifications.push({
          name,
          issuer,
          issue_date: issueDate,
          expiry_date: expiryDate,
          credential_id: ''
        });
      }
    }
    pattern.lastIndex = 0;
  }
  
  return certifications;
}

function extractNotes(text: string): string[] {
  const notes: string[] = [];
  
  // Look for skills section
  const skillsMatch = text.match(/Skills[^]*?(?=\n\s*(?:Education|Experience|Certifications|$))/i);
  if (skillsMatch) {
    notes.push(`Skills: ${skillsMatch[0].replace('Skills', '').trim()}`);
  }
  
  // Look for summary or about section
  const summaryMatch = text.match(/(?:Summary|About)[^]*?(?=\n\s*(?:Experience|Education|Skills|$))/i);
  if (summaryMatch) {
    notes.push(`Summary: ${summaryMatch[0].replace(/Summary|About/i, '').trim()}`);
  }
  
  return notes;
}

// Helper functions
function containsJobTitle(text: string): boolean {
  const jobTitles = [
    'engineer', 'developer', 'manager', 'director', 'analyst', 'consultant',
    'specialist', 'coordinator', 'supervisor', 'lead', 'senior', 'junior',
    'architect', 'designer', 'scientist', 'researcher', 'administrator',
    'officer', 'executive', 'president', 'vice president', 'ceo', 'cto', 'cfo'
  ];
  
  const lowerText = text.toLowerCase();
  return jobTitles.some(title => lowerText.includes(title));
}

function extractDates(text: string): { start?: string; end?: string } {
  const datePatterns = [
    /(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|Present)/gi,
    /(\d{4})\s*[-–]\s*(\d{4}|Present)/gi,
    /(\w{3}\s+\d{4})\s*[-–]\s*(\w{3}\s+\d{4}|Present)/gi,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        start: match[1] || undefined,
        end: match[2] || undefined
      };
    }
  }
  
  return {};
}

function extractBullets(text: string): string[] {
  const bullets: string[] = [];
  
  // Look for bullet points or line-separated responsibilities
  const bulletPatterns = [
    /[•·▪▫▸▹‣⁃]\s*(.+)/g,
    /^-\s*(.+)/gm,
    /^\*\s*(.+)/gm,
  ];
  
  for (const pattern of bulletPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].trim().length > 10) {
        bullets.push(match[1].trim());
      }
    }
    pattern.lastIndex = 0;
  }
  
  // If no bullets found, split by sentences
  if (bullets.length === 0) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    return sentences.slice(0, 5); // Limit to 5 sentences
  }
  
  return bullets;
}

function extractLocationFromText(text: string): string | null {
  const locationMatch = text.match(/(San Francisco|New York|Los Angeles|Chicago|Boston|Seattle|Austin|Denver|Remote|[A-Z][a-z]+,\s*[A-Z]{2})/);
  return locationMatch ? locationMatch[1] : null;
}