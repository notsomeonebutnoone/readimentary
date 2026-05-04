import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let configured = false;

export const ensurePdfJsLoaded = () => {
  if (!configured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    configured = true;
  }
  return Promise.resolve(pdfjsLib);
};
