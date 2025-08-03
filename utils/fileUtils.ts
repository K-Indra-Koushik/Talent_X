import * as pdfjsLib from 'pdfjs-dist';

// Set the workerSrc to the path that will be resolved by the import map.
// This tells PDF.js where to load its worker script from.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          return reject(new Error("Failed to read file."));
        }

        if (file.type === 'application/pdf') {
          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let textContent = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
          }
          resolve(textContent);
        } else if (file.type === 'text/plain') {
          resolve(event.target.result as string);
        } else {
          reject(new Error(`Unsupported file type: ${file.type}. Please upload a PDF or TXT file.`));
        }
      } catch (error) {
        console.error("Error processing file:", error);
        reject(new Error(`Error processing file: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("Error reading file."));
    };
    
    if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
    } else if (file.type === 'text/plain') {
        reader.readAsText(file);
    } else {
        reject(new Error(`Unsupported file type: ${file.type}. Please upload a PDF or TXT file.`));
    }
  });
};