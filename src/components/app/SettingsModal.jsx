import React from 'react';
import { X } from 'lucide-react';

export default function SettingsModal({
  showSettings,
  setShowSettings,
  fonts,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  showORP,
  setShowORP
}) {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setShowSettings(false)}>
      <div className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold tracking-[0.2em] text-amber-500 uppercase">ENGINE SETUP</h3>
          <button onClick={() => setShowSettings(false)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase mb-4 block">Typography</label>
            <div className="grid grid-cols-1 gap-3">
              {fonts.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFontFamily(f.value)}
                  style={{ fontFamily: f.value }}
                  className={`p-4 rounded-2xl border text-sm text-left transition-all ${
                    fontFamily === f.value
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase mb-4 block">Glyph Size</label>
            <input type="range" min="32" max="120" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-amber-500" />
            <div className="text-right mt-2 text-xs text-white/40 font-mono">{fontSize}px</div>
          </div>
          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-sm font-bold text-white tracking-[0.05em] uppercase">Focus Highlight</span>
            <button
              onClick={() => setShowORP(!showORP)}
              className={`w-14 h-7 rounded-full transition-all relative ${showORP ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${showORP ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
