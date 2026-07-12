import React, { useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, BookCheck, ChevronLeft, Clock3, Flame, Gauge, Target } from 'lucide-react';

const BASE_WPM = 200;
const WORDS_PER_PAGE = 250;
const STANDARD_BOOK_WORDS = 50000;

const formatDuration = (minutes) => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  if (hours === 0) return `${remainder} min`;
  return `${hours} hr${hours === 1 ? '' : 's'} ${remainder} min`;
};

const StatCard = ({ icon: Icon, label, value, detail, progress }) => (
  <article className="group rounded-2xl border border-white/10 bg-[#121212] p-5 transition-all hover:-translate-y-0.5 hover:border-amber-400/30">
    <div className="mb-4 flex items-center justify-between">
      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        {React.createElement(Icon, { size: 14, className: 'text-[#FFB800]' })} {label}
      </span>
      <ArrowUpRight size={14} className="text-white/15 transition-colors group-hover:text-amber-400/70" />
    </div>
    <div className="text-2xl font-black tracking-tight text-white md:text-3xl">{value}</div>
    <p className="mt-2 min-h-4 text-xs text-white/45">{detail}</p>
    {Number.isFinite(progress) && (
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-[#FFB800] transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    )}
  </article>
);

const ActivityGraph = ({ days, selected, onSelect }) => {
  const recent = days.slice(-14);
  const max = Math.max(1, ...recent.map((day) => day.minutes));
  const points = recent.map((day, index) => `${(index / Math.max(1, recent.length - 1)) * 100},${44 - (day.minutes / max) * 37}`).join(' ');
  return <div className="relative h-52 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-5">
    <div className="mb-3 flex items-center justify-between"><div><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-teal-400"><Activity size={13}/> Daily reading</span><b className="mt-1 block text-lg">Last 14 days</b></div><span className="text-[9px] text-white/30">minutes</span></div>
    <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="h-28 w-full overflow-visible">
      {[8,20,32,44].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="white" strokeOpacity=".07" strokeWidth=".35" />)}
      <polyline points={points} fill="none" stroke="#2dd4bf" strokeWidth="1.4" vectorEffect="non-scaling-stroke" pathLength="1" className="dashboard-line" />
      {recent.map((day, index) => <circle key={day.key} onClick={() => onSelect(day)} className="cursor-pointer transition-all hover:r-[2.6px]" cx={(index / Math.max(1, recent.length - 1)) * 100} cy={44 - (day.minutes / max) * 37} r={selected?.key === day.key ? 2.5 : 1.5} fill={selected?.key === day.key ? '#FFB800' : '#2dd4bf'} vectorEffect="non-scaling-stroke" />)}
    </svg>
    <div className="absolute bottom-3 left-5 right-5 flex justify-between text-[8px] uppercase text-white/25"><span>{recent[0] ? new Date(`${recent[0].key}T00:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'}) : ''}</span><span>Today</span></div>
  </div>;
};

export default function DashboardScreen({ navigateTo, dashboardStats, readingStats, library }) {
  const [targetWpm, setTargetWpm] = useState(() => Number(localStorage.getItem('readimentary-target-wpm')) || 400);
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('readimentary-daily-goal')) || 20);
  const [finishPace, setFinishPace] = useState('target');
  const [selectedDay, setSelectedDay] = useState(null);

  const setTarget = (value) => {
    const next = Math.max(100, Math.min(1000, Number(value) || 100));
    setTargetWpm(next);
    localStorage.setItem('readimentary-target-wpm', String(next));
  };

  const setGoal = (value) => {
    const next = Math.max(5, Math.min(180, Number(value) || 5));
    setDailyGoal(next);
    localStorage.setItem('readimentary-daily-goal', String(next));
  };

  const metrics = useMemo(() => {
    const currentWpm = Math.round(dashboardStats.averageWpm || 0);
    const projectionWpm = targetWpm;
    const standardBookMinutes = STANDARD_BOOK_WORDS / projectionWpm;
    const booksPerMonth = (projectionWpm * dailyGoal * 30) / STANDARD_BOOK_WORDS;
    const pagesPerHour = (projectionWpm * 60) / WORDS_PER_PAGE;
    const comparisonWpm = currentWpm || BASE_WPM;
    const savedPerBook = Math.max(0, (STANDARD_BOOK_WORDS / comparisonWpm) - standardBookMinutes);
    const totalTimeSavedMinutes = Math.max(0, (readingStats.totalWordsAdvanced || 0) / BASE_WPM - (readingStats.totalReadingMs || 0) / 60000);
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayMinutes = Math.round((readingStats.dailyMs?.[todayKey] || 0) / 60000);

    let streak = 0;
    for (let offset = 0; offset < 365; offset += 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      if ((readingStats.dailyMs?.[key] || 0) <= 0) break;
      streak += 1;
    }

    const completed = dashboardStats.completedBooks;
    const inProgress = library.filter((book) => {
      const count = book.words?.length || 0;
      return count > 0 && (book.currentIndex || 0) > 0 && (book.currentIndex || 0) < count - 1;
    }).length;

    return { currentWpm, standardBookMinutes, booksPerMonth, pagesPerHour, savedPerBook, totalTimeSavedMinutes, todayMinutes, streak, completed, inProgress };
  }, [dashboardStats, dailyGoal, library, readingStats, targetWpm]);

  const presets = [
    { value: 300, label: 'Focused' },
    { value: 400, label: 'Speed Reader' },
    { value: 600, label: 'Master' }
  ];

  const heatmap = useMemo(() => {
    const days = dashboardStats.heatmapDays || [];
    const first = days[0] ? new Date(`${days[0].key}T00:00:00`) : new Date();
    const leading = first.getDay();
    const cells = [...Array(leading).fill(null), ...days];
    while (cells.length % 7) cells.push(null);
    const weeks = Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
    const months = weeks.map((week, index) => {
      const day = week.find(Boolean);
      if (!day) return '';
      const label = new Date(`${day.key}T00:00:00`).toLocaleDateString(undefined, { month: 'short' });
      return index === 0 || label !== new Date(`${weeks[index - 1].find(Boolean)?.key || day.key}T00:00:00`).toLocaleDateString(undefined, { month: 'short' }) ? label : '';
    });
    return { weeks, months };
  }, [dashboardStats.heatmapDays]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
        <button onClick={() => navigateTo('library')} className="mb-10 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50 transition-all hover:-translate-x-0.5 hover:text-white">
          <ChevronLeft size={16} /> Back to library
        </button>

        <header className="mb-12 text-center">
          <h1 className="text-3xl font-black uppercase tracking-[0.35em] sm:text-4xl">Dashboard</h1>
          <div className="mx-auto my-5 h-px w-24 bg-[#FFB800]" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Goals, velocity and reading outcomes</p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Gauge} label="Target vs actual" value={`${metrics.currentWpm || '—'} / ${targetWpm}`} detail={metrics.currentWpm ? `${Math.round((metrics.currentWpm / targetWpm) * 100)}% of target velocity` : 'Start a reading session to establish your average'} progress={metrics.currentWpm ? (metrics.currentWpm / targetWpm) * 100 : 0} />
          <StatCard icon={Clock3} label="Total time saved" value={formatDuration(metrics.totalTimeSavedMinutes)} detail={`Compared with a ${BASE_WPM} WPM reading baseline`} />
          <StatCard icon={BookCheck} label="Books & completion" value={`${metrics.completed} done`} detail={`${metrics.inProgress} in progress · ${library.length} in library`} />
          <StatCard icon={Flame} label="Streak / today's goal" value={`${metrics.todayMinutes}m / ${dailyGoal}m`} detail={`${metrics.streak} day active streak`} progress={(metrics.todayMinutes / dailyGoal) * 100} />
        </section>

        <section className="dashboard-pop mb-6 grid gap-4 lg:grid-cols-[1.45fr_.75fr]">
          <ActivityGraph days={dashboardStats.heatmapDays || []} selected={selectedDay} onSelect={setSelectedDay} />
          <button onClick={() => setSelectedDay(null)} className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.09] to-[#101010] p-5 text-left transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300"><BarChart3 size={13} className="mr-2 inline"/>Selected day</span><span className="h-2 w-2 animate-pulse rounded-full bg-amber-400"/></div>
            <strong className="mt-7 block text-4xl font-black text-white">{selectedDay ? `${selectedDay.minutes}m` : `${metrics.todayMinutes}m`}</strong>
            <span className="mt-2 block text-xs text-white/45">{selectedDay ? new Date(`${selectedDay.key}T00:00:00`).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}) : 'Today'} · {selectedDay?.averageWpm ? `${Math.round(selectedDay.averageWpm)} average WPM` : 'click a graph point or heat cell'}</span>
            <div className="mt-7 flex h-10 items-end gap-1">{[.35,.62,.46,.85,.58,1,.72,.9].map((height,index)=><i key={index} className="dashboard-bar flex-1 rounded-t-sm bg-amber-400/70" style={{height:`${height*100}%`,animationDelay:`${index*55}ms`}}/>)}</div>
          </button>
        </section>

        <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
          <div className="grid lg:grid-cols-[1.05fr_1.4fr]">
            <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400"><Target size={14} /> Target &amp; goal projection</p>
                  <h2 className="text-xl font-black">Turn speed into a finish line.</h2>
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-2 text-right">
                  <span className="block text-2xl font-black text-[#FFB800]">{targetWpm}</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Target WPM</span>
                </div>
              </div>

              <input aria-label="Target words per minute" type="range" min="100" max="1000" step="10" value={targetWpm} onChange={(event) => setTarget(event.target.value)} className="wpm-slider mb-5 w-full" />
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset) => (
                  <button key={preset.value} onClick={() => setTarget(preset.value)} className={`rounded-xl border px-2 py-3 text-center transition-colors ${targetWpm === preset.value ? 'border-amber-400/50 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-white/[0.02] text-white/45 hover:border-white/20 hover:text-white'}`}>
                    <span className="block text-sm font-black">{preset.value}</span>
                    <span className="mt-1 block text-[8px] uppercase tracking-[0.12em]">{preset.label}</span>
                  </button>
                ))}
              </div>
              <label className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/50">
                Daily reading goal
                <span className="flex items-center gap-2"><input type="number" min="5" max="180" value={dailyGoal} onChange={(event) => setGoal(event.target.value)} className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right font-bold text-white outline-none focus:border-amber-400/50" /> min</span>
              </label>
            </div>

            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              <div className="bg-[#121212] p-6"><span className="text-[9px] uppercase tracking-[0.2em] text-white/35">50,000-word book</span><strong className="mt-3 block text-3xl font-black">{formatDuration(metrics.standardBookMinutes)}</strong><p className="mt-2 text-xs text-white/40">Approximately 200 standard pages</p></div>
              <div className="bg-[#121212] p-6"><span className="text-[9px] uppercase tracking-[0.2em] text-white/35">Monthly pace</span><strong className="mt-3 block text-3xl font-black">{metrics.booksPerMonth.toFixed(1)} books</strong><p className="mt-2 text-xs text-white/40">At {dailyGoal} minutes every day</p></div>
              <div className="bg-[#121212] p-6"><span className="text-[9px] uppercase tracking-[0.2em] text-white/35">Page throughput</span><strong className="mt-3 block text-3xl font-black">{Math.round(metrics.pagesPerHour)} pages/hr</strong><p className="mt-2 text-xs text-white/40">Using {WORDS_PER_PAGE} words per standard page</p></div>
              <div className="bg-gradient-to-br from-amber-400/[0.09] to-[#121212] p-6"><span className="text-[9px] uppercase tracking-[0.2em] text-amber-300/70">Target advantage</span><strong className="mt-3 block text-3xl font-black text-[#FFB800]">{formatDuration(metrics.savedPerBook)}</strong><p className="mt-2 text-xs leading-relaxed text-white/45">saved per book versus your {metrics.currentWpm ? `${metrics.currentWpm} WPM average` : `${BASE_WPM} WPM baseline`}</p></div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Reading contributions</h2><p className="mt-2 text-xs text-white/35">Daily reading minutes, arranged by calendar week.</p></div><span className="text-[9px] uppercase tracking-[0.2em] text-white/35">Last 8 weeks</span></div>
          <div className="overflow-x-auto pb-2"><div className="min-w-[620px]">
            <div className="mb-2 grid gap-1.5 pl-10" style={{gridTemplateColumns:`repeat(${heatmap.weeks.length}, minmax(14px,1fr))`}}>{heatmap.months.map((month,index)=><span key={index} className="text-[9px] text-white/35">{month}</span>)}</div>
            <div className="flex gap-2"><div className="grid w-8 grid-rows-7 gap-1.5 text-right text-[8px] text-white/30">{['Sun','','Tue','','Thu','','Sat'].map((day,index)=><span key={index} className="leading-[18px]">{day}</span>)}</div><div className="grid flex-1 grid-flow-col grid-rows-7 gap-1.5">
            {heatmap.weeks.flat().map((day, cellIndex) => {
              if (!day) return <span key={`empty-${cellIndex}`} className="h-[18px]"/>;
              const intensity = day.minutes >= 60 ? 'bg-[#FFB800]' : day.minutes >= 30 ? 'bg-amber-500/70' : day.minutes >= 15 ? 'bg-amber-500/45' : day.minutes > 0 ? 'bg-amber-500/25' : 'bg-white/5';
              const dateLabel = new Date(`${day.key}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              return <button onClick={() => setSelectedDay(day)} key={day.key} className="group relative h-[18px] !p-0 !bg-transparent"><span className={`heat-cell block h-[18px] rounded-[3px] border outline-none ring-amber-400/70 transition-transform hover:scale-125 ${selectedDay?.key === day.key ? 'border-white/70 ring-1' : 'border-white/5'} ${intensity}`} style={{animationDelay:`${cellIndex*8}ms`}}/><span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max -translate-x-1/2 rounded-lg border border-white/10 bg-[#1E1E1E] px-3 py-2 text-[10px] text-white/70 shadow-2xl group-hover:block group-focus-within:block"><strong className="block text-white">{dateLabel}</strong>{day.minutes} mins read · {day.averageWpm ? `${Math.round(day.averageWpm)} avg WPM` : 'No WPM recorded'}</span></button>;
            })}
          </div></div></div></div>
          <div className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-white/35"><span>Less</span>{['bg-white/5', 'bg-amber-500/25', 'bg-amber-500/45', 'bg-amber-500/70', 'bg-[#FFB800]'].map((color) => <span key={color} className={`h-2 w-5 rounded-sm ${color}`} />)}<span>More</span></div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#121212] p-5 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Per book progress</h2><p className="mt-2 text-xs text-white/35">Remaining time updates with your selected pace.</p></div>
            <div className="flex rounded-lg border border-white/10 bg-black/20 p-1 text-[9px] font-bold uppercase tracking-[0.12em]">{['target', 'current'].map((pace) => <button key={pace} onClick={() => setFinishPace(pace)} className={`rounded-md px-3 py-2 transition-colors ${finishPace === pace ? 'bg-amber-400 text-black' : 'text-white/40 hover:text-white'}`}>{pace} WPM</button>)}</div>
          </div>
          <div className="space-y-3">
            {library.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">Import a PDF to begin measuring completion.</p>}
            {library.map((book) => {
              const totalWords = book.words?.length || 0;
              const readWords = Math.max(0, Math.min(totalWords, book.currentIndex || 0));
              const remainingWords = Math.max(0, totalWords - readWords);
              const percentage = totalWords > 0 ? (readWords / totalWords) * 100 : 0;
              const pace = finishPace === 'target' ? targetWpm : (metrics.currentWpm || targetWpm);
              return <article key={book.id} className="rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-white/20"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="min-w-0"><h3 className="truncate text-sm font-bold uppercase tracking-[0.05em] text-white/85">{book.title}</h3><p className="mt-1 text-[10px] text-white/40">{remainingWords.toLocaleString()} words · {Math.ceil(remainingWords / WORDS_PER_PAGE).toLocaleString()} pages remaining</p></div><div className="flex items-end gap-5 sm:text-right"><div><span className="block text-[9px] uppercase tracking-[0.15em] text-white/30">Time to finish</span><strong className="text-sm text-amber-300">{formatDuration(remainingWords / pace)}</strong></div><strong className="text-xl font-black">{Math.round(percentage)}%</strong></div></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-[#FFB800] transition-[width] duration-500" style={{ width: `${percentage}%` }} /></div></article>;
            })}
          </div>
        </section>
      </div>
      <style>{`@keyframes dashboardDraw{from{stroke-dasharray:1;stroke-dashoffset:1}to{stroke-dasharray:1;stroke-dashoffset:0}} @keyframes dashboardPop{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}} @keyframes heatPop{from{opacity:0;transform:scale(.25)}to{opacity:1;transform:scale(1)}} @keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}} .dashboard-line{animation:dashboardDraw 1.5s cubic-bezier(.16,1,.3,1) both}.dashboard-pop{animation:dashboardPop .7s cubic-bezier(.16,1,.3,1) both}.heat-cell{animation:heatPop .45s cubic-bezier(.16,1,.3,1) both}.dashboard-bar{transform-origin:bottom;animation:barGrow .7s cubic-bezier(.16,1,.3,1) both}@media(prefers-reduced-motion:reduce){.dashboard-line,.dashboard-pop,.heat-cell,.dashboard-bar{animation:none}}`}</style>
    </div>
  );
}
