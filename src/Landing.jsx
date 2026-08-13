import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BookOpen, ArrowRight, Check, Zap, Shield, HelpCircle, User, X, Lock, Globe, Cpu, Menu, Play, Pause, RotateCcw, Gauge, Layers3, ScanLine, Database, Activity, FileText, Eye } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';

const TechnicalGrid = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.13] pointer-events-none" viewBox="0 0 900 520" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id="feature-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#f59e0b" strokeWidth="0.35" /></pattern>
      <pattern id="feature-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="#fff" /></pattern>
      <linearGradient id="grid-fade" x1="0" x2="1"><stop stopColor="white" stopOpacity="0"/><stop offset=".5" stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
      <mask id="grid-mask"><rect width="900" height="520" fill="url(#grid-fade)" /></mask>
    </defs>
    <rect width="900" height="520" fill="url(#feature-grid)" mask="url(#grid-mask)" />
    <rect x="580" y="40" width="260" height="180" fill="url(#feature-dots)" opacity=".45" />
    <g fill="none" stroke="#2dd4bf" strokeWidth="1">
      <path d="M45 95h95m-47-47v94M760 355h95m-47-47v94" opacity=".45" />
      <rect x="62" y="360" width="145" height="92" rx="8" strokeDasharray="5 8" opacity=".35" />
      <path d="M207 406h72l34-34h70" opacity=".3" />
    </g>
  </svg>
);

const SignalChart = ({ value = 70 }) => {
  const points = [84, 69, 75, 48, 57, 34, Math.max(14, 72 - value / 2)];
  const path = points.map((y, index) => `${index ? 'L' : 'M'} ${index * 27 + 4} ${y}`).join(' ');
  return (
    <svg viewBox="0 0 172 96" className="w-full h-20" aria-hidden="true">
      <defs><linearGradient id={`signal-fill-${value}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f59e0b" stopOpacity=".24"/><stop offset="1" stopColor="#f59e0b" stopOpacity="0"/></linearGradient></defs>
      <g stroke="white" strokeOpacity=".08" strokeWidth=".6"><path d="M0 24h172M0 48h172M0 72h172"/><path d="M43 0v96M86 0v96M129 0v96"/></g>
      <path d={`${path} L166 96 L4 96 Z`} fill={`url(#signal-fill-${value})`} />
      <path className="chart-line" d={path} fill="none" stroke="#f59e0b" strokeWidth="1.5" pathLength="1" />
      {points.map((y, index) => <circle key={index} cx={index * 27 + 4} cy={y} r="2.2" fill={index === points.length - 1 ? '#2dd4bf' : '#f59e0b'} />)}
    </svg>
  );
};

const KineticDataOrb = () => {
  const marks = useMemo(() => Array.from({ length: 132 }, (_, index) => {
    const vertical = 1 - (2 * (index + 0.5)) / 132;
    const radius = Math.sqrt(1 - vertical * vertical);
    const angle = index * 2.399963;
    const x = Math.cos(angle) * radius;
    const depth = Math.sin(angle) * radius;
    return {
      x: 240 + x * 184,
      y: 240 + vertical * 184,
      depth,
      height: 3 + (index % 5) * 2.2,
      glyph: index % 11 === 0
    };
  }), []);

  return (
    <div className="kinetic-orb" aria-hidden="true">
      <svg viewBox="0 0 480 480" className="w-full h-full">
        <defs>
          <radialGradient id="orb-core"><stop offset="0" stopColor="#f59e0b" stopOpacity=".12"/><stop offset=".58" stopColor="#2dd4bf" stopOpacity=".035"/><stop offset="1" stopColor="#050505" stopOpacity="0"/></radialGradient>
          <clipPath id="orb-clip"><circle cx="240" cy="240" r="190"/></clipPath>
        </defs>
        <circle cx="240" cy="240" r="208" fill="url(#orb-core)"/>
        <g className="kinetic-orb-grid" fill="none" stroke="white">
          <ellipse cx="240" cy="240" rx="188" ry="64" strokeOpacity=".06"/>
          <ellipse cx="240" cy="240" rx="188" ry="122" strokeOpacity=".045"/>
          <ellipse cx="240" cy="240" rx="72" ry="188" strokeOpacity=".055"/>
          <ellipse cx="240" cy="240" rx="132" ry="188" strokeOpacity=".035"/>
        </g>
        <g clipPath="url(#orb-clip)" className="kinetic-orb-marks">
          {marks.map((mark, index) => mark.glyph ? (
            <text key={index} x={mark.x} y={mark.y} fill={mark.depth > 0 ? '#f59e0b' : '#ffffff'} fillOpacity={0.12 + ((mark.depth + 1) / 2) * 0.36} fontSize="7" fontFamily="monospace">{index % 22 === 0 ? 'T' : '⌁'}</text>
          ) : (
            <rect key={index} x={mark.x} y={mark.y} width={index % 4 === 0 ? 3 : 1.4} height={mark.height} rx=".7" fill={mark.depth > .15 ? '#2dd4bf' : '#ffffff'} fillOpacity={0.08 + ((mark.depth + 1) / 2) * 0.42}/>
          ))}
        </g>
        <circle cx="240" cy="240" r="190" fill="none" stroke="#f59e0b" strokeOpacity=".16" strokeDasharray="2 11"/>
        <path className="kinetic-orb-scan" d="M46 240h388" stroke="#2dd4bf" strokeOpacity=".35" strokeWidth="1"/>
        <g fill="#f59e0b"><circle cx="84" cy="126" r="2"/><circle cx="396" cy="318" r="2"/><circle cx="318" cy="68" r="1.6"/></g>
      </svg>
    </div>
  );
};

const CharacterRail = ({ mousePos, activeSectionId }) => {
  const eyeX = (mousePos.x - .5) * 8;
  const eyeY = (mousePos.y - .5) * 5;
  const colors = ['#fbbf24', '#2dd4bf', '#f472b6'];
  return <aside className={`character-rail ${activeSectionId === 'hero' ? '' : 'is-following'}`} aria-hidden="true">
    {colors.map((color, index) => <div key={color} className={`rail-character rail-character-${index}`} style={{'--rail-color':color,'--rail-delay':`${index * 120}ms`}}>
      <svg viewBox="0 0 92 116">
        <ellipse cx="46" cy="108" rx="27" ry="4" fill="#000" opacity=".55"/>
        <path d="M25 50h42l8 54H17z" fill="#171717" stroke={color} strokeOpacity=".28"/>
        <rect x="20" y="15" width="52" height="42" rx="8" fill="#242424" stroke={color} strokeOpacity=".5"/>
        <rect x="28" y="24" width="36" height="24" rx="5" fill="#050505"/>
        <g style={{transform:`translate(${eyeX}px,${eyeY}px)`,transformOrigin:'46px 36px',transition:'transform 90ms linear'}}>
          <circle cx="39" cy="36" r="3" fill={color}/><circle cx="53" cy="36" r="3" fill={color}/>
        </g>
        <path d="M34 70h24M31 80h30M36 90h20" stroke={color} strokeOpacity=".35"/>
      </svg>
    </div>)}
  </aside>;
};

// --- HELPER COMPONENTS ---
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8 text-center pt-6">
    <h2 className="text-3xl font-bold tracking-[0.4em] text-white mb-4 uppercase">{title}</h2>
    <div className="w-24 h-[1px] bg-amber-500 mx-auto mb-6" />
    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">{subtitle}</p>
  </div>
);

const NavLink = ({ children, targetId, delay, onNavigate }) => {
  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <ScrollLink
      to={targetId}
      containerId="landing-scroll-container"
      smooth={true}
      duration={550}
      offset={-100}
      onClick={handleClick}
      style={{ animationDelay: delay }}
      className="cursor-pointer text-[10px] tracking-[0.2em] uppercase font-bold text-white/50 hover:text-amber-500 transition-colors duration-300 animate-nav-item-in opacity-0"
    >
      {children}
    </ScrollLink>
  );
};




const ReadimentaryButton = ({ children, onClick, onMouseEnter, onMouseLeave, color = "amber", fullWidth = false }) => {
  const colorStyles = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    teal: "bg-teal-500/10 border-teal-500/30 text-teal-500",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-500"
  };
  return (
    <div className={`relative group ${fullWidth ? 'block w-full' : 'inline-block'}`}>
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative z-10 flex items-center gap-4 backdrop-blur-xl border ${colorStyles[color]} px-10 py-5 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase ${fullWidth ? 'w-full justify-center' : ''}`}
      >
        {children}
      </button>
      <div className={`absolute inset-0 pointer-events-none border ${colorStyles[color].split(' ')[1].replace('/30', '/10')} translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2`} />
    </div>
  );
};

export default function Landing({ onEnter = () => {}, onEmailAuth = async () => {}, user = null, authError = '', loginRequestKey = 0 }) {
  const containerRef = useRef(null);
  const mainFigureRef = useRef(null);
  const backFigureRef = useRef(null);
  const oracleFigureRef = useRef(null);
  const breatheFrameRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [socialNotice, setSocialNotice] = useState('');
  const [featuresHighlighted, setFeaturesHighlighted] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [loopCharacterIndex, setLoopCharacterIndex] = useState(0);

  // Sample reader state
  const [sampleIndex, setSampleIndex] = useState(0);
  const [samplePlaying, setSamplePlaying] = useState(false);
  const [sampleParseProgress, setSampleParseProgress] = useState(18);

  useEffect(() => {
    if (loginRequestKey > 0) setShowLogin(true);
  }, [loginRequestKey]);

  // --- Particle Data ---
  const createParticles = (count, xRange) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: xRange[0] + Math.random() * (xRange[1] - xRange[0]),
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    drift: (Math.random() - 0.5) * 30,
    size: 1 + Math.random() * 2
  }));

  const bookParticles = useMemo(() => createParticles(8, [140, 200]), []);
  const tabletParticles = useMemo(() => createParticles(6, [140, 200]), []);
  const scrollParticles = useMemo(() => createParticles(6, [140, 200]), []);
  const sectionCharacterMap = useMemo(() => ({
    hero: null,      // Loop animation in hero
    features: 1,     // Blue/teal character
    pricing: 2,      // Pink character
    faq: 0,          // Amber character
    docs: 1          // Blue/teal character
  }), []);
  const sectionOrder = useMemo(() => ['hero', 'features', 'pricing', 'faq', 'docs'], []);
  const controlledCharacterIndex = sectionCharacterMap[activeSectionId];
  const centerCharacterIndex = controlledCharacterIndex ?? loopCharacterIndex;
  const sectionDepth = Math.max(0, sectionOrder.indexOf(activeSectionId));

  const getCharacterTransformStyle = (characterIndex) => {
    const offsets = {
      0: { x: 0, y: -8, scale: 1.58, opacity: 1, z: 40 },
      1: { x: 156, y: 12, scale: 1.36, opacity: 0.72, z: 20 },
      2: { x: -156, y: 14, scale: 1.3, opacity: 0.64, z: 10 }
    };

    const delta = (characterIndex - centerCharacterIndex + 3) % 3;
    const pose = offsets[delta];
    const yScrollDrift = sectionDepth * 24;

    return {
      transform: `translate(-50%, -50%) translate(${pose.x}px, ${pose.y + yScrollDrift}px) scale(${pose.scale})`,
      opacity: pose.opacity,
      zIndex: pose.z
    };
  };

  const animations = `
    @keyframes float-element { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    @keyframes scan-eyes { 0%, 100% { width: 40px; transform: translateX(0); } 45% { width: 40px; transform: translateX(2px); } 50% { width: 0px; transform: translateX(2px); } 55% { width: 40px; transform: translateX(2px); } 90% { width: 40px; transform: translateX(-2px); } }
    @keyframes pulse-pink { 0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px #f472b6); } 50% { opacity: 1; filter: drop-shadow(0 0 10px #f472b6); } }
    @keyframes pulse-teal { 0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px #2dd4bf); } 50% { opacity: 1; filter: drop-shadow(0 0 10px #2dd4bf); } }
    @keyframes magic-rise { 0% { transform: translate(0, 0); opacity: 0; } 20% { opacity: 0.8; } 80% { opacity: 0.8; } 100% { transform: translate(var(--drift), -60px); opacity: 0; } }
    @keyframes charBoot {
      0% { opacity: 0; transform: scale(0.5) translateY(40px); filter: brightness(3) blur(10px); }
      70% { opacity: 1; transform: scale(1.1) translateY(-5px); filter: brightness(1.5) blur(0px); }
      100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
    }
    @keyframes navSlideIn {
      0% { transform: translateY(-100%); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes navItemIn {
      0% { transform: translateY(-10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes samplePanelIn {
      0% { opacity: 0; transform: translateY(26px) scale(0.96); filter: blur(8px) brightness(1.4); }
      70% { opacity: 1; transform: translateY(-3px) scale(1.01); filter: blur(0px) brightness(1.08); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px) brightness(1); }
    }
    @keyframes samplePanelGlow {
      0%, 100% { box-shadow: 0 0 0 rgba(245,158,11,0.0), 0 0 0 rgba(245,158,11,0.0); }
      50% { box-shadow: 0 0 18px rgba(245,158,11,0.14), 0 0 42px rgba(245,158,11,0.08); }
    }
    @keyframes sampleRailPulse {
      0%, 100% { opacity: 0.35; transform: scaleY(1); }
      50% { opacity: 0.9; transform: scaleY(1.06); }
    }
    @keyframes sampleWordPop {
      0% { opacity: 0.35; transform: translateY(6px) scale(0.98); filter: blur(1px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes sampleStatusPulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.35); opacity: 1; }
    }
    @keyframes sampleEq {
      0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
      50% { transform: scaleY(1); opacity: 1; }
    }
    @keyframes featureCardIn {
      0% { opacity: 0; transform: translateY(24px) scale(0.96); filter: blur(8px); }
      70% { opacity: 1; transform: translateY(-2px) scale(1.01); filter: blur(0); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes featureCardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes revealElement { from { opacity: 0; transform: translateY(28px) scale(.975); filter: blur(7px); } to { opacity: 1; transform: none; filter: none; } }
    @keyframes drawFigure { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @keyframes fillBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes drawRing { from { stroke-dashoffset: 1; } to { stroke-dashoffset: var(--ring-end); } }
    @keyframes iconAlive { 0%,100% { transform: translateY(0) rotate(0); filter: drop-shadow(0 0 0 transparent); } 50% { transform: translateY(-3px) rotate(2deg); filter: drop-shadow(0 0 7px currentColor); } }
    .scroll-reveal { opacity: 0; transform: translateY(28px) scale(.975); filter: blur(7px); }
    .scroll-reveal.is-visible { animation: revealElement .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--reveal-delay, 0ms); }
    .scroll-reveal svg path, .scroll-reveal svg circle { vector-effect: non-scaling-stroke; }
    .scroll-reveal.is-visible .chart-line { stroke-dasharray: 1; animation: drawFigure 1.25s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--reveal-delay, 0ms) + 180ms); }
    .scroll-reveal.is-visible .h-full[class*="bg-gradient"], .scroll-reveal.is-visible .data-bar { transform-origin: left; animation: fillBar 1.15s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--reveal-delay, 0ms) + 220ms); }
    .scroll-reveal.is-visible .metric-ring { animation: drawRing 1.5s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--reveal-delay, 0ms) + 240ms); }
    .scroll-reveal.is-visible svg:not(.kinetic-orb svg) { animation: iconAlive 4.8s ease-in-out 1.2s infinite; }
    .animate-boot-1 { animation: charBoot 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both; }
    .animate-boot-2 { animation: charBoot 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s both; }
    .animate-boot-3 { animation: charBoot 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.7s both; }
    .animate-nav-in { animation: navSlideIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-nav-item-in { animation: navItemIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-sample-in { animation: samplePanelIn 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s both; }
    .animate-sample-panel {
      animation:
        samplePanelIn 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s both,
        samplePanelGlow 4.2s ease-in-out 0.9s infinite;
    }
    .animate-sample-rail { animation: sampleRailPulse 2.2s ease-in-out infinite; }
    .animate-sample-word { animation: sampleWordPop 220ms cubic-bezier(0.2, 0.8, 0.2, 1); }
    .animate-sample-status { animation: sampleStatusPulse 1.3s ease-in-out infinite; }
    .animate-sample-eq { animation: sampleEq 0.9s ease-in-out infinite; transform-origin: bottom; }
    .animate-feature-card-in { animation: featureCardIn 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .animate-feature-card-float { animation: featureCardFloat 4.6s ease-in-out infinite; }
    .marquee-track {
      display: flex;
      width: max-content;
      animation: marquee 24s linear infinite;
      will-change: transform;
    }
    @keyframes orbDrift { 0%, 100% { transform: translate3d(0,0,0) rotate(-3deg); } 50% { transform: translate3d(-18px,14px,0) rotate(3deg); } }
    @keyframes orbMarks { to { transform: rotate(360deg); } }
    @keyframes orbCounter { to { transform: rotate(-360deg); } }
    @keyframes orbScan { 0%,100% { transform: translateY(-128px); opacity: .12; } 50% { transform: translateY(128px); opacity: .7; } }
    .marquee-group {
      display: flex;
      flex-shrink: 0;
      min-width: 100vw;
      align-items: center;
      justify-content: space-around;
      gap: 3rem;
      padding-right: 3rem;
    }
    .kinetic-orb { position: absolute; width: min(68vw, 760px); aspect-ratio: 1; right: -7vw; top: 5%; opacity: .46; filter: drop-shadow(0 0 44px rgba(245,158,11,.05)); animation: orbDrift 11s ease-in-out infinite; will-change: transform; }
    .kinetic-orb-marks { transform-origin: 240px 240px; animation: orbMarks 44s linear infinite; }
    .kinetic-orb-grid { transform-origin: 240px 240px; animation: orbCounter 62s linear infinite; }
    .kinetic-orb-scan { animation: orbScan 6.5s ease-in-out infinite; }
    .character-rail { position: fixed; left: 14px; top: 50%; z-index: 45; display: flex; flex-direction: column; gap: 7px; transform: translate(-125%,-50%); opacity: 0; transition: transform .8s cubic-bezier(.16,1,.3,1), opacity .5s ease; pointer-events: none; }
    .character-rail.is-following { transform: translate(0,-50%); opacity: .9; }
    .rail-character { width: 58px; height: 70px; padding: 5px; border: 1px solid color-mix(in srgb, var(--rail-color) 25%, transparent); border-radius: 14px; background: rgba(8,8,8,.72); backdrop-filter: blur(12px); box-shadow: 0 0 25px color-mix(in srgb, var(--rail-color) 7%, transparent); animation: featureCardFloat 4s ease-in-out infinite; animation-delay: var(--rail-delay); transition: transform .3s ease, opacity .3s ease; }
    .rail-character:nth-child(2) { margin-left: 9px; }.rail-character:nth-child(3) { margin-left: 2px; }
    @media (max-width: 768px) { .kinetic-orb { width: 680px; right: -360px; top: 9%; opacity: .25; } .character-rail { left: 5px; opacity: .55; transform: translate(-20%,-50%) scale(.72); transform-origin: left center; } .character-rail:not(.is-following){opacity:0;transform:translate(-125%,-50%) scale(.72)} }
    @media (prefers-reduced-motion: reduce) { .kinetic-orb, .kinetic-orb-marks, .kinetic-orb-grid, .kinetic-orb-scan, .scroll-reveal, .scroll-reveal * { animation: none !important; } .scroll-reveal { opacity: 1; transform: none; filter: none; } }
    section[id] { scroll-margin-top: 100px; }
  `;

  useEffect(() => {
    const scrollContainer = document.getElementById('landing-scroll-container');
    const getScrollTop = () => (scrollContainer ? scrollContainer.scrollTop : window.scrollY);
    const handleScroll = () => setScrolled(getScrollTop() > 20);
    const target = scrollContainer || window;
    target.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  // Reveal every meaningful landing element as it enters the scroll viewport.
  useEffect(() => {
    const scrollContainer = document.getElementById('landing-scroll-container');
    const root = containerRef.current;
    if (!root) return;
    const elements = root.querySelectorAll('section:not(#hero) article, section:not(#hero) > div, footer > div');
    elements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: scrollContainer || null, threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { left, width, top, height } = containerRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - left) / width, y: (e.clientY - top) / height });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let phase = 0;
    const breathe = () => {
      phase += 0.015;
      if (mainFigureRef.current) mainFigureRef.current.style.transform = `scale(${1 + Math.sin(phase) * 0.006})`;
      if (backFigureRef.current) backFigureRef.current.style.transform = `scale(${1.05 + Math.sin(phase + 0.8) * 0.005})`;
      if (oracleFigureRef.current) oracleFigureRef.current.style.transform = `scale(${1.03 + Math.sin(phase + 0.4) * 0.005})`;
      breatheFrameRef.current = requestAnimationFrame(breathe);
    };
    breathe();
    return () => cancelAnimationFrame(breatheFrameRef.current);
  }, []);

  // Hero loop: center swaps amber -> blue -> pink continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setLoopCharacterIndex((prev) => (prev + 1) % 3);
    }, 2300);
    return () => clearInterval(interval);
  }, []);

  // Section mapping: character focus follows scrolling context
  useEffect(() => {
    const sectionIds = ['hero', 'features', 'pricing', 'faq', 'docs'];
    const scrollContainer = document.getElementById('landing-scroll-container');
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        root: scrollContainer || null,
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: '-18% 0px -45% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Sample reader setup
  const sampleText = "Rapid Serial Visual Presentation (RSVP) is a digital reading technique that flashes words sequentially in a single, fixed location on a screen. By centering each word on its Optimal Recognition Point (ORP), RSVP eliminates the need for saccades—the jerky eye movements required to scan a traditional page. This approach effectively bypasses subvocalization (the habit of saying words in your head) and prevents regression, the subconscious tendency to re-read previous lines. While it significantly boosts speed and focus on small screens, users often find it better suited for straightforward informational text rather than dense technical material or literature that requires deep reflection.";
  const sampleWords = useMemo(
    () => sampleText.split(' ').map(word => ({ text: word, orp: Math.floor(word.length / 2) })),
    [sampleText]
  );

  useEffect(() => {
    if (!samplePlaying || sampleIndex >= sampleWords.length) return;
    const interval = setInterval(() => {
      setSampleIndex(prev => {
        const next = prev + 1;
        if (next >= sampleWords.length) {
          setSamplePlaying(false);
          return 0;
        }
        return next;
      });
    }, 60000 / 450);
    return () => clearInterval(interval);
  }, [samplePlaying, sampleIndex, sampleWords.length]);

  const renderSampleWord = () => {
    if (sampleWords.length === 0) return <span className="text-white/50">Loading...</span>;
    const word = sampleWords[sampleIndex];
    if (!word) return <span className="text-white/50">Click play to start sample</span>;
    return (
      <div className="flex justify-center items-center w-full">
        <span className="text-right flex-1 opacity-40 text-white">{word.text.slice(0, word.orp)}</span>
        <span className="text-amber-500 font-bold px-[1px]">{word.text[word.orp]}</span>
        <span className="text-left flex-1 opacity-40 text-white">{word.text.slice(word.orp + 1)}</span>
      </div>
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSampleParseProgress((progress) => progress >= 100 ? 18 : Math.min(100, progress + 3));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sampleWpm = 450;

  const handleSamplePlayPause = () => {
    if (!samplePlaying && sampleIndex >= sampleWords.length - 1) {
      setSampleIndex(0);
    }
    setSamplePlaying(prev => !prev);
  };

  const resetSample = () => {
    setSamplePlaying(false);
    setSampleIndex(0);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      await onEmailAuth({ email, password, rememberMe });
    } catch {
      // The parent renders the uniform API error in this modal.
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setSocialNotice(`${provider} authentication will be enabled when production accounts are connected.`);
  };

  const highlightFeatures = () => {
    setFeaturesHighlighted(true);
    setTimeout(() => setFeaturesHighlighted(false), 1800);
  };

  const whyReadimentary = [
    { index: "01", kicker: "Reading without visual drag", title: "One focal point replaces an entire page of movement.", text: "Readimentary controls where every word appears, reducing the repeated left-to-right scanning that consumes attention before comprehension even begins.", metric: "0 px", metricLabel: "required gaze travel" },
    { index: "02", kicker: "Start before processing ends", title: "Your first page becomes readable while the rest is still arriving.", text: "The ingestion engine releases useful text immediately, then builds page maps, chapter structure, and word totals in the background ahead of your pace.", metric: "1st", metricLabel: "page released live" },
    { index: "03", kicker: "A pace that belongs to you", title: "Move from calm comprehension to high-speed review in one control.", text: "Adjust the presentation rate for dense research, everyday nonfiction, or rapid recall without changing tools or losing your place.", metric: "900+", metricLabel: "WPM ceiling" }
  ];


  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050505] overflow-x-hidden font-sans text-white scroll-smooth flex flex-col">
      <style>{animations}</style>
      <div
        className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(5,5,5,0.2)_30%,rgba(5,5,5,0.9)_100%)]" />
      <CharacterRail mousePos={mousePos} activeSectionId={activeSectionId} />

      {/* --- FIXED VIEWPORT WRAPPER (CENTERING ANCHOR) --- */}
      <div className="fixed top-0 left-0 w-full flex justify-center z-[100]">
        
        {/* --- ACTUAL NAV CONTAINER --- */}
        <div 
          className={`relative transition-all duration-700 ease-out animate-nav-in
            ${scrolled ? 'mt-4 w-[85%] max-w-6xl' : 'mt-8 w-[90%] max-w-7xl'}`}
        >
          <nav className={`transition-all duration-500 bg-white/5 backdrop-blur-xl border rounded-2xl px-8 flex items-center justify-between shadow-2xl shadow-black/50 ${scrolled ? 'h-14 border-white/20' : 'h-16 border-white/10'}`}>
            
            {/* Left Side */}
            <div className="flex items-center gap-2 group cursor-pointer flex-1">
              <div className="w-6 h-6 border border-amber-500/50 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
                <div className="w-2 h-2 bg-amber-500" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.4em] uppercase hidden sm:block">READIMENTARY</span>
            </div>

            {/* Center Side */}
            <div className="hidden md:flex items-center justify-center gap-10 flex-[2]">
              <NavLink targetId="features" delay="0.4s" onNavigate={highlightFeatures}>Features</NavLink>
              <NavLink targetId="pricing" delay="0.5s">Pricing</NavLink>
              <NavLink targetId="about" delay="0.6s">About</NavLink>
            </div>

            {/* Right Side */}
            <div className="flex justify-end flex-1">
              <div className="relative inline-block group">
                <button
                  onClick={() => setShowLogin(true)}
                  className="relative z-10 flex items-center gap-2 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-5 py-2 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-[9px] uppercase"
                >
                  GET STARTED <ArrowRight size={12} />
                </button>
                <div className="absolute inset-0 border border-amber-500/10 translate-x-1 translate-y-1 z-0 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[600px] bg-gradient-to-r from-pink-600/5 via-amber-600/5 to-teal-600/5 rounded-full blur-[120px] opacity-30" />
          <KineticDataOrb />
        </div>

        <div className="w-full max-w-7xl px-6 mb-10 flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest mb-6">
            <Zap size={12} /> Meet The New Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.16] pb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 mb-6">
            Read at the speed of thought.
          </h1>
          <p className="max-w-3xl text-white/55 text-sm md:text-base tracking-wide leading-relaxed">
            Upload a PDF, choose a pace, and read one word at a time. Chapters and progress are saved automatically.
          </p>
        </div>

        <div className="relative mb-12 w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center justify-center gap-10">
          <div
            className="relative w-full max-w-[700px] h-[500px] flex justify-center items-center"
            style={{ transform: `translate(${(mousePos.x - 0.5) * 12}px, ${(mousePos.y - 0.5) * 8}px)` }}
          >
            <div
              className="absolute top-1/2 left-1/2 transition-all duration-700 ease-out"
              style={getCharacterTransformStyle(2)}
            >
              <svg width="340" height="420" viewBox="0 0 340 420"><g ref={oracleFigureRef} style={{ transformOrigin: 'center 200px' }}><ellipse cx="170" cy="380" rx="80" ry="10" fill="#000" opacity="0.4" /><g transform="translate(0, 10)"><path d="M110 160 L230 160 L250 380 L90 380 Z" fill="#1a1216" /><path d="M165 160 L175 160 L185 380 L155 380 Z" fill="#2d1a22" /><rect x="100" y="160" width="140" height="40" rx="10" fill="#2d1a22" /></g><rect x="110" y="80" width="120" height="90" rx="15" fill="#2d1a22" /><rect x="130" y="100" width="80" height="70" rx="8" fill="#050505" /><rect x="150" y="125" width="40" height="6" fill="#f472b6" style={{ animation: 'pulse-pink 3.2s infinite ease-in-out', filter: 'drop-shadow(0 0 4px #f472b6)' }} /><g style={{ animation: 'float-element 3.5s ease-in-out infinite' }}><rect x="130" y="210" width="80" height="55" rx="2" fill="#f472b615" stroke="#f472b6" strokeWidth="0.5" /><g fill="#f472b6">{tabletParticles.map(p => (<rect key={p.id} x={p.x} y="210" width="2" height="2" opacity="0" style={{ '--drift': `${p.drift}px`, animation: 'magic-rise 2.5s infinite linear', animationDelay: `${p.delay}s` }} />))}</g></g></g></svg>
            </div>
            <div
              className="absolute top-1/2 left-1/2 transition-all duration-700 ease-out"
              style={getCharacterTransformStyle(1)}
            >
              <svg width="340" height="420" viewBox="0 0 340 420"><g ref={backFigureRef} style={{ transformOrigin: 'center 200px' }}><ellipse cx="170" cy="380" rx="80" ry="10" fill="#000" opacity="0.4" /><g transform="translate(0, 10)"><path d="M110 160 L230 160 L250 380 L90 380 Z" fill="#121212" /><path d="M165 160 L175 160 L185 380 L155 380 Z" fill="#1a1a1a" /><rect x="100" y="160" width="140" height="40" rx="10" fill="#1a1a1a" /></g><rect x="110" y="80" width="120" height="90" rx="15" fill="#1a1a1a" /><rect x="130" y="100" width="80" height="70" rx="8" fill="#050505" /><rect x="150" y="125" width="40" height="6" fill="#2dd4bf" style={{ animation: 'pulse-teal 4s infinite ease-in-out' }} /><g style={{ animation: 'float-element 4s ease-in-out infinite' }}><rect x="125" y="205" width="90" height="8" rx="4" fill="#0f172a" stroke="#2dd4bf" strokeWidth="0.5" /><rect x="125" y="275" width="90" height="8" rx="4" fill="#0f172a" stroke="#2dd4bf" strokeWidth="0.5" /><rect x="135" y="213" width="70" height="62" fill="#2dd4bf" opacity="0.1" /><g fill="#2dd4bf">{scrollParticles.map(p => (<rect key={p.id} x={p.x} y="213" width="2" height="2" opacity="0" style={{ '--drift': `${p.drift}px`, animation: 'magic-rise 2.8s infinite linear', animationDelay: `${p.delay}s` }} />))}</g></g></g></svg>
            </div>
            <div
              className="absolute top-1/2 left-1/2 transition-all duration-700 ease-out"
              style={getCharacterTransformStyle(0)}
            >
              <svg width="340" height="420" viewBox="0 0 340 420"><g ref={mainFigureRef} style={{ transformOrigin: 'center 400px' }}><ellipse cx="170" cy="380" rx="80" ry="10" fill="#000" opacity="0.6" /><g transform="translate(0, 10)"><path d="M110 160 L230 160 L250 380 L90 380 Z" fill="#171717" /><path d="M165 160 L175 160 L185 380 L155 380 Z" fill="#222" /><rect x="100" y="160" width="140" height="40" rx="10" fill="#262626" /></g><rect x="110" y="80" width="120" height="90" rx="15" fill="#262626" /><rect x="130" y="100" width="80" height="70" rx="8" fill="#0a0a0a" /><rect x="150" y="125" width="40" height="6" fill="#fbbf24" style={{ animation: 'scan-eyes 5s infinite ease-in-out' }} /><g style={{ animation: 'float-element 3s ease-in-out infinite' }}><rect x="130" y="210" width="80" height="50" rx="2" fill="#78350f" /><rect x="135" y="215" width="70" height="40" rx="1" fill="#fef3c7" /><g fill="#fbbf24">{bookParticles.map((p) => (<rect key={p.id} x={p.x} y="210" width={p.size} height={p.size} opacity="0" style={{ '--drift': `${p.drift}px`, animation: `magic-rise ${p.duration}s infinite ease-out`, animationDelay: `${p.delay}s` }} />))}</g></g></g></svg>
            </div>
          </div>

          <div className={`w-full max-w-xl bg-white/5 backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-colors duration-500 animate-sample-panel ${samplePlaying ? 'border-amber-500/30' : 'border-white/10'}`}>
            <div className="relative h-32 md:h-40 flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[90px] border-y border-white/5 flex justify-center">
                  <div className={`w-[2px] h-full shadow-[0_0_16px_rgba(245,158,11,0.15)] animate-sample-rail ${samplePlaying ? 'bg-amber-500/70' : 'bg-amber-500/20'}`} />
                </div>
              </div>
              <div className={`relative z-10 w-full text-center text-3xl md:text-5xl leading-none tracking-tighter px-4 ${samplePlaying ? 'animate-sample-word' : ''}`}>
                {renderSampleWord()}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetSample}
                className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                title="Reset sample"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={handleSamplePlayPause}
                className={`w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 ${samplePlaying ? 'border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.3)]' : 'border-white/20'}`}
              >
                {samplePlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-0.5" />}
              </button>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 min-w-[120px] text-left flex items-center gap-2">
                <span className={`inline-block w-1.5 h-1.5 rounded-full bg-amber-500 ${samplePlaying ? 'animate-sample-status' : 'opacity-40'}`} />
                <span>WPM: {sampleWpm}</span>
                {samplePlaying && (
                  <span className="inline-flex items-end gap-[2px] ml-1">
                    <span className="w-[2px] h-[8px] bg-amber-500/80 animate-sample-eq" />
                    <span className="w-[2px] h-[10px] bg-amber-500/80 animate-sample-eq" style={{ animationDelay: '120ms' }} />
                    <span className="w-[2px] h-[7px] bg-amber-500/80 animate-sample-eq" style={{ animationDelay: '240ms' }} />
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-[9px] tracking-[0.18em] uppercase text-white/40 mb-2">
                <span>Background parsing</span>
                <span>{sampleParseProgress}% · reader ready</span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-teal-400 transition-[width] duration-500" style={{ width: `${sampleParseProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <ReadimentaryButton onClick={() => setShowLogin(true)}>
            <BookOpen size={18} /> INITIALIZE<ArrowRight size={18} />
          </ReadimentaryButton>
        </div>
      </section>

      <div className="w-full border-y border-white/10 bg-white/[0.02] py-5 backdrop-blur-sm overflow-hidden">
        <div className="marquee-track text-[11px] font-mono text-white/40 uppercase tracking-widest">
          {[false, true].map((hidden) => (
            <div key={String(hidden)} className="marquee-group" aria-hidden={hidden || undefined}>
              <span className="whitespace-nowrap"><Check size={14} className="inline text-amber-500 mr-2" /> Local-First Architecture</span>
              <span className="whitespace-nowrap"><Zap size={14} className="inline text-teal-500 mr-2" /> 600+ WPM Achievable</span>
              <span className="whitespace-nowrap"><Shield size={14} className="inline text-pink-500 mr-2" /> Zero Data Tracking</span>
              <span className="whitespace-nowrap"><Check size={14} className="inline text-amber-500 mr-2" /> Browser Native Engine</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="order-[30] w-full py-10 md:py-12 px-4 md:px-6 max-w-[1440px] mx-auto border-t border-white/5">
        <SectionHeader title="Pricing" subtitle="Simple monthly plans · cancel anytime" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl mx-auto items-stretch">
          {[
            { name: 'Individual', price: 15, color: 'amber', description: 'For regular reading.', features: ['Unlimited PDFs', 'RSVP reader', 'Chapter progress'] },
            { name: 'Pro', price: 29, color: 'teal', recommended: true, description: 'For daily power users.', features: ['Everything in Individual', 'Reading analytics', 'Priority support'] },
            { name: 'Team', price: 79, color: 'pink', description: 'For up to 5 readers.', features: ['Everything in Pro', '5 user seats', 'Shared billing'] }
          ].map((plan) => (
            <article key={plan.name} className={`relative rounded-3xl border p-6 md:p-7 flex flex-col bg-white/[0.025] ${plan.recommended ? 'border-teal-500/45 shadow-[0_0_60px_rgba(45,212,191,0.07)]' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[9px] font-mono tracking-[0.18em] text-white/45">{plan.name.toUpperCase()}</span>
                {plan.recommended && <span className="rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-[8px] uppercase tracking-[0.16em] text-teal-400">Recommended</span>}
              </div>
              <div className="flex items-end gap-2"><span className="text-6xl font-black tracking-[-0.06em] text-white">${plan.price}</span><span className="text-[9px] uppercase tracking-[0.16em] text-white/35 mb-3">/ month</span></div>
              <p className="text-sm text-white/50 mt-4 mb-5">{plan.description}</p>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => <li key={feature} className="flex items-center gap-3 text-xs text-white/65"><Check size={14} className="text-amber-500" />{feature}</li>)}
              </ul>
              <ReadimentaryButton fullWidth color={plan.color} onClick={() => user ? onEnter() : setShowLogin(true)}>Choose {plan.name}</ReadimentaryButton>
            </article>
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.14em] text-white/30">Annual billing will include a 20% discount. Checkout is coming next.</p>
      </section>

      <section className="order-[40] w-full relative py-10 md:py-12 px-4 md:px-6 max-w-[1440px] mx-auto overflow-hidden">
        <div className="absolute left-6 right-6 top-28 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-8 lg:gap-12 items-start mb-10">
          <div className="lg:sticky lg:top-28">
            <div className="flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-amber-500/80 font-bold mb-6"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,.8)]" /> Why Readimentary</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] leading-[1.05] text-white mb-6">Built for the moment reading turns into momentum.</h2>
            <p className="text-sm md:text-base leading-7 text-white/50 max-w-md">A reading environment should disappear as your understanding accelerates. Every system here is designed around that single outcome.</p>
          </div>
          <div className="border-t border-white/10">
            {whyReadimentary.map((item) => (
              <article key={item.index} className="group grid md:grid-cols-[72px_1fr_130px] gap-5 md:gap-7 py-9 border-b border-white/10 hover:bg-white/[0.018] transition-colors px-1 md:px-4">
                <div className="text-[10px] font-mono text-white/25 pt-1">[{item.index}]</div>
                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-teal-400/70 font-bold mb-3">{item.kicker}</p>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight text-white mb-4 group-hover:text-amber-50 transition-colors">{item.title}</h3>
                  <p className="text-sm leading-6 text-white/45 max-w-2xl">{item.text}</p>
                </div>
                <div className="md:text-right md:border-l border-white/10 md:pl-6">
                  <div className="text-2xl font-mono text-amber-500 mb-2">{item.metric}</div>
                  <div className="text-[8px] tracking-[0.16em] uppercase leading-4 text-white/30">{item.metricLabel}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
          <span className="text-[9px] tracking-[0.2em] uppercase text-white/30 shrink-0">Engine primitives</span>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] tracking-[0.14em] uppercase text-white/50">
            {['PDF.js worker', 'Optimal recognition point', 'IndexedDB storage', 'Page-word mapping', 'JWT sessions'].map((item) => <span key={item} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-teal-400" />{item}</span>)}
          </div>
        </div>
      </section>

      <section id="features" className="order-[50] w-full py-10 md:py-12 border-t border-white/5">
        <div
          className={`relative w-full transition-all duration-500 ${
            featuresHighlighted ? 'ring-1 ring-amber-500/50 bg-amber-500/[0.03]' : ''
          }`}
        >
          <TechnicalGrid />
          <div className="px-6">
            <SectionHeader title="Features" subtitle="What the reader does" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className={`rounded-3xl border bg-white/[0.03] transition-colors duration-500 overflow-hidden ${featuresHighlighted ? 'border-amber-500/40' : 'border-white/10'}`}>
              <div className="px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                  <div>
                    <p className="text-[9px] tracking-[0.24em] uppercase text-amber-500/80 font-bold mb-2">Reader capabilities</p>
                    <h3 className="text-xl md:text-3xl font-bold tracking-tight text-white">Read PDFs at your pace.</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-white/45 max-w-md">Four tools for importing, navigating, reading, and tracking PDFs.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 auto-rows-[minmax(210px,auto)]">
                  <article className="group lg:col-span-7 lg:row-span-2 relative rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.09] via-black/30 to-black/60 p-7 md:p-9 overflow-hidden hover:border-amber-500/40 transition-colors">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.18) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="relative flex items-center justify-between mb-12"><span className="text-[9px] font-mono tracking-[0.2em] text-amber-500">01 / STREAM CORE</span><Zap size={20} className="text-amber-500" /></div>
                    <div className="relative grid md:grid-cols-[1fr_210px] gap-8 items-end">
                      <div><h4 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4">Start before parsing finishes.</h4><p className="text-sm leading-7 text-white/55 max-w-lg">Begin with the first page while the rest of the PDF is processed in the background.</p></div>
                      <svg viewBox="0 0 210 210" className="w-full max-w-[210px] mx-auto" aria-hidden="true"><circle cx="105" cy="105" r="76" fill="#f59e0b" fillOpacity=".05" stroke="#f59e0b" strokeOpacity=".25"/><circle cx="105" cy="105" r="50" fill="none" stroke="#f59e0b" strokeOpacity=".35" strokeDasharray="4 7"/><path d="M105 20v38M105 152v38M20 105h38M152 105h38" stroke="#f59e0b" strokeOpacity=".45"/><rect x="82" y="72" width="46" height="66" rx="5" fill="#090909" stroke="#f59e0b" strokeOpacity=".6"/><path d="M91 88h28M91 99h22M91 110h26M91 121h16" stroke="#f59e0b" strokeOpacity=".65"/><circle cx="105" cy="105" r="4" fill="#2dd4bf"/></svg>
                    </div>
                    <div className="relative mt-9 flex items-center gap-3 text-[9px] uppercase tracking-[0.15em] text-white/35"><span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"/> Reader ready before document completion</div>
                  </article>

                  <article className="group lg:col-span-5 relative rounded-3xl border border-teal-500/20 bg-teal-500/[0.045] p-7 overflow-hidden hover:border-teal-500/40 transition-colors">
                    <div className="flex items-start justify-between mb-6"><div><span className="text-[9px] font-mono tracking-[0.2em] text-teal-400">02 / OPTICAL MAP</span><h4 className="text-xl font-bold text-white mt-3">Adaptive ORP alignment</h4></div><Eye size={20} className="text-teal-400"/></div>
                    <div className="relative h-20 rounded-xl border-y border-white/[0.07] flex items-center justify-center mb-5"><div className="absolute h-full w-px bg-teal-400/60"/><div className="text-3xl font-serif tracking-tight"><span className="text-white/35">fo</span><span className="text-teal-400 font-bold">c</span><span className="text-white/35">used</span></div></div>
                    <p className="text-xs leading-6 text-white/50">Words stay aligned around a consistent focal point as their length changes.</p>
                  </article>

                  <article className="group lg:col-span-3 relative rounded-3xl border border-white/10 bg-white/[0.025] p-6 overflow-hidden hover:border-pink-500/30 transition-colors">
                    <Layers3 size={19} className="text-pink-400 mb-7"/><div className="text-[9px] font-mono text-white/25 mb-2">03 / STRUCTURE</div><h4 className="text-lg font-bold text-white mb-3">Chapter intelligence</h4><p className="text-xs leading-5 text-white/45">Headings become navigable sections with independent progress.</p>
                    <div className="mt-6 space-y-2">{[72,48,86].map((width,index)=><div key={width} className="flex items-center gap-2"><span className="text-[8px] text-white/20">0{index+1}</span><div className="h-1 rounded-full bg-pink-400/30" style={{width:`${width}%`}}/></div>)}</div>
                  </article>

                  <article className="group lg:col-span-2 relative rounded-3xl border border-white/10 bg-black/35 p-6 overflow-hidden hover:border-white/25 transition-colors">
                    <Lock size={18} className="text-amber-500 mb-7"/><div className="text-[9px] font-mono text-white/25 mb-2">04 / LOCAL</div><h4 className="text-base font-bold text-white mb-3">Private by architecture</h4><p className="text-[11px] leading-5 text-white/40">PDF bytes stay inside IndexedDB on your device.</p><div className="absolute bottom-5 right-5 w-9 h-9 rounded-full border border-amber-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-amber-500"/></div>
                  </article>
                </div>
              </div>

              <div className="mx-4 md:mx-6 mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-amber-500/[0.06] via-white/[0.025] to-teal-500/[0.06] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_14px_rgba(45,212,191,0.8)]" />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/60">Live ingestion sequence</span>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-4 md:gap-2 items-center">
                  <div className="rounded-2xl bg-black/25 p-5"><div className="w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center text-[9px] font-mono text-amber-500 mb-4">I</div><b className="block text-xs uppercase tracking-[0.12em] text-white mb-2">Ingest locally</b><p className="text-[10px] leading-5 text-white/40">Validate the PDF without sending its bytes to a cloud vault.</p></div>
                  <ArrowRight size={14} className="hidden md:block text-white/20"/>
                  <div className="border-l-2 border-teal-400/40 pl-5 py-3"><div className="flex items-center gap-2 text-[9px] font-mono text-teal-400 mb-4"><span className="w-2 h-2 bg-teal-400 animate-pulse"/> LIVE</div><b className="block text-xs uppercase tracking-[0.12em] text-white mb-2">Release page one</b><p className="text-[10px] leading-5 text-white/40">The first readable word array enters the player immediately.</p></div>
                  <ArrowRight size={14} className="hidden md:block text-white/20"/>
                  <div className="relative p-5"><div className="absolute top-5 right-5 w-7 h-7 rotate-45 border border-pink-500/30"/><div className="text-[9px] font-mono text-pink-400 mb-5">MAP / 03</div><b className="block text-xs uppercase tracking-[0.12em] text-white mb-2">Build structure</b><p className="text-[10px] leading-5 text-white/40">Index pages, chapters, sentences, and optical anchors.</p></div>
                  <ArrowRight size={14} className="hidden md:block text-white/20"/>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex items-center justify-between mb-4"><span className="text-[9px] font-mono text-white/30">READ / 04</span><Play size={13} className="text-amber-500"/></div><b className="block text-xs uppercase tracking-[0.12em] text-white mb-2">Stay ahead</b><p className="text-[10px] leading-5 text-white/40">Background parsing continues beyond the reader’s current pace.</p></div>
                </div>
              </div>

              <div className="mx-4 md:mx-6 mb-6 border-l-2 border-amber-500/40 pl-4">
                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">A note of caution</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  RSVP is excellent for linear content like articles or emails, but can be less ideal for highly technical material or poetry where you need to pause and reflect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ... (rest of sections: stats, pricing, faq, footer, modal remain identical) */}
      
      {/* --- STATS BAR --- */}
      <div className="order-[55] w-full bg-white/5 border-y border-white/5 py-8 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <Lock size={20}/>, label: "Private Local Data" },
            { icon: <Globe size={20}/>, label: "Works In Browser" },
            { icon: <Cpu size={20}/>, label: "Fast Text Parsing" },
            { icon: <Shield size={20}/>, label: "Progress Tracking" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3">
              <div className="text-amber-500">{item.icon}</div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-white/40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="order-[10] w-full py-10 md:py-12 px-4 md:px-6 max-w-[1440px] mx-auto border-t border-white/5">
        <SectionHeader title="Reading Signals" subtitle="A clearer sense of value at a glance" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <article className="lg:col-span-8 relative rounded-3xl border border-white/10 bg-[#090909] overflow-hidden p-7 md:p-9 min-h-[390px]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8"><div><div className="flex items-center gap-2 text-[9px] tracking-[0.18em] uppercase text-teal-400 mb-3"><Activity size={13}/> Live reading telemetry</div><h3 className="text-2xl md:text-3xl font-black text-white">Performance you can see.</h3></div><div className="flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/[0.06] px-3 py-2 text-[8px] uppercase tracking-[0.15em] text-teal-400"><span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"/> Session active</div></div>
            <div className="grid sm:grid-cols-[1fr_1.6fr] gap-7 items-end">
              <div><div className="text-6xl md:text-7xl font-black tracking-[-0.07em] text-white">450</div><div className="text-xs tracking-[0.2em] uppercase text-amber-500 mt-2">words per minute</div><p className="text-xs leading-6 text-white/40 mt-5">A productive default for fluent nonfiction—fast enough to create momentum, controlled enough to preserve context.</p></div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><SignalChart value={92}/><div className="grid grid-cols-3 gap-2 mt-2 text-center"><div><b className="block text-sm text-white">01:42</b><span className="text-[8px] uppercase text-white/25">elapsed</span></div><div><b className="block text-sm text-white">734</b><span className="text-[8px] uppercase text-white/25">words</span></div><div><b className="block text-sm text-teal-400">92%</b><span className="text-[8px] uppercase text-white/25">focus</span></div></div></div>
            </div>
          </article>

          <article className="lg:col-span-4 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] to-black/30 p-7 flex flex-col justify-between min-h-[390px]">
            <div className="flex items-center justify-between"><span className="text-[9px] font-mono text-amber-500">PACE ENVELOPE</span><Gauge size={20} className="text-amber-500"/></div>
            <div className="relative w-48 h-48 mx-auto my-5"><svg viewBox="0 0 200 200" className="w-full h-full -rotate-90"><circle cx="100" cy="100" r="76" fill="none" stroke="white" strokeOpacity=".06" strokeWidth="12"/><circle className="metric-ring" cx="100" cy="100" r="76" pathLength="1" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" strokeDasharray=".72 .28" style={{'--ring-end':'.28'}}/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-white">300–900</span><span className="text-[9px] uppercase tracking-[0.18em] text-white/30 mt-2">WPM range</span></div></div>
            <p className="text-xs leading-6 text-white/45">Dial down for technical density. Accelerate for review. The same focal rail supports every tier.</p>
          </article>

          <article className="lg:col-span-4 rounded-3xl border border-teal-500/20 bg-teal-500/[0.035] p-7 min-h-[245px]">
            <ScanLine size={20} className="text-teal-400 mb-7"/><div className="text-4xl font-black text-white mb-2">100%</div><h3 className="text-sm font-bold uppercase tracking-[0.12em] text-teal-400 mb-3">Focal drift lock</h3><p className="text-xs leading-6 text-white/45">Optical word mapping keeps the recognition point fixed even as token geometry changes.</p>
            <div className="relative mt-6 h-8 border-y border-white/[0.06]"><div className="absolute left-1/2 top-0 bottom-0 w-px bg-teal-400"/><div className="absolute left-[18%] right-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"/></div>
          </article>

          <article className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.025] p-7 min-h-[245px] flex flex-col sm:flex-row gap-7 items-center">
            <div className="shrink-0 relative w-28 h-32 rounded-xl border border-white/10 bg-black/30 flex items-center justify-center"><FileText size={34} className="text-white/25"/><div className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">01</div><div className="absolute -right-3 top-14 w-6 h-6 rounded-full bg-teal-400 text-black text-[9px] font-black flex items-center justify-center">12</div></div>
            <div><div className="text-[9px] uppercase tracking-[0.18em] text-pink-400 mb-3">Dynamic ingestion</div><h3 className="text-xl font-bold text-white mb-3">Counts grow while you read.</h3><p className="text-xs leading-6 text-white/45">Page totals, word arrays, and chapter boundaries update without interrupting playback.</p></div>
          </article>

          <article className="lg:col-span-3 rounded-3xl border border-white/10 bg-black/35 p-7 min-h-[245px]">
            <Database size={20} className="text-amber-500 mb-8"/><div className="text-4xl font-black text-white mb-2">0</div><h3 className="text-sm font-bold text-white mb-3">Cloud PDF copies</h3><p className="text-[11px] leading-5 text-white/40">Your source document remains local to the browser.</p><div className="mt-5 text-[8px] uppercase tracking-[0.14em] text-amber-500/60">IndexedDB / encrypted origin</div>
          </article>
        </div>
      </section>


      <section className="order-[20] w-full py-10 md:py-12 px-4 md:px-6 max-w-[1440px] mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9">
          <div>
            <div className="text-[10px] tracking-[0.24em] uppercase text-teal-400/70 font-bold mb-5">Selected reading modes</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-white max-w-2xl leading-[1.05]">Different material. One engine that changes pace with you.</h2>
          </div>
          <p className="text-sm leading-6 text-white/45 max-w-sm">Four practical workflows for turning a static document into a deliberate reading session.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <article className="lg:col-span-7 relative rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-[#080808] p-7 md:p-9 overflow-hidden min-h-[420px]">
            <div className="flex items-center justify-between mb-8"><span className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-500">Deep work / 01</span><span className="text-[8px] font-mono text-white/25">45:00 BLOCK</span></div>
            <div className="grid md:grid-cols-[1fr_150px] gap-8">
              <div><h3 className="text-2xl md:text-3xl font-black text-white mb-4">The focused chapter sprint</h3><p className="text-sm leading-7 text-white/45">A distraction-resistant session built around one chapter, one focal rail, and a pace calibrated for sustained comprehension.</p>
                <div className="relative mt-9 h-32 border-y border-white/[0.07] flex items-center justify-center"><div className="absolute inset-y-0 left-1/2 w-px bg-amber-500/60"/><span className="text-4xl font-serif"><i className="not-italic text-white/25">atten</i><b className="text-amber-500">t</b><i className="not-italic text-white/25">ion</i></span><div className="absolute bottom-3 left-4 text-[8px] font-mono text-white/20">ORP LOCKED</div></div>
              </div>
              <aside className="rounded-2xl border border-white/10 bg-black/25 p-5"><div className="text-[8px] uppercase tracking-[0.15em] text-white/25 mb-6">Session plan</div><div className="space-y-5"><div><span className="text-2xl font-black text-white">420</span><small className="block text-[8px] uppercase text-amber-500">WPM target</small></div><div><span className="text-2xl font-black text-white">01</span><small className="block text-[8px] uppercase text-white/30">Chapter</small></div><div><span className="text-2xl font-black text-teal-400">88%</span><small className="block text-[8px] uppercase text-white/30">Focus score</small></div></div></aside>
            </div>
          </article>

          <article className="lg:col-span-5 rounded-3xl border border-teal-500/20 bg-[#07100f] overflow-hidden min-h-[420px]">
            <div className="px-7 py-6 border-b border-teal-500/15 flex items-center justify-between"><div><span className="text-[9px] uppercase tracking-[0.2em] text-teal-400">Research / 02</span><h3 className="text-xl font-bold text-white mt-2">High-volume first pass</h3></div><FileText size={20} className="text-teal-400"/></div>
            <div className="p-7"><p className="text-xs leading-6 text-white/45 mb-7">Build a fast mental map before returning to the passages that deserve close analysis.</p><div className="font-mono text-[10px] divide-y divide-white/[0.06] border-y border-white/[0.06]"><div className="grid grid-cols-[42px_1fr_auto] py-4"><span className="text-white/20">P.01</span><span className="text-white/60">Abstract + premise</span><span className="text-teal-400">READ</span></div><div className="grid grid-cols-[42px_1fr_auto] py-4"><span className="text-white/20">P.04</span><span className="text-white/60">Primary evidence</span><span className="text-amber-500">FLAG</span></div><div className="grid grid-cols-[42px_1fr_auto] py-4"><span className="text-white/20">P.11</span><span className="text-white/60">Counterargument</span><span className="text-white/25">QUEUE</span></div></div><div className="mt-6 flex items-center gap-2 text-[8px] uppercase tracking-[0.14em] text-teal-400"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"/> 12 pages indexed</div></div>
          </article>

          <article className="lg:col-span-5 rounded-3xl border border-pink-500/20 bg-pink-500/[0.035] p-7 md:p-8 min-h-[310px]">
            <div className="flex gap-6 items-start"><div className="relative shrink-0 w-20 h-28"><div className="absolute inset-0 translate-x-3 -translate-y-2 rounded-lg border border-pink-500/15"/><div className="absolute inset-0 translate-x-1 -translate-y-1 rounded-lg border border-pink-500/25"/><div className="relative h-full rounded-lg bg-pink-500/10 border border-pink-500/35 flex items-center justify-center"><BookOpen size={26} className="text-pink-400"/></div></div><div><span className="text-[9px] uppercase tracking-[0.2em] text-pink-400">Learning / 03</span><h3 className="text-xl font-bold text-white mt-3 mb-3">A repeatable study rhythm</h3><p className="text-xs leading-6 text-white/45">Turn a dense reading list into daily sessions with visible chapter progress and consistent timing.</p></div></div>
            <div className="mt-8 grid grid-cols-[auto_1fr_auto] gap-4 items-center"><span className="text-[9px] font-mono text-white/25">DAY 06</span><div className="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full w-[64%] bg-gradient-to-r from-pink-500 to-amber-500 rounded-full"/></div><span className="text-[9px] font-mono text-pink-400">64%</span></div>
          </article>

          <article className="lg:col-span-7 relative rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-8 min-h-[310px] overflow-hidden">
            <div className="grid sm:grid-cols-[1fr_220px] gap-7 items-center"><div><span className="text-[9px] uppercase tracking-[0.2em] text-amber-500">Review / 04</span><h3 className="text-2xl font-bold text-white mt-3 mb-4">The last-mile knowledge scan</h3><p className="text-xs leading-6 text-white/45 max-w-md">Revisit familiar material at elevated speed while the focal rail keeps attention on meaning instead of line finding.</p><div className="mt-6 flex gap-5 text-[8px] uppercase tracking-[0.14em] text-white/30"><span>Instant replay</span><span>•</span><span>Focal lock</span></div></div><div className="relative h-44"><svg viewBox="0 0 220 170" className="w-full h-full"><path d="M25 138A88 88 0 01195 138" pathLength="1" fill="none" stroke="white" strokeOpacity=".08" strokeWidth="14" strokeLinecap="round"/><path className="metric-ring" d="M25 138A88 88 0 01170 72" pathLength="1" fill="none" stroke="#f59e0b" strokeOpacity=".8" strokeWidth="14" strokeLinecap="round" strokeDasharray="1" style={{'--ring-end':'0'}}/><path className="chart-line" pathLength="1" d="M110 138l53-60" stroke="#2dd4bf" strokeWidth="2"/><circle cx="110" cy="138" r="7" fill="#2dd4bf"/></svg><div className="absolute inset-0 flex items-center justify-center pt-14"><div className="text-center"><b className="block text-3xl text-white">780</b><span className="text-[8px] uppercase tracking-[0.14em] text-white/25">WPM review</span></div></div></div></div>
          </article>
        </div>
      </section>

      <section id="about" className="order-[58] w-full border-t border-white/[0.06] px-4 md:px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-14 items-start">
          <div>
            <div className="text-[10px] tracking-[0.24em] uppercase text-amber-500/80 font-bold mb-5">About Readimentary</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-[-0.04em] leading-tight text-white max-w-2xl">A focused reader for people with more to read than time.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">Readimentary turns PDFs into adjustable RSVP reading sessions. It helps readers move through long documents, keep their place, and review material at a pace that fits the task.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <span className="text-[9px] uppercase tracking-[0.18em] text-teal-400">Contact</span>
              <h3 className="text-lg font-bold text-white mt-3">Questions or feedback?</h3>
              <p className="text-xs leading-6 text-white/45 mt-2 mb-5">Tell us what you are reading and where the experience can improve.</p>
              <a href="mailto:support@readimentary.app" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">support@readimentary.app</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <span className="text-[9px] uppercase tracking-[0.18em] text-pink-400">Quick links</span>
              <div className="mt-4 flex flex-col gap-3 text-xs text-white/55">
                <ScrollLink to="features" containerId="landing-scroll-container" smooth duration={550} offset={-90} className="cursor-pointer hover:text-white">Features</ScrollLink>
                <ScrollLink to="pricing" containerId="landing-scroll-container" smooth duration={550} offset={-90} className="cursor-pointer hover:text-white">Pricing</ScrollLink>
                <button type="button" onClick={() => setShowLogin(true)} className="text-left hover:text-white">Get started</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="order-[60] w-full border-t border-white/[0.06] bg-black px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 py-3">
          <div><div className="flex items-center gap-3"><div className="w-6 h-6 border border-amber-500/40 flex items-center justify-center"><div className="w-2 h-2 bg-amber-500" /></div><span className="text-[10px] font-bold tracking-[0.32em] uppercase text-white/55">Readimentary</span></div><p className="mt-4 text-xs leading-6 text-white/35 max-w-xs">A local-first RSVP reader for focused PDF reading and review.</p></div>
          <div><h3 className="text-[9px] uppercase tracking-[0.18em] text-white/30 mb-4">Product</h3><div className="flex flex-col gap-3 text-xs text-white/50"><ScrollLink to="features" containerId="landing-scroll-container" smooth duration={550} offset={-90} className="cursor-pointer hover:text-white">Features</ScrollLink><ScrollLink to="pricing" containerId="landing-scroll-container" smooth duration={550} offset={-90} className="cursor-pointer hover:text-white">Pricing</ScrollLink><button type="button" onClick={() => setShowLogin(true)} className="text-left hover:text-white">Get started</button></div></div>
          <div><h3 className="text-[9px] uppercase tracking-[0.18em] text-white/30 mb-4">Company</h3><div className="flex flex-col gap-3 text-xs text-white/50"><ScrollLink to="about" containerId="landing-scroll-container" smooth duration={550} offset={-90} className="cursor-pointer hover:text-white">About</ScrollLink><a href="mailto:support@readimentary.app" className="hover:text-white">Contact</a></div></div>
          <div><h3 className="text-[9px] uppercase tracking-[0.18em] text-white/30 mb-4">Support</h3><div className="flex flex-col gap-3 text-xs text-white/50"><a href="mailto:support@readimentary.app?subject=Readimentary%20Support" className="hover:text-white">Help</a><a href="mailto:support@readimentary.app?subject=Privacy%20Question" className="hover:text-white">Privacy questions</a><a href="mailto:support@readimentary.app?subject=Billing%20Question" className="hover:text-white">Billing questions</a></div></div>
        </div>
        <div className="max-w-7xl mx-auto mt-7 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3"><p className="text-[9px] text-white/25 tracking-[0.16em] uppercase">© 2026 Readimentary. All rights reserved.</p><p className="text-[8px] text-white/20 tracking-[0.16em] uppercase">RSVP reading engine</p></div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowLogin(false)} />
          <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-zinc-900 border border-white/10 p-6 md:p-8 shadow-2xl rounded-2xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              aria-label="Close login modal"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-bold tracking-[0.2em] text-amber-500 uppercase">Get started</h2>
              <p className="text-[10px] text-white/40 tracking-[0.15em] uppercase mt-3">
                One account flow for new and returning readers
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <button type="button" onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white hover:bg-white/[0.08] hover:border-white/20 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 01-5.4-4H3.3v2.6A10 10 0 0012 22z"/><path fill="#FBBC05" d="M6.6 14.1a6 6 0 010-4.2V7.3H3.3a10 10 0 000 9.4l3.3-2.6z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0012 2a10 10 0 00-8.7 5.3l3.3 2.6a5.8 5.8 0 015.4-4z"/></svg>
                Google
              </button>
              <button type="button" onClick={() => handleSocialLogin('Apple')} className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white text-black px-4 py-3 text-xs font-semibold hover:bg-white/90 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M17.1 12.5c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 00-3.6-2c-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9A4.9 4.9 0 004.4 9.3c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.1-2.5a11 11 0 001.4-2.9 4.1 4.1 0 01-3.1-4.1zM14.6 5.2A4.2 4.2 0 0015.6 2a4.5 4.5 0 00-3 1.5 4 4 0 00-1 3.1 3.7 3.7 0 003-1.4z"/></svg>
                Apple
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6"><div className="h-px flex-1 bg-white/10"/><span className="text-[9px] uppercase tracking-[0.18em] text-white/25">or continue with email</span><div className="h-px flex-1 bg-white/10"/></div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] text-white/50 tracking-[0.2em] uppercase font-bold">
                  Email
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 focus-within:border-amber-500/40 transition-colors">
                  <User size={14} className="text-amber-500/70" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] text-white/50 tracking-[0.2em] uppercase font-bold">
                  Password
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 focus-within:border-amber-500/40 transition-colors">
                  <Lock size={14} className="text-amber-500/70" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] tracking-[0.15em] uppercase">
                <label className="inline-flex items-center gap-2 text-white/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Remember me
                </label>
                <span className="text-white/25">Local preview mode</span>
              </div>

              <div className="relative inline-block group w-full pt-2">
                <button
                  type="submit"
                  disabled={authBusy}
                  className="relative z-10 w-full flex items-center justify-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-6 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
                >
                  {authBusy ? 'Opening…' : 'Continue'} <ArrowRight size={14} />
                </button>
                <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
              </div>
            </form>

            {authError && <p role="alert" className="mt-4 text-xs text-red-400 leading-relaxed">{authError}</p>}
            {socialNotice && <p role="status" className="mt-4 text-xs text-amber-400/80 leading-relaxed">{socialNotice}</p>}

            <p className="mt-6 text-[9px] text-white/30 tracking-[0.12em] uppercase leading-relaxed">New here or returning? Use the same Get Started flow. Preview credentials are not verified or sent to a server.</p>
          </div>
        </div>
      )}
    </div>
  );
}
