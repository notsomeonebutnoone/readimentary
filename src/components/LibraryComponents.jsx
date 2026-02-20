import React from 'react';
import { Trophy, Clock, Hash, Book, Trash2, Upload, Loader2 } from 'lucide-react';

// 1. THE STATS SIDEBAR
export const LibraryStats = ({ totalWords, isImporting, onUploadClick }) => (
  <aside className="w-full md:w-[380px] space-y-8">
    <div className="grid grid-cols-1 gap-4">
      <StatCard 
        icon={<Trophy className="text-amber-500" />} 
        label="Reading Streak" 
        value="12 Days" 
        sub="Top 5% of readers" 
      />
      <StatCard 
        icon={<Clock className="text-cyan-500" />} 
        label="Time Invested" 
        value="24.5 Hours" 
        sub="Across all volumes" 
      />
      <StatCard 
        icon={<Hash className="text-emerald-500" />} 
        label="Total Words" 
        value={totalWords.toLocaleString()} 
        sub="Processed through engine" 
      />
    </div>

    <button 
      onClick={onUploadClick}
      className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
    >
      {isImporting ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
      IMPORT NEW PDF
    </button>
  </aside>
);

// 2. THE BOOK GRID
export const BookGrid = ({ library, onBookClick, onDeleteClick }) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
    {library.map((book) => (
      <div 
        key={book.id}
        onClick={() => onBookClick(book)}
        className="group bg-[#111] border border-neutral-900/50 p-6 rounded-3xl cursor-pointer hover:bg-[#161616] hover:border-amber-500/30 transition-all flex justify-between items-center"
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Book size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg group-hover:text-amber-400 transition-colors line-clamp-1">{book.title}</h3>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{book.words.length.toLocaleString()} Words</p>
          </div>
        </div>
        <button 
          onClick={(e) => onDeleteClick(e, book.id)}
          className="p-2 text-neutral-700 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ))}
  </div>
);

// Helper StatCard Component
const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-[#111] border border-neutral-900/50 p-6 rounded-[2rem] space-y-3">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-black rounded-lg">{icon}</div>
      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{label}</span>
    </div>
    <div>
      <div className="text-2xl font-black italic">{value}</div>
      <div className="text-[10px] text-neutral-600 font-bold uppercase">{sub}</div>
    </div>
  </div>
);


const floatKeyframes = `
    @keyframes float-book {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes scan-eyes {
      0%, 100% { width: 40px; transform: translateX(0); }
      50% { width: 40px; transform: translateX(4px); }
      90% { width: 0px; } /* Blink */
    }
  `;