'use client';

import { useState } from 'react';
import Tesseract from 'tesseract.js';

export function TestOCR() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testTesseract = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('Testing Tesseract.js availability...');
      
      if (!Tesseract) {
        throw new Error('Tesseract.js is not available');
      }

      // Create a simple canvas with text to test OCR
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw black text
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText('Hello World Test', 50, 50);
      
      // Convert to image data
      const imageData = canvas.toDataURL('image/png');
      
      console.log('Starting OCR test...');
      const ocrResult = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log('OCR:', m)
      });
      
      console.log('OCR completed:', ocrResult);
      setResult(ocrResult.data.text);
      
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-secondary-200 rounded-lg bg-secondary-50">
      <h3 className="font-medium mb-4">OCR Test Component</h3>
      
      <button
        onClick={testTesseract}
        disabled={loading}
        className="btn-primary mb-4"
      >
        {loading ? 'Testing...' : 'Test Tesseract.js'}
      </button>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
          <strong>OCR Result:</strong> "{result.trim()}"
        </div>
      )}
      
      <div className="text-sm text-secondary-600">
        This component tests if Tesseract.js is working correctly by creating a simple image with text and trying to extract it.
      </div>
    </div>
  );
}