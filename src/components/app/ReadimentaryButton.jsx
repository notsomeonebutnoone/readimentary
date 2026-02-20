import React from 'react';

export default function ReadimentaryButton({ children, onClick, color = 'amber', className = '' }) {
  const colorStyles = {
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    teal: 'bg-teal-500/10 border-teal-500/30 text-teal-500',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-500'
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      <button
        onClick={onClick}
        className={`relative z-10 flex items-center gap-4 backdrop-blur-xl border ${colorStyles[color]} px-10 py-5 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase`}
      >
        {children}
      </button>
      <div
        className={`absolute inset-0 border ${colorStyles[color].split(' ')[1].replace('/30', '/10')} translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2`}
      />
    </div>
  );
}
