// OCR and PDF processing utilities

import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    onProgress?.({ status: 'Processing PDF...', progress: 10 });
    
    // Check if Tesseract is available
    if (!Tesseract) {
      throw new Error('OCR library not available');
    }
    
    onProgress?.({ status: 'Initializing OCR...', progress: 30 });
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onProgress?.({ status: 'Performing OCR on PDF...', progress: 60 });
    
    // Use Tesseract to extract text from the PDF file
    const ocrResult = await Tesseract.recognize(file, 'eng', {
      logger: (m: any) => {
        console.log('OCR Progress:', m);
        if (m.status === 'recognizing text') {
          onProgress?.({ 
            status: 'Processing text...', 
            progress: 60 + (m.progress * 35)
          });
        }
      }
    });
    
    onProgress?.({ status: 'Complete!', progress: 100 });
    
    if (!ocrResult?.data?.text) {
      throw new Error('No text could be extracted from the file');
    }
    
    return ocrResult.data.text;
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    onProgress?.({ status: 'Starting OCR...', progress: 10 });
    
    // Check if Tesseract is available
    if (!Tesseract) {
      throw new Error('OCR library not available');
    }
    
    console.log('Processing image:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m: any) => {
        console.log('Image OCR Progress:', m);
        if (m.status === 'recognizing text') {
          onProgress?.({ 
            status: 'Processing image...', 
            progress: 10 + (m.progress * 80) 
          });
        }
      }
    });
    
    onProgress?.({ status: 'Complete!', progress: 100 });
    
    if (!result?.data?.text) {
      throw new Error('No text could be extracted from the image');
    }
    
    console.log('Extracted text length:', result.data.text.length);
    return result.data.text;
    
  } catch (error) {
    console.error('Error performing OCR on image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to extract text from image: ${errorMessage}`);
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