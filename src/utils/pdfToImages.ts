/**
 * Utility to extract PDF pages and convert them to images
 * This must be used in a client-side component only
 */

// Initialize worker once
let workerInitialized = false;

async function initializePdfWorker() {
  if (workerInitialized) return;
  
  if (typeof window === 'undefined') {
    throw new Error('PDF worker can only be initialized in browser');
  }

  const pdfjsLib = await import('pdfjs-dist');
  const pdfjsVersion = pdfjsLib.version || '5.4.530';
  
  // Try multiple worker sources for compatibility
  const workerSources = [
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`,
    `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`,
  ];

  // Set the first available worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
  
  workerInitialized = true;
}

export async function extractPdfPagesAsImages(file: File): Promise<string[]> {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('PDF extraction must be done in browser environment');
  }

  try {
    // Initialize worker first
    await initializePdfWorker();
    
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0, // Suppress console warnings
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const imagePromises: Promise<string>[] = [];

    // Limit to first 10 pages to avoid performance issues
    const maxPages = Math.min(numPages, 10);
    if (numPages > 10) {
      console.warn(`PDF has ${numPages} pages, only processing first 10`);
    }

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Scale for better quality

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      const renderParams = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };
      
      const renderTask = page.render(renderParams);
      await renderTask.promise;

      // Convert canvas to data URL (base64 image)
      const imageDataUrl = canvas.toDataURL('image/png', 0.9); // 0.9 quality for smaller file size
      imagePromises.push(Promise.resolve(imageDataUrl));
    }

    return Promise.all(imagePromises);
  } catch (error) {
    console.error('Error extracting PDF pages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error details:', error);
    throw new Error(`Failed to extract PDF pages: ${errorMessage}`);
  }
}
