import React from 'react';
import { ArrowRight, BookOpen, ChevronLeft, FileWarning } from 'lucide-react';

const WaitingCharacter = ({ color, delay, accessory }) => (
  <div
    className="chapter-wait-character"
    style={{ '--wait-color': color, '--wait-delay': `${delay}s` }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 108 132" role="presentation">
      <ellipse className="chapter-wait-shadow" cx="54" cy="124" rx="30" ry="5" />
      <g className="chapter-wait-body">
        <path d="M29 59h50l8 62H21z" fill="#171717" stroke={color} strokeOpacity=".28" />
        <path d="M49 62h10l5 56H44z" fill={color} fillOpacity=".08" />
        <path d="M27 69 14 91M81 69l13 22" fill="none" stroke="#252525" strokeWidth="7" strokeLinecap="round" />
        {accessory === 'book' && (
          <g className="chapter-wait-prop">
            <path d="M34 82c8-3 14-1 20 4v25c-6-5-12-7-20-4z" fill="#78350f" stroke={color} strokeOpacity=".65" />
            <path d="M74 82c-8-3-14-1-20 4v25c6-5 12-7 20-4z" fill="#78350f" stroke={color} strokeOpacity=".65" />
          </g>
        )}
        {accessory === 'scanner' && (
          <g className="chapter-wait-prop">
            <rect x="31" y="84" width="46" height="25" rx="5" fill={color} fillOpacity=".08" stroke={color} strokeOpacity=".45" />
            <path className="chapter-wait-scan" d="M37 91h34" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M38 98h22M38 103h29" stroke={color} strokeOpacity=".25" />
          </g>
        )}
        {accessory === 'tablet' && (
          <g className="chapter-wait-prop">
            <rect x="33" y="80" width="42" height="32" rx="5" fill="#080808" stroke={color} strokeOpacity=".55" />
            <circle className="chapter-wait-ping" cx="54" cy="96" r="8" fill="none" stroke={color} strokeOpacity=".65" />
            <circle cx="54" cy="96" r="2.5" fill={color} />
          </g>
        )}
      </g>
      <g className="chapter-wait-head">
        <path d="M54 14V7M48 7h12" stroke={color} strokeOpacity=".5" strokeLinecap="round" />
        <rect x="22" y="17" width="64" height="48" rx="11" fill="#242424" stroke={color} strokeOpacity=".55" />
        <rect x="31" y="27" width="46" height="28" rx="7" fill="#050505" />
        <g className="chapter-wait-eyes" fill={color}>
          <rect x="39" y="39" width="9" height="4" rx="2" />
          <rect x="60" y="39" width="9" height="4" rx="2" />
        </g>
      </g>
    </svg>
  </div>
);

const ChapterParsingScene = ({ currentBook }) => {
  const parsedPages = Math.max(0, Number(currentBook.parsedPages) || 0);
  const totalPages = Math.max(0, Number(currentBook.totalPages) || 0);
  const progress = totalPages > 0
    ? Math.min(100, Math.max(0, (parsedPages / totalPages) * 100))
    : null;

  return (
    <div className="chapter-wait-panel max-w-4xl mx-auto mb-8 rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/[0.07] via-white/[0.025] to-amber-500/[0.04] overflow-hidden">
      <style>{`
        @keyframes chapter-head-wait {
          0%, 16%, 72%, 100% { transform: translateY(0) rotate(0deg); }
          28% { transform: translateY(-4px) rotate(-3deg); }
          43% { transform: translateY(-2px) rotate(3deg); }
          57% { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes chapter-body-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes chapter-eye-blink {
          0%, 42%, 47%, 76%, 81%, 100% { transform: scaleY(1); opacity: 1; }
          44%, 45%, 78%, 79% { transform: scaleY(.12); opacity: .65; }
        }
        @keyframes chapter-prop-wait {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes chapter-scan-pass {
          0% { transform: translateY(0); opacity: .2; }
          50% { transform: translateY(12px); opacity: 1; }
          100% { transform: translateY(0); opacity: .2; }
        }
        @keyframes chapter-ping {
          0%, 100% { transform: scale(.45); opacity: .85; }
          70% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes chapter-progress-glow {
          0%, 100% { opacity: .65; }
          50% { opacity: 1; }
        }
        .chapter-wait-character { width: 82px; filter: drop-shadow(0 12px 18px rgba(0,0,0,.45)); }
        .chapter-wait-character svg { display: block; width: 100%; overflow: visible; }
        .chapter-wait-shadow { fill: #000; opacity: .52; animation: chapter-progress-glow 2.4s ease-in-out infinite; animation-delay: var(--wait-delay); }
        .chapter-wait-body { transform-box: fill-box; transform-origin: center bottom; animation: chapter-body-breathe 2.4s ease-in-out infinite; animation-delay: var(--wait-delay); }
        .chapter-wait-head { transform-box: fill-box; transform-origin: center bottom; animation: chapter-head-wait 3.2s ease-in-out infinite; animation-delay: var(--wait-delay); }
        .chapter-wait-eyes { transform-box: fill-box; transform-origin: center; animation: chapter-eye-blink 4.8s linear infinite; animation-delay: var(--wait-delay); }
        .chapter-wait-prop { transform-box: fill-box; transform-origin: center; animation: chapter-prop-wait 2.8s ease-in-out infinite; animation-delay: var(--wait-delay); }
        .chapter-wait-scan { animation: chapter-scan-pass 1.8s ease-in-out infinite; animation-delay: var(--wait-delay); }
        .chapter-wait-ping { transform-box: fill-box; transform-origin: center; animation: chapter-ping 1.8s ease-out infinite; animation-delay: var(--wait-delay); }
        @media (prefers-reduced-motion: reduce) {
          .chapter-wait-panel * { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
      <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center px-6 md:px-8 pt-7 pb-6">
        <div className="text-left">
          <div className="flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase font-bold text-teal-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Chapter map in progress
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">The reading crew is working ahead.</h3>
          <p className="mt-2 text-xs leading-6 text-white/45">We’re extracting text and looking for chapter headings. You can start with the live document below while parsing continues.</p>
        </div>
        <div className="flex items-end justify-center gap-1.5 px-3" aria-label="Three characters waiting while the PDF is parsed">
          <WaitingCharacter color="#fbbf24" delay={0} accessory="book" />
          <WaitingCharacter color="#2dd4bf" delay={0.35} accessory="scanner" />
          <WaitingCharacter color="#f472b6" delay={0.7} accessory="tablet" />
        </div>
      </div>
      <div className="border-t border-white/[0.06] bg-black/20 px-6 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4 mb-2 text-[9px] font-mono uppercase tracking-[0.12em]">
          <span className="text-white/40">Page {parsedPages.toLocaleString()} of {totalPages ? totalPages.toLocaleString() : '…'}</span>
          <span className="text-teal-400">{progress === null ? 'Scanning' : `${Math.round(progress)}%`}</span>
        </div>
        <div
          className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"
          role="progressbar"
          aria-label="PDF parsing progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress === null ? undefined : Math.round(progress)}
          aria-valuetext={progress === null ? 'Scanning document pages' : undefined}
        >
          {progress !== null && (
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-teal-400 to-pink-400 transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default function ChaptersScreen({ currentBook, chapterProgressMap, startChapter, navigateTo }) {
  if (!currentBook) return null;

  const chapters = currentBook.chapters || [];
  const isProcessing = currentBook.status === 'processing';
  const hasParsingError = currentBook.status === 'error';
  const isLegacyFallback = chapters.length === 1
    && String(chapters[0]?.id || '') === 'ch-0'
    && String(chapters[0]?.title || '').trim().toLowerCase() === 'start of document';
  const hasDetectedChapters = !isLegacyFallback
    && chapters.some((chapter) => !String(chapter?.id || '').endsWith('-live'));
  const readFullDocument = () => startChapter({
    id: `${currentBook.id}-full-document`,
    title: currentBook.title,
    startIndex: 0,
    wordCount: currentBook.words?.length || 0
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <button
          onClick={() => navigateTo('library')}
          className="mb-12 text-white/50 hover:text-white flex items-center gap-2 font-bold tracking-[0.2em] text-xs uppercase transition-all hover:translate-x-[-2px]"
        >
          <ChevronLeft size={16} /> BACK TO LIBRARY
        </button>

        <div className="mb-16 text-center pt-8">
          <h2 className="text-3xl font-bold tracking-[0.4em] text-white mb-4 uppercase">{currentBook.title}</h2>
          <div className="w-24 h-[1px] bg-amber-500 mx-auto mb-6" />
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
            {isProcessing ? 'Finding chapters' : hasDetectedChapters ? 'Select chapter' : 'Document ready'}
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[9px] tracking-[0.14em] uppercase text-white/45">
            <span className={`w-1.5 h-1.5 rounded-full ${currentBook.status === 'processing' ? 'bg-teal-400 animate-pulse' : 'bg-amber-500'}`} />
            {currentBook.status === 'processing'
              ? `${currentBook.parsedPages ? `Parsing page ${currentBook.parsedPages}${currentBook.totalPages ? ` of ${currentBook.totalPages}` : ''}` : 'Preparing document'} · ${(currentBook.words?.length || 0).toLocaleString()} words ready`
              : `${(currentBook.words?.length || 0).toLocaleString()} words · ${currentBook.totalPages || currentBook.parsedPages || '—'} pages ready`}
          </div>
        </div>

        {isProcessing && <ChapterParsingScene currentBook={currentBook} />}

        {hasParsingError ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-red-500/[0.06] p-7 md:p-10" role="alert">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-300">Parsing error</span>
            <h3 className="mt-3 text-xl font-bold text-white md:text-2xl">We couldn’t finish reading this PDF.</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">{currentBook.parsingError || 'The document could not be parsed. Try another PDF or import it again.'}</p>
          </div>
        ) : !isProcessing && !hasDetectedChapters ? (
          <div className="max-w-3xl mx-auto rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.025] to-transparent p-7 md:p-10">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
              <div className="w-12 h-12 shrink-0 rounded-2xl border border-amber-500/25 bg-amber-500/10 flex items-center justify-center">
                <FileWarning size={22} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-500/80">Chapter detection unavailable</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-3">We couldn’t detect chapter headings in this document.</h3>
                <p className="text-sm leading-7 text-white/50 mt-3 max-w-2xl">The document was imported successfully. This can happen with scanned files, image-based pages, or headings that are not encoded as recognizable text. You can still read the complete document from the beginning.</p>
                <button type="button" onClick={readFullDocument} disabled={!currentBook.words?.length} className="mt-7 inline-flex items-center gap-3 border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-xs font-bold tracking-[0.16em] uppercase text-amber-500 hover:bg-amber-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <BookOpen size={16} /> Read full document <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
        <div className="space-y-4">
          {chapters.map((ch, idx) => {
            const chapterProgress = chapterProgressMap[ch.id] || 0;
            const isCompleted = chapterProgress >= 100;

            return (
              <div
                key={ch.id}
                className={`group bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 p-6 hover:bg-white/10 ${
                  isCompleted ? 'border-white/5 opacity-75' : 'border-white/10 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-6 mb-4">
                  <button
                    type="button"
                    onClick={() => startChapter(ch)}
                    className="flex-1 cursor-pointer flex items-center gap-6 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] rounded-xl"
                    aria-label={`Open ${ch.title}`}
                  >
                    <span className="text-white/30 font-black text-xl tracking-[0.1em] uppercase transition-colors group-hover:text-amber-500/50 flex-shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span
                      className="font-bold text-lg group-hover:text-amber-400 transition-colors truncate max-w-md text-white tracking-[0.05em] uppercase"
                      title={ch.title}
                    >
                      {ch.title}
                    </span>
                    {isCompleted && <span className="text-amber-500/60 text-xs font-bold flex-shrink-0 ml-2" aria-label="Completed">✓</span>}
                  </button>
                </div>

                <div className="flex items-center gap-3 pl-8">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-out ${
                        isCompleted ? 'bg-amber-500/30' : chapterProgress > 0 ? 'bg-amber-500/60' : 'bg-transparent'
                      }`}
                      style={{ width: `${Math.max(chapterProgress, 0)}%` }}
                    />
                  </div>
                  {chapterProgress > 0 && (
                    <span className="text-[10px] text-white/30 font-mono tabular-nums flex-shrink-0 min-w-[2.5rem] text-right tracking-wider">
                      {Math.round(chapterProgress)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
