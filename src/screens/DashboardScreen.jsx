import React from 'react';
import { ChevronLeft, BookCheck, Clock3, Gauge, Flame } from 'lucide-react';

export default function DashboardScreen({ navigateTo, dashboardStats, readingStats, library }) {
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
          <h2 className="text-3xl font-bold tracking-[0.4em] text-white mb-4 uppercase">Dashboard</h2>
          <div className="w-24 h-[1px] bg-amber-500 mx-auto mb-6" />
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Reading Analytics &amp; Progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
              <BookCheck size={14} className="text-amber-500" /> Books Read
            </div>
            <div className="text-3xl font-black text-white">{dashboardStats.booksRead}</div>
            <p className="text-xs text-white/45 mt-2">{dashboardStats.completedBooks} completed</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
              <Clock3 size={14} className="text-amber-500" /> Reading Hours
            </div>
            <div className="text-3xl font-black text-white">{dashboardStats.totalHours.toFixed(1)}</div>
            <p className="text-xs text-white/45 mt-2">{dashboardStats.totalSessions} reading sessions</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
              <Gauge size={14} className="text-amber-500" /> Avg WPM
            </div>
            <div className="text-3xl font-black text-white">{Math.round(dashboardStats.averageWpm || 0)}</div>
            <p className="text-xs text-white/45 mt-2">calculated from active playback</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
              <Flame size={14} className="text-amber-500" /> Today
            </div>
            <div className="text-3xl font-black text-white">
              {Math.round((readingStats.dailyMs?.[new Date().toISOString().slice(0, 10)] || 0) / 60000)}m
            </div>
            <p className="text-xs text-white/45 mt-2">active reading time</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white/80">Reading Heat Map</h3>
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">Last 8 Weeks</span>
          </div>
          <div className="grid grid-cols-7 md:grid-cols-14 gap-1.5">
            {dashboardStats.heatmapDays.map((day) => {
              let bg = 'bg-white/5';
              if (day.minutes >= 60) bg = 'bg-amber-500';
              else if (day.minutes >= 30) bg = 'bg-amber-500/70';
              else if (day.minutes >= 15) bg = 'bg-amber-500/45';
              else if (day.minutes > 0) bg = 'bg-amber-500/25';
              return <div key={day.key} title={`${day.key}: ${day.minutes} min`} className={`h-6 rounded-[4px] border border-white/5 ${bg}`} />;
            })}
          </div>
          <div className="flex items-center gap-3 mt-4 text-[10px] tracking-[0.2em] uppercase text-white/35">
            <span>Less</span>
            <span className="w-4 h-2 bg-white/5 rounded-sm" />
            <span className="w-4 h-2 bg-amber-500/25 rounded-sm" />
            <span className="w-4 h-2 bg-amber-500/45 rounded-sm" />
            <span className="w-4 h-2 bg-amber-500/70 rounded-sm" />
            <span className="w-4 h-2 bg-amber-500 rounded-sm" />
            <span>More</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white/80 mb-4">Per Book Progress</h3>
          <div className="space-y-3">
            {library.length === 0 && <p className="text-sm text-white/45">No books yet. Import a PDF to start tracking.</p>}
            {library.map((book) => {
              const totalWords = book.words?.length || 0;
              const readWords = Math.max(0, Math.min(totalWords, book.currentIndex || 0));
              const pct = totalWords > 0 ? (readWords / totalWords) * 100 : 0;
              return (
                <div key={book.id} className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white/85 tracking-[0.05em] uppercase truncate pr-4">{book.title}</span>
                    <span className="text-xs text-white/45">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
