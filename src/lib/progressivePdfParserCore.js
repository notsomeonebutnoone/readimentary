import { tokenizeText, detectChaptersFromText } from './textProcessing.js';

const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

export async function parseLoadedPdfProgressively(pdf, { onReady, onProgress, signal } = {}) {
  const words = [];
  const pageTexts = [];
  const pageWordMap = [];
  const wordToPage = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    if (signal?.aborted) throw new DOMException('PDF processing cancelled.', 'AbortError');
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    const pageWords = tokenizeText(pageText);
    const startIndex = words.length;
    pageTexts.push(pageText);
    words.push(...pageWords);
    wordToPage.push(...Array(pageWords.length).fill(pageNumber));
    pageWordMap.push({ page: pageNumber, startIndex, endIndex: words.length, wordCount: pageWords.length });

    const snapshot = {
      words: [...words], pageWordMap: [...pageWordMap], wordToPage: [...wordToPage],
      parsedPages: pageNumber, totalPages: pdf.numPages,
      progress: pageNumber / pdf.numPages,
      status: pageNumber === pdf.numPages ? 'ready' : 'processing'
    };
    if (pageNumber === 1) onReady?.(snapshot);
    onProgress?.(snapshot);
    await yieldToBrowser();
  }

  return { words, pageWordMap, wordToPage, chapters: detectChaptersFromText(pageTexts.join('\n')), parsedPages: pdf.numPages, totalPages: pdf.numPages, status: 'ready' };
}
