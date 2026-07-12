import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ensurePdfJsLoaded } from '../../lib/pdfEngine';
import { tokenizeText } from '../../lib/textProcessing';

const multiplyTransforms = (first, second) => [
  first[0] * second[0] + first[2] * second[1],
  first[1] * second[0] + first[3] * second[1],
  first[0] * second[2] + first[2] * second[3],
  first[1] * second[2] + first[3] * second[3],
  first[0] * second[4] + first[2] * second[5] + first[4],
  first[1] * second[4] + first[3] * second[5] + first[5]
];

export default function PDFViewer({ pdfUrl, pdfData, currentWordIndex, totalWords, pageWordMap, wordToPage, onSeekWord }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const pdfRef = useRef(null);
  const renderTokenRef = useRef(0);
  const requestedPageRef = useRef(1);
  const renderPdfPageRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [textLayer, setTextLayer] = useState({ page: 1, width: 0, height: 0, items: [] });

  const renderPdfPage = useCallback(async (pageNum) => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    const { width: containerWidth, height: containerHeight } = containerSize;
    const token = ++renderTokenRef.current;
    requestedPageRef.current = pageNum;
    setPage(pageNum);
    setTextLayer((previous) => ({ ...previous, page: pageNum, items: [] }));
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

    const [textContent] = await Promise.all([
      pdfPage.getTextContent(),
      pdfPage.render({ canvasContext: context, viewport }).promise
    ]);

    const pageEntry = pageWordMap?.find((entry) => Number(entry.page) === pageNum);
    let globalWordIndex = pageEntry?.startIndex ?? 0;
    const pageEndIndex = pageEntry?.endIndex ?? (pageEntry ? pageEntry.startIndex + pageEntry.wordCount : Number.POSITIVE_INFINITY);
    const clickableItems = [];

    textContent.items.forEach((item, itemIndex) => {
      if (!item?.str || globalWordIndex >= pageEndIndex) return;
      const itemWords = tokenizeText(item.str);
      if (itemWords.length === 0) return;

      const transform = multiplyTransforms(viewport.transform, item.transform);
      const fontHeight = Math.max(7, Math.hypot(transform[2], transform[3]));
      const angle = Math.atan2(transform[1], transform[0]);
      const visibleWords = itemWords.slice(0, Math.max(0, pageEndIndex - globalWordIndex));
      const words = visibleWords.map((word) => ({ text: word.text, index: globalWordIndex++ }));

      clickableItems.push({
        id: `${pageNum}-${itemIndex}`,
        left: transform[4],
        top: transform[5] - fontHeight,
        width: Math.max(fontHeight * 0.45, (item.width || 0) * viewport.scale),
        height: fontHeight * 1.2,
        angle,
        words
      });
    });

    if (renderTokenRef.current === token) {
      setTextLayer({ page: pageNum, width: viewport.width, height: viewport.height, items: clickableItems });
      setPage(pageNum);
    }
  }, [containerSize, pageWordMap]);

  useEffect(() => {
    renderPdfPageRef.current = renderPdfPage;
  }, [renderPdfPage]);

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

        const initialPage = requestedPageRef.current || 1;
        await renderPdfPageRef.current?.(initialPage);
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
            const initialPage = requestedPageRef.current || 1;
            await renderPdfPageRef.current?.(initialPage);
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
  }, [pdfUrl, pdfData]);

  useEffect(() => {
    if (!pdfRef.current || containerSize.width <= 0 || containerSize.height <= 0) return;
    const currentPage = requestedPageRef.current || page;
    renderPdfPage(currentPage).catch((err) => console.error('PDF resize render error:', err));
  }, [containerSize.width, containerSize.height, renderPdfPage]);

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

  const navigateToPage = (nextPage) => {
    const targetPage = Math.max(1, Math.min(numPages, nextPage));
    if (targetPage === requestedPageRef.current) return;
    const pageEntry = pageWordMap?.find((entry) => Number(entry.page) === targetPage);

    requestedPageRef.current = targetPage;
    setPage(targetPage);
    setTextLayer((previous) => ({ ...previous, page: targetPage, items: [] }));
    renderPdfPage(targetPage).catch((err) => console.error('PDF page navigation error:', err));
    if (pageEntry && Number.isFinite(pageEntry.startIndex)) onSeekWord?.(pageEntry.startIndex);
  };

  if (!pdfUrl && !pdfData) return null;

  return (
    <div className="h-full flex flex-col bg-[#050505] border-l border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">Original PDF</span>
          <span className="hidden xl:inline text-[9px] tracking-[0.14em] uppercase text-amber-400/60">Click any word to seek</span>
        </div>
        {numPages > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToPage(requestedPageRef.current - 1)}
              disabled={page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-white/55 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/10 disabled:hover:bg-white/[0.03]"
              title="Previous PDF page"
              aria-label="Previous PDF page"
            >
              <span aria-hidden="true">←</span>
            </button>
            <span className="min-w-[88px] text-center text-[10px] font-bold tracking-[0.16em] uppercase text-white/40">
              Page {page} / {numPages}
            </span>
            <button
              type="button"
              onClick={() => navigateToPage(requestedPageRef.current + 1)}
              disabled={page >= numPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-white/55 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/10 disabled:hover:bg-white/[0.03]"
              title="Next PDF page"
              aria-label="Next PDF page"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
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
          <div className="relative shadow-2xl border border-white/10 rounded-lg overflow-hidden bg-black/20" style={{ width: textLayer.width || undefined, height: textLayer.height || undefined }}>
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
            <div className="absolute inset-0" aria-label="Clickable PDF text layer">
              {textLayer.page === page && textLayer.items.map((item) => (
                <span
                  key={item.id}
                  className="absolute flex pointer-events-none"
                  style={{
                    left: item.left,
                    top: item.top,
                    width: item.width,
                    height: item.height,
                    transform: `rotate(${item.angle}rad)`,
                    transformOrigin: '0 0'
                  }}
                >
                  {item.words.map((word) => (
                    <button
                      key={word.index}
                      type="button"
                      onClick={() => onSeekWord?.(word.index)}
                      className={`pointer-events-auto min-w-0 flex-1 rounded-[2px] border transition-colors duration-150 ${
                        word.index === currentWordIndex
                          ? 'border-amber-400/80 bg-amber-400/25'
                          : 'border-transparent bg-transparent hover:border-amber-400/80 hover:bg-amber-400/30'
                      }`}
                      title={`Jump reader to “${word.text}”`}
                      aria-label={`Jump reader to ${word.text}`}
                    >
                      <span className="sr-only">{word.text}</span>
                    </button>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
