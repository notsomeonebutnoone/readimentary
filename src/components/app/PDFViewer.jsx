import React, { useEffect, useRef, useState } from 'react';
import { ensurePdfJsLoaded } from '../../lib/pdfEngine';

export default function PDFViewer({ pdfUrl, pdfData, currentWordIndex, totalWords }) {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const pdfRef = useRef(null);

  useEffect(() => {
    if (!pdfUrl && !pdfData) return;
    let isMounted = true;

    const toByteSource = async () => {
      if (pdfData) {
        return { data: pdfData instanceof Uint8Array ? pdfData : new Uint8Array(pdfData) };
      }
      if (pdfUrl) {
        const res = await fetch(pdfUrl);
        const buf = await res.arrayBuffer();
        return { data: new Uint8Array(buf) };
      }
      return null;
    };

    const openDocument = async (pdfLib, source) => {
      if (!source) throw new Error('No PDF source available');
      try {
        return await pdfLib.getDocument(source).promise;
      } catch (firstErr) {
        // Fallback path: disable worker to avoid worker/CDN edge failures.
        return await pdfLib.getDocument({ ...source, disableWorker: true }).promise;
      }
    };

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const pdfLib = window.pdfjsLib || (await ensurePdfJsLoaded());
        if (!isMounted || !pdfLib) return;

        // Prefer byte-data path (same as chapter parsing flow) for stability.
        const byteSource = await toByteSource();
        const pdf = await openDocument(pdfLib, byteSource);
        if (!isMounted) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setPage(1);

        const pdfPage = await pdf.getPage(1);
        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await pdfPage.render({ canvasContext: context, viewport }).promise;
        if (isMounted) setIsLoading(false);
      } catch (err) {
        if (isMounted && pdfUrl) {
          // Last resort: direct URL load.
          try {
            const pdfLib = window.pdfjsLib || (await ensurePdfJsLoaded());
            const pdf = await openDocument(pdfLib, { url: pdfUrl });
            if (!isMounted) return;
            pdfRef.current = pdf;
            setNumPages(pdf.numPages);
            setPage(1);
            const pdfPage = await pdf.getPage(1);
            const viewport = pdfPage.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await pdfPage.render({ canvasContext: context, viewport }).promise;
            setLoadError('');
            setIsLoading(false);
            return;
          } catch (urlErr) {
            console.error('PDF URL fallback failed:', urlErr);
          }
        }
        if (isMounted) {
          setLoadError('Unable to render PDF in viewer.');
          setIsLoading(false);
        }
        console.error('PDF render error:', err);
      }
    };

    loadPDF();
    return () => {
      isMounted = false;
    };
  }, [pdfUrl, pdfData]);

  useEffect(() => {
    if (!pdfRef.current || totalWords === 0 || numPages === 0) return;

    const calculatePage = () => {
      const wordProgress = currentWordIndex / totalWords;
      return Math.max(1, Math.min(numPages, Math.ceil(wordProgress * numPages)));
    };

    const renderPage = async (pageNum) => {
      if (pageNum === page) return;
      try {
        const pdfPage = await pdfRef.current.getPage(pageNum);
        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await pdfPage.render({ canvasContext: context, viewport }).promise;
        setPage(pageNum);
      } catch (err) {
        console.error('PDF page render error:', err);
      }
    };

    const targetPage = calculatePage();
    if (targetPage !== page) renderPage(targetPage);
  }, [currentWordIndex, totalWords, numPages, page]);

  if (!pdfUrl && !pdfData) return null;

  return (
    <div className="h-full flex flex-col bg-[#050505] border-l border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">PDF Viewer</span>
        {numPages > 0 && (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
            Page {page} / {numPages}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.2em] uppercase text-white/40">
            Loading PDF...
          </div>
        )}
        {loadError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-xs tracking-[0.08em] uppercase text-red-300/80">
            {loadError}
          </div>
        )}
        <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl border border-white/10 rounded-lg" />
      </div>
    </div>
  );
}
