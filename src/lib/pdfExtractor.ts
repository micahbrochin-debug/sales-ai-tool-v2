// Robust PDF text extraction using PDF.js

import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface ExtractionProgress {
  status: string;
  progress: number;
  currentPage?: number;
  totalPages?: number;
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  try {
    onProgress?.({ status: 'Loading PDF...', progress: 5 });
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    onProgress?.({ status: 'Parsing PDF document...', progress: 15 });
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      verbosity: 0 // Reduce console noise
    }).promise;
    
    const numPages = pdf.numPages;
    console.log(`PDF loaded successfully. Total pages: ${numPages}`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const progressPercent = 15 + (pageNum / numPages) * 75;
      onProgress?.({ 
        status: `Extracting text from page ${pageNum}...`, 
        progress: progressPercent,
        currentPage: pageNum,
        totalPages: numPages
      });
      
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text items and reconstruct text with proper spacing
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim()) // Filter out empty items
          .map((item: any) => {
            // Add some basic formatting based on font size and position
            let text = item.str.trim();
            
            // Add line breaks for what appears to be new lines based on position
            if (item.transform && item.transform[5]) {
              // This is a very basic heuristic for line breaks
              // In a production app, you'd want more sophisticated text reconstruction
              return text;
            }
            
            return text;
          })
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
        
        // Clean up page resources
        page.cleanup();
        
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    onProgress?.({ status: 'Processing complete!', progress: 100 });
    
    // Clean up and validate result
    const cleanedText = fullText.trim();
    
    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('PDF appears to be empty or contains only images. Try using an image extraction tool.');
    }
    
    console.log(`Text extraction complete. Extracted ${cleanedText.length} characters from ${numPages} pages.`);
    return cleanedText;
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document.');
      } else if (error.message.includes('password')) {
        throw new Error('This PDF is password protected. Please upload an unprotected version.');
      } else {
        throw new Error(`PDF processing failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to extract text from PDF. The file may be corrupted or image-only.');
  }
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  try {
    onProgress?.({ status: 'Loading image...', progress: 10 });
    
    // For images, we'll still use Tesseract.js but with better error handling
    const Tesseract = await import('tesseract.js');
    
    onProgress?.({ status: 'Initializing OCR engine...', progress: 20 });
    
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          const progress = 20 + (m.progress * 70);
          onProgress?.({ 
            status: 'Processing image with OCR...', 
            progress 
          });
        }
      }
    });
    
    onProgress?.({ status: 'OCR complete!', progress: 100 });
    
    const text = result.data.text.trim();
    
    if (!text || text.length < 10) {
      throw new Error('No readable text found in image. Image may be too blurry or contain no text.');
    }
    
    console.log(`OCR extraction complete. Extracted ${text.length} characters.`);
    return text;
    
  } catch (error) {
    console.error('Image OCR error:', error);
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

// Utility function to validate extracted text quality
export function validateExtractedText(text: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!text || text.trim().length === 0) {
    issues.push('No text content found');
    return { isValid: false, issues };
  }
  
  if (text.length < 50) {
    issues.push('Very little text extracted - may be incomplete');
  }
  
  // Check for garbled text (too many special characters)
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
  if (specialCharRatio > 0.3) {
    issues.push('Text may contain OCR errors or special formatting');
  }
  
  return { isValid: issues.length === 0, issues };
}