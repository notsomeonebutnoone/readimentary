import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BookOpen, ArrowRight, Check, Zap, Shield, HelpCircle, User, X, ChevronDown, Lock, Globe, Cpu, Menu, Play, Pause, RotateCcw } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';

// --- ICONS (Auth) ---
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
);

// --- HELPER COMPONENTS ---
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-16 text-center pt-20">
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




const SocialLoginButton = ({ children, icon, onClick }) => (
  <div className="relative inline-block group w-full">
    <button
      onClick={onClick}
      className="relative z-10 flex items-center gap-3 w-full backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-6 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{children}</span>
      <ArrowRight size={14} className="shrink-0" />
    </button>
    <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
  </div>
);

const ReadimentaryButton = ({ children, onClick, onMouseEnter, onMouseLeave, color = "amber" }) => {
  const colorStyles = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    teal: "bg-teal-500/10 border-teal-500/30 text-teal-500",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-500"
  };
  return (
    <div className="relative inline-block group">
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative z-10 flex items-center gap-4 backdrop-blur-xl border ${colorStyles[color]} px-10 py-5 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase`}
      >
        {children}
      </button>
      <div className={`absolute inset-0 border ${colorStyles[color].split(' ')[1].replace('/30', '/10')} translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2`} />
    </div>
  );
};

export default function Landing({ onEnter = () => {} }) {
  const containerRef = useRef(null);
  const mainFigureRef = useRef(null);
  const backFigureRef = useRef(null);
  const oracleFigureRef = useRef(null);
  const breatheFrameRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeFaq, setActiveFaq] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [featuresHighlighted, setFeaturesHighlighted] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [loopCharacterIndex, setLoopCharacterIndex] = useState(0);

  // Sample reader state
  const [sampleIndex, setSampleIndex] = useState(0);
  const [samplePlaying, setSamplePlaying] = useState(false);

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
      100% { transform: translateX(-100%); }
    }
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

  const comparisonGraphData = [
    { label: 'Focus Retention', traditional: 42, rsvp: 82 },
    { label: 'Eye Movement Load', traditional: 88, rsvp: 28 },
    { label: 'Speed Potential', traditional: 35, rsvp: 78 },
    { label: 'Mobile Suitability', traditional: 48, rsvp: 86 }
  ];

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
    }, 60000 / 300); // 300 WPM
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

  const sampleWpm = 300;

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

  const handleEmailLogin = (e) => {
    e.preventDefault();
    onEnter('email');
  };

  const highlightFeatures = () => {
    setFeaturesHighlighted(true);
    setTimeout(() => setFeaturesHighlighted(false), 1800);
  };

  const pricingPlans = [
    { name: "Free Tier", price: "0", color: "amber", id: "pricing", features: ["Upload 1 Book", "Read Full Book"] },
    { name: "Lifetime Access", price: "10", color: "teal", id: "pricing", features: ["One-Time Payment", "Upload Unlimited Books"] }
  ];


  const faqs = [
    { q: "What is RSVP reading?", a: "RSVP (Rapid Serial Visual Presentation) shows one word at a time in a fixed position so you can reduce eye movement and maintain reading flow." },
    { q: "Can I use my own books?", a: "Yes. Upload your PDF and read by chapter. Your progress is saved locally in your browser." },
    { q: "Is this good for every type of reading?", a: "RSVP is best for linear content like articles, essays, and nonfiction. For dense math, code, or poetry, traditional reading may still be better." }
  ];

  const testimonials = [
    { quote: "I stopped bouncing between lines and finally stay locked in.", name: "Maya L.", role: "Product Designer" },
    { quote: "The chapter flow and WPM controls make this my daily reading app.", name: "Chris D.", role: "CS Student" },
    { quote: "Perfect for nonfiction and docs when I need speed and focus.", name: "Jordan R.", role: "Operations Lead" }
  ];

  const readingSignals = [
    { value: "< 2 min", label: "Average setup", note: "Upload to first chapter in a single flow." },
    { value: "300-600", label: "Target WPM", note: "Tune speed based on content difficulty." },
    { value: "100%", label: "Local-first", note: "Your library and progress stay in-browser." }
  ];

  const planStyles = {
    amber: {
      border: 'hover:border-amber-500/30',
      text: 'text-amber-500',
      icon: 'text-amber-500'
    },
    teal: {
      border: 'hover:border-teal-500/30',
      text: 'text-teal-500',
      icon: 'text-teal-500'
    },
    pink: {
      border: 'hover:border-pink-500/30',
      text: 'text-pink-500',
      icon: 'text-pink-500'
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050505] overflow-x-hidden font-sans text-white scroll-smooth">
      <style>{animations}</style>
      <div
        className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(5,5,5,0.2)_30%,rgba(5,5,5,0.9)_100%)]" />

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
              <NavLink targetId="faq" delay="0.6s">FAQ</NavLink>
              <NavLink targetId="docs" delay="0.7s">Docs</NavLink>
            </div>

            {/* Right Side */}
            <div className="flex justify-end flex-1">
              <div className="relative inline-block group">
                <button
                  onClick={() => setShowLogin(true)}
                  className="relative z-10 flex items-center gap-2 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-5 py-2 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-[9px] uppercase"
                >
                  START <ArrowRight size={12} />
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
        </div>

        <div className="w-full max-w-7xl px-6 mb-10 flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest mb-6">
            <Zap size={12} /> Meet The New Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.16] pb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 mb-6">
            Read at the speed of thought.
          </h1>
          <p className="max-w-3xl text-white/55 text-sm md:text-base tracking-wide leading-relaxed">
            Eliminate subvocalization and eye fatigue. Upload any PDF, map chapters automatically, and push your reading rhythm with a focused RSVP interface designed for deep throughput.
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
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <ReadimentaryButton onClick={() => setShowLogin(true)}>
            <BookOpen size={18} /> INITIALIZE<ArrowRight size={18} />
          </ReadimentaryButton>
        </div>
      </section>

      <div className="w-full border-y border-white/10 bg-white/[0.02] py-5 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center w-max">
          <div className="marquee-track gap-12 items-center text-[11px] font-mono text-white/40 uppercase tracking-widest pr-12">
            <span><Check size={14} className="inline text-amber-500 mr-2" /> Local-First Architecture</span>
            <span><Zap size={14} className="inline text-teal-500 mr-2" /> 600+ WPM Achievable</span>
            <span><Shield size={14} className="inline text-pink-500 mr-2" /> Zero Data Tracking</span>
            <span><Check size={14} className="inline text-amber-500 mr-2" /> Browser Native Engine</span>
          </div>
          <div className="marquee-track gap-12 items-center text-[11px] font-mono text-white/40 uppercase tracking-widest pr-12" aria-hidden="true">
            <span><Check size={14} className="inline text-amber-500 mr-2" /> Local-First Architecture</span>
            <span><Zap size={14} className="inline text-teal-500 mr-2" /> 600+ WPM Achievable</span>
            <span><Shield size={14} className="inline text-pink-500 mr-2" /> Zero Data Tracking</span>
            <span><Check size={14} className="inline text-amber-500 mr-2" /> Browser Native Engine</span>
          </div>
        </div>
      </div>

      <section id="features" className="py-24 border-t border-white/5">
        <div
          className={`w-full transition-all duration-500 ${
            featuresHighlighted ? 'ring-1 ring-amber-500/50 bg-amber-500/[0.03]' : ''
          }`}
        >
          <div className="px-6">
            <SectionHeader title="Features" subtitle="Why RSVP improves reading flow" />
          </div>

          <div className="max-w-6xl mx-auto px-6">
            <div className={`rounded-3xl border bg-white/[0.03] transition-colors duration-500 overflow-hidden ${featuresHighlighted ? 'border-amber-500/40' : 'border-white/10'}`}>
              <div className="mx-4 md:mx-6 mt-4 mb-4 border border-white/10 overflow-hidden rounded-2xl">
                <div className="px-4 md:px-6 pt-4 pb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 bg-white/[0.02]">
                  Reading Comparison: Traditional vs. RSVP
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[820px]">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-5 py-4 text-[10px] tracking-[0.2em] uppercase text-white/60">Reading Metric</th>
                      <th className="px-5 py-4 text-[10px] tracking-[0.2em] uppercase text-white/60">Traditional Reading</th>
                      <th className="px-5 py-4 text-[10px] tracking-[0.2em] uppercase text-white/60">RSVP Reading</th>
                      <th className="px-5 py-4 text-[10px] tracking-[0.2em] uppercase text-white/60">Why It Matters</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-white/10 bg-white/[0.01]">
                      <td className="px-5 py-4 text-sm text-white/85 font-semibold">Eye Movement</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/60">High (constant jumping)</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-amber-500/90 font-medium">Near zero (fixed focus)</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/55">Less saccade overhead improves sustained attention.</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-5 py-4 text-sm text-white/85 font-semibold">Focus Level</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/60">Easy to lose place</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-amber-500/90 font-medium">High (active attention)</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/55">Single-word stream minimizes visual distractions.</td>
                    </tr>
                    <tr className="border-t border-white/10 bg-white/[0.01]">
                      <td className="px-5 py-4 text-sm text-white/85 font-semibold">Speed</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/60">~200 WPM average</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-amber-500/90 font-medium">400+ WPM attainable</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/55">Useful for scanning and high-volume reading sessions.</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-5 py-4 text-sm text-white/85 font-semibold">Best Context</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/60">Better for deep study</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-amber-500/90 font-medium">Great for skimming and info-gathering</td>
                      <td className="px-5 py-4 text-sm leading-relaxed text-white/55">Choose mode based on goal: depth vs throughput.</td>
                    </tr>
                  </tbody>
                </table>
                </div>

                <div className="px-4 md:px-6 py-5 border-t border-white/10 bg-white/[0.015]">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/55 mb-4">Quick Visual Comparison</h4>
                  <div className="space-y-4">
                    {comparisonGraphData.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs tracking-[0.08em] uppercase text-white/70">{item.label}</span>
                          <span className="text-[10px] text-white/45">Traditional {item.traditional}% | RSVP {item.rsvp}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white/40 rounded-full" style={{ width: `${item.traditional}%` }} />
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500/75 to-teal-400/65 rounded-full" style={{ width: `${item.rsvp}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
      <div className="bg-white/5 border-y border-white/5 py-12 backdrop-blur-md">
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

      <section className="py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
        <SectionHeader title="Reading Signals" subtitle="A clearer sense of value at a glance" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {readingSignals.map((signal) => (
            <div key={signal.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-500/10 blur-2xl" />
              <div className="relative">
                <div className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">{signal.value}</div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-amber-500/80 font-bold mb-4">{signal.label}</div>
                <p className="text-sm leading-relaxed text-white/65">{signal.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto">
        <SectionHeader title="Pricing" subtitle="Pick your reading tier" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <div key={i} className={`relative group p-10 bg-zinc-900 border border-white/5 ${planStyles[plan.color].border} transition-all duration-500 rounded-2xl`}>
              <h3 className={`text-xl font-bold tracking-[0.3em] uppercase mb-2 ${planStyles[plan.color].text}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-mono">${plan.price}</span>
                <span className="text-white/30 text-[10px] uppercase">{plan.price === "0" ? "forever" : "lifetime"}</span>
              </div>
              <ul className="space-y-4 mb-12">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Check size={12} className={planStyles[plan.color].icon} /> {f}
                  </li>
                ))}
              </ul>
              <ReadimentaryButton color={plan.color} onClick={() => setShowLogin(true)}>Get Started</ReadimentaryButton>
            </div>
          ))}
        </div>
      </section>

      <section className="py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
        <SectionHeader title="Reader Stories" subtitle="How people are using Readimentary" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div key={item.name} className="bg-white/[0.03] border border-white/10 p-7 rounded-2xl">
              <p className="text-sm text-white/75 leading-relaxed mb-6">"{item.quote}"</p>
              <div className="text-[10px] tracking-[0.16em] uppercase text-amber-500/80">{item.name}</div>
              <div className="text-[10px] tracking-[0.14em] uppercase text-white/40 mt-2">{item.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto border-t border-white/5">
        <SectionHeader title="FAQ" subtitle="Everything you should know before you start" />
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 bg-white/[0.02]">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-xs font-bold tracking-[0.2em] uppercase">{faq.q}</span>
                <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} size={16} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${activeFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="p-6 pt-0 text-xs text-white/40 leading-relaxed uppercase tracking-wider">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="docs" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
        <SectionHeader title="Docs" subtitle="Quick usage notes" />
        <div className="bg-white/[0.03] border border-white/10 p-8">
          <p className="text-sm text-white/70 leading-relaxed">
            Upload a PDF, select a chapter, and start RSVP playback. Use the WPM control to tune speed and the focus highlight settings to match your reading rhythm.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-teal-500/10 p-10 md:p-14">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="relative text-center">
            <p className="text-[10px] tracking-[0.25em] uppercase font-black text-amber-500/80 mb-4">Reading Acceleration Layer</p>
            <h3 className="text-2xl md:text-4xl font-black tracking-[0.12em] uppercase text-white mb-5">Build A Faster Reading Routine</h3>
            <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
              Stop drifting across lines. Keep your eyes fixed, tune your speed, and finish more chapters with less cognitive drag.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <ReadimentaryButton onClick={() => setShowLogin(true)} color="amber">
                <BookOpen size={18} /> Start Reading <ArrowRight size={18} />
              </ReadimentaryButton>
              <ReadimentaryButton onClick={() => {
                const container = document.getElementById('landing-scroll-container');
                if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
              }} color="teal">
                <RotateCcw size={18} /> Back To Top
              </ReadimentaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-white/5 bg-black">
        <p className="text-[9px] text-white/20 tracking-[0.4em] uppercase">Readimentary // RSVP reading for speed and focus</p>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowLogin(false)} />
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 p-8 shadow-2xl rounded-2xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              aria-label="Close login modal"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-bold tracking-[0.2em] text-amber-500 uppercase">Welcome Back</h2>
              <p className="text-[10px] text-white/40 tracking-[0.15em] uppercase mt-3">
                Sign in to continue to your reading workspace
              </p>
            </div>

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
                    required
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
                    required
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
                <button type="button" className="text-amber-500/80 hover:text-amber-500 transition-colors font-bold">
                  Forgot password?
                </button>
              </div>

              <div className="relative inline-block group w-full pt-2">
                <button
                  type="submit"
                  className="relative z-10 w-full flex items-center justify-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-6 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
                >
                  Continue <ArrowRight size={14} />
                </button>
                <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
              </div>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase">or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              <SocialLoginButton icon={<GoogleIcon />} onClick={() => onEnter('google')}>Google Auth</SocialLoginButton>
              <SocialLoginButton icon={<AppleIcon />} onClick={() => onEnter('apple')}>Apple ID</SocialLoginButton>
            </div>

            <p className="mt-6 text-[9px] text-white/35 tracking-[0.12em] uppercase leading-relaxed">
              By continuing, you agree to the terms of service and privacy policy.
            </p>
            <div className="mt-4 text-center">
              <button type="button" className="text-[10px] text-white/45 hover:text-white/70 tracking-[0.15em] uppercase transition-colors">
                Need help?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
