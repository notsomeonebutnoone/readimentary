import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ensurePdfJsLoaded } from '../../lib/pdfEngine';

export default function PDFViewer({ pdfUrl, pdfData, currentWordIndex, totalWords, pageWordMap, wordToPage }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const pdfRef = useRef(null);
  const renderTokenRef = useRef(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const renderPdfPage = useCallback(async (pageNum) => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    const { width: containerWidth, height: containerHeight } = containerSize;
    const token = ++renderTokenRef.current;
    const pdfPage = await pdf.getPage(pageNum);
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const safeWidth = Math.max(1, containerWidth);
    const safeHeight = Math.max(1, containerHeight);
    const scale = Math.min(safeWidth / baseViewport.width, safeHeight / baseViewport.height, 1);
    const viewport = pdfPage.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    await pdfPage.render({ canvasContext: context, viewport }).promise;
    if (renderTokenRef.current === token) setPage(pageNum);
  }, [containerSize]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({
        width: Math.max(0, rect.width - 24),
        height: Math.max(0, rect.height - 24)
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdfUrl && !pdfData) return;
    let isMounted = true;

    const toByteSource = async () => {
      if (pdfData) {
        if (pdfData instanceof Uint8Array) {
          return { data: new Uint8Array(pdfData) };
        }
        if (pdfData instanceof ArrayBuffer) {
          return { data: new Uint8Array(pdfData.slice(0)) };
        }
        return { data: new Uint8Array(pdfData) };
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
      } catch {
        // Fallback path: disable worker to avoid worker/CDN edge failures.
        return await pdfLib.getDocument({ ...source, disableWorker: true }).promise;
      }
    };

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const pdfLib = await ensurePdfJsLoaded();
        if (!isMounted || !pdfLib) return;

        // Prefer byte-data path (same as chapter parsing flow) for stability.
        const byteSource = await toByteSource();
        const pdf = await openDocument(pdfLib, byteSource);
        if (!isMounted) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);

        const initialPage = 1;
        await renderPdfPage(initialPage);
        if (isMounted) setIsLoading(false);
      } catch (err) {
        if (isMounted && pdfUrl) {
          // Last resort: direct URL load.
          try {
            const pdfLib = await ensurePdfJsLoaded();
            const pdf = await openDocument(pdfLib, { url: pdfUrl });
            if (!isMounted) return;
            pdfRef.current = pdf;
            setNumPages(pdf.numPages);
            const initialPage = 1;
            await renderPdfPage(initialPage);
            setLoadError('');
            setIsLoading(false);
            return;
          } catch (urlErr) {
            console.error('PDF URL fallback failed:', urlErr);
          }
        }
        if (isMounted) {
          const message = err?.message ? `Unable to render PDF in viewer: ${err.message}` : 'Unable to render PDF in viewer.';
          setLoadError(message);
          setIsLoading(false);
        }
        console.error('PDF render error:', err);
      }
    };

    loadPDF();
    return () => {
      isMounted = false;
    };
  }, [pdfUrl, pdfData, containerSize.width, containerSize.height, renderPdfPage]);

  useEffect(() => {
    if (!pdfRef.current || totalWords === 0 || numPages === 0) return;

    const calculatePage = () => {
      if (Array.isArray(wordToPage) && wordToPage.length > 0) {
        const safeIndex = Math.max(0, Math.min(wordToPage.length - 1, currentWordIndex));
        return wordToPage[safeIndex] || 1;
      }
      if (Array.isArray(pageWordMap) && pageWordMap.length > 0) {
        const map = pageWordMap.slice().sort((a, b) => a.startIndex - b.startIndex);
        let lo = 0;
        let hi = map.length - 1;
        let found = map[map.length - 1];
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          const entry = map[mid];
          const endIndex = entry.endIndex ?? entry.startIndex + entry.wordCount;
          if (currentWordIndex < entry.startIndex) {
            hi = mid - 1;
          } else if (currentWordIndex >= endIndex) {
            lo = mid + 1;
          } else {
            found = entry;
            break;
          }
        }
        return found.page || 1;
      }
      const wordProgress = currentWordIndex / totalWords;
      return Math.max(1, Math.min(numPages, Math.ceil(wordProgress * numPages)));
    };

    const targetPage = calculatePage();
    if (targetPage === page) return undefined;
    const timer = window.setTimeout(() => {
      renderPdfPage(targetPage).catch((err) => console.error('PDF page render error:', err));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentWordIndex, totalWords, numPages, page, pageWordMap, wordToPage, containerSize.width, containerSize.height, renderPdfPage]);

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
      <div ref={containerRef} className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
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
        <div className="max-w-[520px] w-full flex items-center justify-center">
          <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl border border-white/10 rounded-lg bg-black/20" />
        </div>
      </div>
    </div>
  );
}
