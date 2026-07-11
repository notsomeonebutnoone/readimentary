import { ensurePdfJsLoaded } from './pdfEngine';
import { parseLoadedPdfProgressively } from './progressivePdfParserCore';

export async function parsePdfProgressively(arrayBuffer, { onReady, onProgress, signal } = {}) {
  const pdfLib = await ensurePdfJsLoaded();
  const pdf = await pdfLib.getDocument({ data: arrayBuffer }).promise;
  return parseLoadedPdfProgressively(pdf, { onReady, onProgress, signal });
}
