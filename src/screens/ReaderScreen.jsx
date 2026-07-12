import React, { useRef, useState } from 'react';
import { ChevronLeft, Settings, RotateCcw, Pause, Play, Home, Zap } from 'lucide-react';
import PDFViewer from '../components/app/PDFViewer';

export default function ReaderScreen({
  currentBook,
  currentChapter,
  currentIndex,
  words,
  fontSize,
  fontFamily,
  wpm,
  setWpm,
  progress,
  parsedContext,
  isPlaying,
  setIsPlaying,
  setShowSettings,
  setCurrentIndexWithTracking,
  onSeekWord,
  navigateTo,
  renderWord
}) {
  const splitContainerRef = useRef(null);
  const [pdfPanePercent, setPdfPanePercent] = useState(() => {
    const saved = Number(window.localStorage.getItem('readimentary-reader-split'));
    return Number.isFinite(saved) && saved >= 25 && saved <= 75 ? saved : 55;
  });
  const [playerHeight, setPlayerHeight] = useState(() => {
    const saved = Number(window.localStorage.getItem('readimentary-player-height'));
    const preferred = Number.isFinite(saved) && saved >= 230 ? saved : 410;
    return Math.max(230, Math.min(window.innerHeight * 0.7, preferred));
  });

  const setSplit = (nextPercent) => {
    const clamped = Math.max(25, Math.min(75, nextPercent));
    setPdfPanePercent(clamped);
    window.localStorage.setItem('readimentary-reader-split', String(clamped));
  };

  const beginSplitResize = (event) => {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    const container = splitContainerRef.current;
    if (!container) return;

    const resize = (pointerEvent) => {
      const bounds = container.getBoundingClientRect();
      setSplit(((pointerEvent.clientX - bounds.left) / bounds.width) * 100);
    };
    const stop = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', stop);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stop, { once: true });
  };

  const handleSplitKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setSplit(pdfPanePercent + (event.key === 'ArrowRight' ? 2 : -2));
  };

  const setPlayerSize = (nextHeight) => {
    const maximum = Math.max(260, window.innerHeight * 0.7);
    const clamped = Math.max(230, Math.min(maximum, nextHeight));
    setPlayerHeight(clamped);
    window.localStorage.setItem('readimentary-player-height', String(clamped));
  };

  const beginPlayerResize = (event) => {
    event.preventDefault();
    const resize = (pointerEvent) => setPlayerSize(window.innerHeight - pointerEvent.clientY);
    const stop = () => {
      window.removeEventListener('pointermove', resize);
      window.removeEventListener('pointerup', stop);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stop, { once: true });
  };

  const handlePlayerResizeKeyDown = (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    setPlayerSize(playerHeight + (event.key === 'ArrowUp' ? 20 : -20));
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
      <header className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-xl bg-white/5">
        <button
          onClick={() => navigateTo('chapters')}
          className="text-white/50 hover:text-white flex items-center gap-2 font-bold text-xs tracking-[0.2em] uppercase transition-all hover:translate-x-[-2px]"
        >
          <ChevronLeft size={16} /> BACK
        </button>
        <div className="flex items-center gap-3 flex-1 justify-center max-w-sm min-w-0">
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[10px] text-amber-500 font-black tracking-[0.3em] uppercase mb-1">NOW READING</span>
            <h4 className="text-sm font-bold truncate w-full text-center text-white tracking-[0.1em] uppercase" title={currentChapter?.title}>
              {currentChapter?.title}
            </h4>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
        >
          <Settings size={20} />
        </button>
      </header>

      <div ref={splitContainerRef} className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {(currentBook?.pdfUrl || currentBook?.pdfData) && (
          <div
            className="h-[48%] md:h-full w-full md:w-[var(--pdf-pane-width)] md:flex-none min-h-0 border-b md:border-b-0 border-white/5"
            style={{ '--pdf-pane-width': `${pdfPanePercent}%` }}
          >
            <PDFViewer
              pdfUrl={currentBook.pdfUrl}
              pdfData={currentBook.pdfData}
              currentWordIndex={currentIndex}
              totalWords={words.length}
              pageWordMap={currentBook.pageWordMap}
              wordToPage={currentBook.wordToPage}
              onSeekWord={onSeekWord}
            />
          </div>
        )}

        {(currentBook?.pdfUrl || currentBook?.pdfData) && (
          <div
            role="separator"
            aria-label="Resize PDF and speed reader panes"
            aria-orientation="vertical"
            aria-valuemin={25}
            aria-valuemax={75}
            aria-valuenow={Math.round(pdfPanePercent)}
            tabIndex={0}
            onPointerDown={beginSplitResize}
            onKeyDown={handleSplitKeyDown}
            className="group relative z-30 hidden md:flex w-2 flex-none cursor-col-resize items-center justify-center bg-white/[0.03] hover:bg-amber-500/10 focus:bg-amber-500/10 focus:outline-none"
            title="Drag to resize panels"
          >
            <div className="h-16 w-px bg-white/15 transition-all group-hover:h-24 group-hover:bg-amber-400 group-focus:h-24 group-focus:bg-amber-400" />
            <span className="absolute h-5 w-1 rounded-full bg-white/30 transition-colors group-hover:bg-amber-400 group-focus:bg-amber-400" />
          </div>
        )}

        <main className={`min-w-0 min-h-0 flex-1 flex flex-col items-center justify-center relative bg-[#050505] ${currentBook?.pdfUrl || currentBook?.pdfData ? '' : 'w-full'}`}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-4xl h-[120px] border-y border-white/5 flex justify-center">
              <div className="w-[2px] h-full bg-amber-500/15 shadow-[0_0_16px_rgba(245,158,11,0.15)]" />
            </div>
          </div>

          <div style={{ fontSize: `${fontSize}px`, fontFamily }} className="relative z-10 w-full max-w-5xl text-center leading-none tracking-tighter px-8">
            {renderWord()}
          </div>

          <div className="absolute bottom-8 flex gap-8 text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">
            <span>WPM: {wpm}</span>
          </div>
        </main>
      </div>

      <div
        role="separator"
        aria-label="Resize player controls"
        aria-orientation="horizontal"
        aria-valuemin={230}
        aria-valuemax={Math.round(window.innerHeight * 0.7)}
        aria-valuenow={Math.round(playerHeight)}
        tabIndex={0}
        onPointerDown={beginPlayerResize}
        onKeyDown={handlePlayerResizeKeyDown}
        className="group relative z-40 flex h-2 flex-none cursor-row-resize items-center justify-center border-y border-white/5 bg-white/[0.03] hover:bg-amber-500/10 focus:bg-amber-500/10 focus:outline-none"
        title="Drag to resize player"
      >
        <div className="h-px w-20 bg-white/15 transition-all group-hover:w-32 group-hover:bg-amber-400 group-focus:w-32 group-focus:bg-amber-400" />
        <span className="absolute h-1 w-5 rounded-full bg-white/30 transition-colors group-hover:bg-amber-400 group-focus:bg-amber-400" />
      </div>

      <footer
        className="p-5 md:p-8 bg-white/5 backdrop-blur-xl flex flex-none flex-col items-center gap-6 overflow-y-auto"
        style={{ height: `${playerHeight}px` }}
      >
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Chapter Progress</span>
            <span className="text-2xl font-black text-amber-500 transition-all tracking-tight">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-amber-500/60 to-amber-500/80 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentIndexWithTracking(currentChapter.startIndex)}
            className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
            title="Reset chapter"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] border-2 border-white/20"
          >
            {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              navigateTo('library');
            }}
            className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
            title="Return to library"
          >
            <Home size={24} />
          </button>
        </div>

        <div className="w-full max-w-4xl border border-white/10 bg-white/[0.03] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Parsed Source Context</span>
            {!currentBook?.pdfUrl && <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500/70">PDF not available</span>}
          </div>
          <p className="text-sm leading-relaxed text-white/65">{parsedContext || 'No parsed text available yet.'}</p>
        </div>

        <div className="flex items-center gap-6 w-full max-w-md">
          <Zap size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1 relative h-6 flex items-center">
            <div
              className="absolute h-[2px] bg-gradient-to-r from-amber-500/40 to-amber-500/60 rounded-full pointer-events-none transition-all duration-300 ease-out"
              style={{ width: `${((wpm - 100) / (1000 - 100)) * 100}%` }}
            />
            <input type="range" min="100" max="1000" step="10" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="wpm-slider relative z-10" />
          </div>
          <span className="font-black text-lg w-16 text-right transition-all text-amber-500/80 tracking-tight">{wpm}</span>
        </div>
      </footer>
    </div>
  );
}
