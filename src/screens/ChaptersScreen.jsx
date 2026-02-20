import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function ChaptersScreen({ currentBook, chapterProgressMap, startChapter, navigateTo }) {
  if (!currentBook) return null;

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
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Select Chapter</p>
        </div>

        <div className="space-y-4">
          {currentBook.chapters.map((ch, idx) => {
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
                  <div onClick={() => startChapter(ch)} className="flex-1 cursor-pointer flex items-center gap-6 min-w-0">
                    <span className="text-white/30 font-black text-xl tracking-[0.1em] uppercase transition-colors group-hover:text-amber-500/50 flex-shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span
                      className="font-bold text-lg group-hover:text-amber-400 transition-colors truncate max-w-md text-white tracking-[0.05em] uppercase"
                      title={ch.title}
                    >
                      {ch.title}
                    </span>
                    {isCompleted && <span className="text-amber-500/60 text-xs font-bold flex-shrink-0 ml-2">✓</span>}
                  </div>
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
      </div>
    </div>
  );
}
