// Mock OCR service for testing when Tesseract.js has issues

export interface OCRProgress {
  status: string;
  progress: number;
}

const MOCK_LINKEDIN_TEXT = `
John Smith
Senior Software Engineer at TechCorp

Contact
Email: john.smith@email.com
Phone: (555) 123-4567

Experience

Senior Software Engineer
TechCorp • Full-time
Jan 2022 - Present • 2 yrs 9 mos
San Francisco, California, United States
• Lead development of microservices architecture serving 1M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 3 junior developers on best practices and code reviews
• Built REST APIs with Node.js, Express, and PostgreSQL
• Collaborated with product team on feature requirements and design

Software Engineer
StartupInc • Full-time  
Mar 2020 - Dec 2021 • 1 yr 10 mos
Remote
• Developed React frontend applications with TypeScript
• Built REST APIs serving 500k+ daily requests
• Implemented automated testing reducing bugs by 40%
• Worked in agile environment with 2-week sprints

Education

Stanford University
Bachelor of Science - BS, Computer Science
2016 - 2020

Skills
JavaScript • TypeScript • React • Node.js • Python • Docker • Kubernetes • AWS • PostgreSQL

Certifications
AWS Solutions Architect Associate
Amazon Web Services (AWS)
Issued Mar 2023 • Expires Mar 2026
Credential ID: AWS-SA-12345
`;

export async function mockExtractTextFromPDF(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  // Simulate OCR processing
  onProgress?.({ status: 'Processing PDF...', progress: 10 });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  onProgress?.({ status: 'Extracting text...', progress: 50 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  onProgress?.({ status: 'Complete!', progress: 100 });
  
  return MOCK_LINKEDIN_TEXT.trim();
}

export async function mockExtractTextFromImage(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  // Simulate OCR processing
  onProgress?.({ status: 'Processing image...', progress: 10 });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  onProgress?.({ status: 'Extracting text...', progress: 50 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  onProgress?.({ status: 'Complete!', progress: 100 });
  
  return MOCK_LINKEDIN_TEXT.trim();
}

export function isValidFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp'
  ];
  
  return validTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}