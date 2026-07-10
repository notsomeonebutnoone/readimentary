import React from 'react';
import { Upload, Loader2, Book, Trash2, ArrowRight, LayoutDashboard } from 'lucide-react';
import ReadimentaryButton from '../components/app/ReadimentaryButton';

export default function LibraryScreen({
  isTransitioning,
  isImporting,
  fileInputRef,
  onUploadClick,
  onDashboardClick,
  onHomeClick,
  onFileUpload,
  library,
  onBookClick,
  onDeleteBook
}) {
  return (
    <div className={`min-h-screen bg-[#050505] transition-opacity duration-400 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2 group cursor-pointer flex-1">
            <div className="w-6 h-6 border border-amber-500/50 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
              <div className="w-2 h-2 bg-amber-500" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase hidden sm:block text-white">READIMENTARY</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative inline-block group">
              <button
                onClick={onUploadClick}
                disabled={isImporting}
                className="relative z-10 flex items-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-8 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
              >
                {isImporting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                IMPORT
              </button>
              <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
            </div>

            <div className="relative inline-block group">
              <button
                onClick={onDashboardClick}
                className="relative z-10 flex items-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-8 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
                title="Open dashboard"
              >
                <LayoutDashboard size={16} />
                DASHBOARD
              </button>
              <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
            </div>

            <div className="relative inline-block group">
              <button
                onClick={onHomeClick}
                className="relative z-10 flex items-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-8 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
                title="Return to home"
              >
                HOME
              </button>
              <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={onFileUpload} />
        </header>

        <div className="mb-16 text-center pt-8">
          <h2 className="text-3xl font-bold tracking-[0.4em] text-white mb-4 uppercase">Library</h2>
          <div className="w-24 h-[1px] bg-amber-500 mx-auto mb-6" />
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Your Document Collection</p>
        </div>

        <div className="space-y-4">
          {library.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500/50 mb-6 border border-amber-500/20">
                <Book size={40} />
              </div>
              <h3 className="text-xl font-bold text-white/60 mb-2 tracking-[0.2em] uppercase">No Documents</h3>
              <p className="text-sm text-white/40 mb-8 tracking-[0.2em] uppercase">Upload your first PDF to begin</p>
              <ReadimentaryButton onClick={onUploadClick}>
                <Upload size={18} /> UPLOAD PDF <ArrowRight size={18} />
              </ReadimentaryButton>
            </div>
          ) : (
            library.map((book) => (
              <div
                key={book.id}
                onClick={() => onBookClick(book)}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 p-8 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center hover:bg-white/10"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 transition-all group-hover:bg-amber-500/20 group-hover:scale-105 border border-amber-500/20">
                    <Book size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-amber-400 transition-colors tracking-[0.1em] uppercase text-white">{book.title}</h3>
                    <p className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase mt-2">
                      {(book.words?.length || 0).toLocaleString()} words
                      {book.status === 'processing' && ` · parsing ${book.parsedPages || 0}/${book.totalPages || '…'} pages`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => onDeleteBook(e, book.id)}
                  className="p-3 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
