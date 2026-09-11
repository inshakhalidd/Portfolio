import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const MAX_CHARS = 8000;
const MAX_PAGES = 10;

// Extracts plain text from a .txt or .pdf brief file, capped for prompt size.
export async function extractBriefText(file) {
  if (!file) return '';

  if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
    const text = await file.text();
    return text.slice(0, MAX_CHARS);
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';
    const pageCount = Math.min(pdf.numPages, MAX_PAGES);
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + '\n';
      if (text.length > MAX_CHARS) break;
    }
    return text.slice(0, MAX_CHARS);
  }

  throw new Error('Unsupported file type — upload a .txt or .pdf file.');
}
