import { LibraryStats, BookGrid } from './components/LibraryComponents';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, Play, Pause, RotateCcw, 
  Settings, X, ChevronLeft, Trash2, Book, Home, Zap, Loader2,
  Sparkles, MessageSquare, BrainCircuit, Send, ArrowRight, BookOpen
} from 'lucide-react';
import Landing from './Landing';
import Logo from './components/Logo';

// --- HELPER COMPONENTS (matching landing.jsx style) ---
const ReadimentaryButton = ({ children, onClick, color = "amber", className = "" }) => {
  const colorStyles = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    teal: "bg-teal-500/10 border-teal-500/30 text-teal-500",
    pink: "bg-pink-500/10 border-pink-500/30 text-pink-500"
  };
  return (
    <div className={`relative inline-block group ${className}`}>
      <button
        onClick={onClick}
        className={`relative z-10 flex items-center gap-4 backdrop-blur-xl border ${colorStyles[color]} px-10 py-5 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase`}
      >
        {children}
      </button>
      <div className={`absolute inset-0 border ${colorStyles[color].split(' ')[1].replace('/30', '/10')} translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2`} />
    </div>
  );
};

// PDF Viewer Component
const PDFViewer = ({ pdfUrl, currentWordIndex, totalWords, isPdfReady, numPages: totalPages }) => {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const pdfRef = useRef(null);

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl || !isPdfReady || !window.pdfjsLib) return;
    
    const loadPDF = async () => {
      try {
        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setPage(1);
        
        // Render first page
        const pdfPage = await pdf.getPage(1);
        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await pdfPage.render(renderContext).promise;
      } catch (err) {
        console.error('PDF render error:', err);
      }
    };
    
    loadPDF();
  }, [pdfUrl, isPdfReady]);

  // Calculate and render page based on word index
  useEffect(() => {
    if (!pdfRef.current || totalWords === 0 || numPages === 0) return;
    
    const calculatePage = () => {
      const wordProgress = currentWordIndex / totalWords;
      const estimatedPage = Math.max(1, Math.min(numPages, Math.ceil(wordProgress * numPages)));
      return estimatedPage;
    };
    
    const renderPage = async (pageNum) => {
      if (pageNum === page) return;
      
      try {
        const pdfPage = await pdfRef.current.getPage(pageNum);
        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await pdfPage.render(renderContext).promise;
        setPage(pageNum);
      } catch (err) {
        console.error('PDF page render error:', err);
      }
    };

    const targetPage = calculatePage();
    if (targetPage !== page) {
      renderPage(targetPage);
    }
  }, [currentWordIndex, totalWords, numPages, page]);

  if (!pdfUrl) return null;

  return (
    <div className="h-full flex flex-col bg-[#050505] border-l border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
          PDF Viewer
        </span>
        {numPages > 0 && (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
            Page {page} / {numPages}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          className="max-w-full h-auto shadow-2xl border border-white/10 rounded-lg"
        />
      </div>
    </div>
  );
};

// ============ GEMINI API CONFIGURATION ============
const apiKey = "A*******0"; 

const callGemini = async (prompt, systemInstruction = "You are a helpful reading assistant.") => {
  let retries = 0;
  const delays = [1000, 2000, 4000, 8000, 16000];
  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const fetchWithRetry = async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });

      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retries < 5) {
        await new Promise(res => setTimeout(res, delays[retries++]));
        return fetchWithRetry();
      }
      throw error;
    }
  };

  return fetchWithRetry();
};

// ============ PDF.JS CONFIGURATION ============
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
let pdfJsLoadPromise = null;

const ensurePdfJsLoaded = () => {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    return Promise.resolve(window.pdfjsLib);
  }

  if (!pdfJsLoadPromise) {
    pdfJsLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${PDFJS_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
            resolve(window.pdfjsLib);
          } else {
            reject(new Error('PDF.js failed to initialize'));
          }
        });
        existingScript.addEventListener('error', () => reject(new Error('PDF.js failed to load')));
        return;
      }

      const script = document.createElement('script');
      script.src = PDFJS_URL;
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to initialize'));
        }
      };
      script.onerror = () => reject(new Error('PDF.js failed to load'));
      document.head.appendChild(script);
    });
  }

  return pdfJsLoadPromise;
};

// ============ USER IDENTITY & STORAGE ============
// User identity abstraction - ready for real auth later
// For now, uses a mock/anonymous user ID stored in localStorage
const getUserId = () => {
  let userId = localStorage.getItem('rsvp_userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('rsvp_userId', userId);
  }
  return userId;
};

const getUserEmail = () => {
  return localStorage.getItem('rsvp_userEmail') || null; // Optional, for future use
};

// User-scoped library storage keys
const getLibraryKey = (userId) => `rsvp_library_${userId}`;
const SETTINGS_KEY = 'rsvp_settings_v4';

const saveSettings = (settings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

const loadSettings = () => {
  const defaults = { wpm: 350, fontSize: 56, fontFamily: 'ui-serif', showORP: true };
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch (e) {
    return defaults;
  }
};

// User-scoped library persistence
const saveLibrary = (userId, library) => {
  try {
    // Strip non-serializable fields (ArrayBuffer / object URLs)
    const safe = (library || []).map((b) => {
      if (!b) return b;
      // eslint-disable-next-line no-unused-vars
      const { pdfData, pdfUrl, ...rest } = b;
      return rest;
    });
    localStorage.setItem(getLibraryKey(userId), JSON.stringify(safe));
  } catch (e) {
    console.error('Failed to save library:', e);
  }
};

const loadLibrary = (userId) => {
  try {
    const stored = localStorage.getItem(getLibraryKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load library:', e);
    return [];
  }
};

// PDF binary persistence (IndexedDB) so viewer survives reloads
const PDF_DB_NAME = 'rsvp_pdf_store';
const PDF_STORE_NAME = 'pdf_blobs';

const openPdfDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(PDF_DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
      db.createObjectStore(PDF_STORE_NAME);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const savePdfBlob = async (bookId, blob) => {
  const db = await openPdfDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, 'readwrite');
    tx.objectStore(PDF_STORE_NAME).put(blob, bookId);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const loadPdfBlob = async (bookId) => {
  const db = await openPdfDb();
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, 'readonly');
    const req = tx.objectStore(PDF_STORE_NAME).get(bookId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
};

const deletePdfBlob = async (bookId) => {
  const db = await openPdfDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, 'readwrite');
    tx.objectStore(PDF_STORE_NAME).delete(bookId);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

// ============ TEXT PROCESSING ============
const calculateORP = (word) => {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
};

const tokenizeText = (text) => {
  return text.split(/\s+/).filter(w => w.length > 0).map(word => ({
    text: word,
    orp: calculateORP(word)
  }));
};

const detectChaptersFromText = (text) => {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const chapters = [];
  let wordCursor = 0;

  const chapterRegexes = [/^chapter\s+(\d+|[ivxlcdm]+)/i, /^part\s+(\d+|[ivxlcdm]+)/i];

  lines.forEach((line) => {
    if (chapterRegexes.some(r => r.test(line)) || (line === line.toUpperCase() && line.length < 30)) {
      chapters.push({
        id: `ch-${chapters.length}-${Math.random()}`,
        title: line,
        startIndex: wordCursor
      });
    }
    wordCursor += line.split(/\s+/).length;
  });

  if (chapters.length === 0) {
    chapters.push({ id: 'ch-0', title: 'Start of Document', startIndex: 0 });
  }

  const totalWords = text.split(/\s+/).length;
  chapters.forEach((ch, i) => {
    const nextStart = chapters[i + 1]?.startIndex ?? totalWords;
    ch.wordCount = nextStart - ch.startIndex;
  });

  return chapters;
};

// ============ MAIN COMPONENT ============
export default function App() {
  const [screen, setScreen] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [library, setLibrary] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [chapterProgressMap, setChapterProgressMap] = useState({});
  const [isPdfJsReady, setIsPdfJsReady] = useState(false);
  
  // Custom setter for currentIndex (supports direct and functional updates)
  const setCurrentIndexWithTracking = (nextIndex) => {
    setCurrentIndex((prevIndex) => {
      return typeof nextIndex === 'function' ? nextIndex(prevIndex) : nextIndex;
    });
  };
  
  // Gemini States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [flashcards, setFlashcards] = useState(null);

  // Settings
  const [wpm, setWpm] = useState(350);
  const [fontSize, setFontSize] = useState(56);
  const [fontFamily, setFontFamily] = useState('ui-serif');
  const [showORP, setShowORP] = useState(true);

  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const fonts = [
    { name: 'Classic Serif', value: 'ui-serif, Georgia, serif' },
    { name: 'Modern Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
    { name: 'Monospace', value: 'ui-monospace, SFMono-Regular, monospace' },
    { name: 'Elegant', value: '"Times New Roman", serif' }
  ];

  // Initialize user and load persisted library
  const userIdRef = useRef(null);
  
  useEffect(() => {
    // Initialize user identity (mock for now, ready for real auth)
    userIdRef.current = getUserId();

    // Load PDF.js library
    ensurePdfJsLoaded()
      .then(() => setIsPdfJsReady(true))
      .catch(() => setError("PDF engine failed to load."));
    
    // Load user's persisted library
    const persistedLibrary = loadLibrary(userIdRef.current);
    setLibrary(persistedLibrary);
    
    // Load settings
    const s = loadSettings();
    setWpm(s.wpm); setFontSize(s.fontSize); setFontFamily(s.fontFamily); setShowORP(s.showORP);
  }, []);

  useEffect(() => {
    saveSettings({ wpm, fontSize, fontFamily, showORP });
  }, [wpm, fontSize, fontFamily, showORP]);

  // Persist library whenever it changes
  useEffect(() => {
    if (userIdRef.current && library.length >= 0) {
      saveLibrary(userIdRef.current, library);
    }
  }, [library]);

  // Update and persist current book's progress
  useEffect(() => {
    if (currentBook && userIdRef.current) {
      const updatedBook = { ...currentBook, currentIndex, chapterProgressMap };
      const updatedLibrary = library.map(book => 
        book.id === currentBook.id ? updatedBook : book
      );
      setLibrary(updatedLibrary);
    }
  }, [currentIndex, chapterProgressMap, currentBook]);

  // Track progress only for the actively selected chapter
  useEffect(() => {
    if (!currentChapter || words.length === 0) return;
    const chapterStart = currentChapter.startIndex;
    const chapterEnd = currentChapter.startIndex + currentChapter.wordCount;
    if (currentIndex < chapterStart || currentIndex > chapterEnd) return;

    const pct = Math.max(0, Math.min(100, ((currentIndex - chapterStart) / currentChapter.wordCount) * 100));
    setChapterProgressMap((prev) => {
      const prevPct = prev[currentChapter.id] || 0;
      const nextPct = Math.max(prevPct, pct);
      if (nextPct === prevPct) return prev;
      return { ...prev, [currentChapter.id]: nextPct };
    });
  }, [currentIndex, currentChapter, words.length]);

  const deleteBook = (e, bookId) => {
    e.stopPropagation();
    const updatedLibrary = library.filter(b => b.id !== bookId);
    setLibrary(updatedLibrary);
    deletePdfBlob(bookId).catch(() => {});
    if (currentBook?.id === bookId) {
      setCurrentBook(null);
      setScreen('library');
    }
  };

  // Playback
  const msPerWord = 60000 / wpm;
  useEffect(() => {
    if (!isPlaying || words.length === 0) return;
    let lastTime = performance.now();
    let accumulated = 0;

    const advance = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulated += delta;
      if (accumulated >= msPerWord) {
        accumulated -= msPerWord;
        setCurrentIndexWithTracking(prev => {
          const chapterEnd = currentChapter ? currentChapter.startIndex + currentChapter.wordCount : words.length;
          if (prev >= chapterEnd - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }
      if (isPlaying) intervalRef.current = requestAnimationFrame(advance);
    };
    intervalRef.current = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(intervalRef.current);
  }, [isPlaying, msPerWord, words.length, currentChapter]);

  // AI Logic
  const summarizeChapter = async (ch) => {
    setIsAiLoading(true);
    try {
      const text = words.slice(ch.startIndex, ch.startIndex + ch.wordCount).map(w => w.text).join(' ').substring(0, 15000);
      const result = await callGemini(`Summarize "${ch.title}" in bullets. Content: ${text}`);
      setAiSummary({ title: ch.title, content: result });
    } catch (err) { setError("AI failed."); } finally { setIsAiLoading(false); }
  };

  const generateFlashcards = async (ch) => {
    setIsAiLoading(true);
    try {
      const text = words.slice(ch.startIndex, ch.startIndex + ch.wordCount).map(w => w.text).join(' ').substring(0, 10000);
      const result = await callGemini(`Create 5 flashcards Q: | A: for: ${text}`);
      const cards = result.split('\n').filter(l => l.includes('|')).map(l => {
        const [q, a] = l.split('|');
        return { q: q.replace('Q:', '').trim(), a: a.replace('A:', '').trim() };
      });
      setFlashcards(cards);
    } catch (err) { setError("Flashcards failed."); } finally { setIsAiLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      await ensurePdfJsLoaded();
      setIsPdfJsReady(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(" ") + "\n";
      }
      const tokenized = tokenizeText(text);
      const chapters = detectChaptersFromText(text);

      // Create blob URL for PDF viewer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      const bookId = Date.now().toString();
      await savePdfBlob(bookId, blob).catch(() => {});
      const bookData = { 
        id: bookId, 
        title: file.name.replace('.pdf', ''), 
        words: tokenized, 
        chapters,
        pdfUrl: pdfUrl,
        pdfData: arrayBuffer, // Store for persistence
        currentIndex: 0,
        chapterProgressMap: {}
      };
      // Add to library and persist
      const updatedLibrary = [...library, bookData];
      setLibrary(updatedLibrary);
      setCurrentBook(bookData);
      setWords(tokenized);
      setCurrentIndexWithTracking(0);
      setChapterProgressMap({});
      setScreen('chapters');
    } catch (err) { setError("PDF error."); } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const startChapter = (chapter) => {
    setCurrentChapter(chapter);
    setCurrentIndexWithTracking(chapter.startIndex);
    setIsPlaying(false);
    setScreen('reader');
  };

  const renderWord = () => {
    const word = words[currentIndex];
    if (!word) return null;
    if (!showORP) return <span className="transition-opacity duration-0 text-white">{word.text}</span>;
    return (
      <div className="flex justify-center items-center w-full transition-opacity duration-0">
        <span className="text-right flex-1 opacity-40 transition-opacity duration-0 text-white">{word.text.slice(0, word.orp)}</span>
        <span className="text-amber-500 font-bold px-[1px] orp-highlight">{word.text[word.orp]}</span>
        <span className="text-left flex-1 opacity-40 transition-opacity duration-0 text-white">{word.text.slice(word.orp + 1)}</span>
      </div>
    );
  };

  const progress = currentChapter ? ((currentIndex - currentChapter.startIndex) / currentChapter.wordCount) * 100 : 0;
  const parsedContext = useMemo(() => {
    if (!words.length) return '';
    const start = Math.max(0, currentIndex - 18);
    const end = Math.min(words.length, currentIndex + 20);
    return words.slice(start, end).map((w) => w.text).join(' ');
  }, [words, currentIndex]);

  // Handle transition from landing to library
  const handleEnterLibrary = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen('library');
      setIsTransitioning(false);
    }, 400); // Match fade transition duration
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 flex flex-col relative">
      
      {/* LANDING PAGE */}
      {screen === 'home' && (
        <div 
          id="landing-scroll-container"
          className={`fixed inset-0 z-[100] overflow-y-auto transition-opacity duration-400 ${isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
        >
          <Landing onEnter={handleEnterLibrary} />
        </div>
      )}
      
      {/* LIBRARY SCREEN */}
{screen === 'library' && (
  <div className={`min-h-screen bg-[#050505] transition-opacity duration-400 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="flex justify-between items-center mb-16">
        {/* Left Side: Logo & Branding */}
        <div className="flex items-center gap-2 group cursor-pointer flex-1">
          <div className="w-6 h-6 border border-amber-500/50 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
            <div className="w-2 h-2 bg-amber-500" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.4em] uppercase hidden sm:block text-white">READIMENTARY</span>
        </div>

        {/* Right Side: Action Group */}
<div className="flex items-center gap-4">
  
  {/* IMPORT BUTTON */}
  <div className="relative inline-block group">
    <button 
      onClick={() => fileInputRef.current.click()}
      disabled={isImporting}
      className="relative z-10 flex items-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-8 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
    >
      {isImporting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
      IMPORT
    </button>
    <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
  </div>

  {/* HOME BUTTON - Now matching Import style */}
  <div className="relative inline-block group">
    <button 
      onClick={() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setScreen('home');
          setIsTransitioning(false);
        }, 500);
      }}
      className="relative z-10 flex items-center gap-3 backdrop-blur-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 px-8 py-4 font-bold tracking-[0.2em] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 text-xs uppercase"
      title="Return to home"
    >
      HOME
    </button>
    <div className="absolute inset-0 border border-amber-500/10 translate-x-1.5 translate-y-1.5 z-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
  </div>

</div>
<input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
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
            <ReadimentaryButton onClick={() => fileInputRef.current.click()}>
              <Upload size={18} /> UPLOAD PDF <ArrowRight size={18} />
            </ReadimentaryButton>
          </div>
        ) : (
          library.map((book, idx) => (
            <div 
              key={book.id} 
              onClick={async () => { 
                let hydratedBook = book;
                if (!book.pdfUrl) {
                  const blob = await loadPdfBlob(book.id).catch(() => null);
                  if (blob) {
                    hydratedBook = { ...book, pdfUrl: URL.createObjectURL(blob) };
                  }
                }
                setCurrentBook(hydratedBook); 
                setWords(hydratedBook.words); 
                setCurrentIndexWithTracking(hydratedBook.currentIndex || 0);
                setChapterProgressMap(hydratedBook.chapterProgressMap || {});
                setScreen('chapters'); 
              }} 
              className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 p-8 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center hover:bg-white/10"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 transition-all group-hover:bg-amber-500/20 group-hover:scale-105 border border-amber-500/20">
                  <Book size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold group-hover:text-amber-400 transition-colors tracking-[0.1em] uppercase text-white">{book.title}</h3>
                  <p className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase mt-2">{book.words.length.toLocaleString()} words</p>
                </div>
              </div>
              <button 
                onClick={(e) => deleteBook(e, book.id)} 
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
)}

      {/* CHAPTERS SCREEN */}
      {screen === 'chapters' && currentBook && (
        <div className="min-h-screen bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <button 
              onClick={() => setScreen('library')} 
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
                // Progress is tracked only for the selected/played chapter
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
                        <span className="text-white/30 font-black text-xl tracking-[0.1em] uppercase transition-colors group-hover:text-amber-500/50 flex-shrink-0">{(idx+1).toString().padStart(2, '0')}</span>
                        <span 
                          className="font-bold text-lg group-hover:text-amber-400 transition-colors truncate max-w-md text-white tracking-[0.05em] uppercase" 
                          title={ch.title}
                        >
                          {ch.title}
                        </span>
                        {isCompleted && (
                          <span className="text-amber-500/60 text-xs font-bold flex-shrink-0 ml-2">✓</span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        
                        
                        
                        
                      </div>
                    </div>
                    
                    {/* Chapter progress bar */}
                    <div className="flex items-center gap-3 pl-8">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ease-out ${
                            isCompleted 
                              ? 'bg-amber-500/30' 
                              : chapterProgress > 0 
                                ? 'bg-amber-500/60' 
                                : 'bg-transparent'
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
      )}

      {/* READER SCREEN */}
      {screen === 'reader' && (
        <div className="h-screen flex flex-col bg-[#050505] overflow-hidden">
          {/* Header */}
          <header className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-xl bg-white/5">
            <button 
              onClick={() => setScreen('chapters')} 
              className="text-white/50 hover:text-white flex items-center gap-2 font-bold text-xs tracking-[0.2em] uppercase transition-all hover:translate-x-[-2px]"
            >
              <ChevronLeft size={16} /> BACK
            </button>
            <div className="flex items-center gap-3 flex-1 justify-center max-w-sm min-w-0">
              <div className="flex flex-col items-center min-w-0">
                 <span className="text-[10px] text-amber-500 font-black tracking-[0.3em] uppercase mb-1">NOW READING</span>
                 <h4 
                   className="text-sm font-bold truncate w-full text-center text-white tracking-[0.1em] uppercase" 
                   title={currentChapter?.title}
                 >
                   {currentChapter?.title}
                 </h4>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
              <Settings size={20} />
            </button>
          </header>

          {/* Main Content Area - Side by Side */}
          <div className="flex-1 flex overflow-hidden">
            {/* PDF Viewer Section - prioritized first */}
            {currentBook?.pdfUrl && (
              <div className="w-[55%] min-w-[420px] border-r border-white/5 flex-shrink-0">
                <PDFViewer 
                  pdfUrl={currentBook.pdfUrl} 
                  currentWordIndex={currentIndex}
                  totalWords={words.length}
                />
              </div>
            )}

            {/* RSVP Reader Section */}
            <main className={`flex-1 flex flex-col items-center justify-center relative bg-[#050505] ${currentBook?.pdfUrl ? '' : 'w-full'}`}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full max-w-4xl h-[120px] border-y border-white/5 flex justify-center">
                   <div className="w-[2px] h-full bg-amber-500/15 shadow-[0_0_16px_rgba(245,158,11,0.15)]"></div>
                </div>
              </div>

              <div 
                style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}
                className="relative z-10 w-full max-w-5xl text-center leading-none tracking-tighter px-8"
              >
                {renderWord()}
              </div>

              <div className="absolute bottom-8 flex gap-8 text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">
                <span>WPM: {wpm}</span>
              </div>
            </main>
          </div>

          {/* Control Dashboard */}
          <footer className="p-8 bg-white/5 backdrop-blur-xl border-t border-white/5 flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Chapter Progress</span>
                <span className="text-2xl font-black text-amber-500 transition-all tracking-tight">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500/60 to-amber-500/80 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <button 
                onClick={() => setCurrentIndexWithTracking(currentChapter.startIndex)} 
                className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                title="Reset chapter"
              >
                <RotateCcw size={24} />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] border-2 border-white/20"
              >
                {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
              </button>

              <button 
                onClick={() => {
                  setIsPlaying(false);
                  setScreen('library');
                }} 
                className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                title="Return to library"
              >
                <Home size={24} />
              </button>
            </div>

            <div className="w-full max-w-4xl border border-white/10 bg-white/[0.03] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Parsed Source Context</span>
                {!currentBook?.pdfUrl && (
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500/70">PDF not available</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-white/65">
                {parsedContext || 'No parsed text available yet.'}
              </p>
            </div>

            {/* WPM Slider */}
            <div className="flex items-center gap-6 w-full max-w-md">
              <Zap size={16} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1 relative h-6 flex items-center">
                <div 
                  className="absolute h-[2px] bg-gradient-to-r from-amber-500/40 to-amber-500/60 rounded-full pointer-events-none transition-all duration-300 ease-out"
                  style={{ width: `${((wpm - 100) / (1000 - 100)) * 100}%` }}
                />
                <input 
                  type="range" 
                  min="100" 
                  max="1000" 
                  step="10" 
                  value={wpm} 
                  onChange={(e) => setWpm(parseInt(e.target.value))}
                  className="wpm-slider relative z-10"
                />
              </div>
              <span className="font-black text-lg w-16 text-right transition-all text-amber-500/80 tracking-tight">{wpm}</span>
            </div>
          </footer>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-2xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold tracking-[0.2em] text-amber-500 uppercase">ENGINE SETUP</h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase mb-4 block">Typography</label>
                <div className="grid grid-cols-1 gap-3">
                  {fonts.map(f => (
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
                <input 
                  type="range" 
                  min="32" 
                  max="120" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))} 
                  className="w-full accent-amber-500" 
                />
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
      )}

 

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
        
        /* WPM Slider - Mechanical, instrument-like styling */
        .wpm-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: 100%;
          height: 6px;
          cursor: pointer;
        }
        
        /* Track - Thin, dark base (amber fill handled by wrapper div) */
        .wpm-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          background: #1a1a1a;
          border-radius: 1px;
        }
        
        .wpm-slider::-moz-range-track {
          width: 100%;
          height: 2px;
          background: #1a1a1a;
          border-radius: 1px;
        }
        
        /* Thumb - Circular with subtle glow */
        .wpm-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          margin-top: -6px;
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4), 0 0 4px rgba(255, 255, 255, 0.2);
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        
        .wpm-slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4), 0 0 4px rgba(255, 255, 255, 0.2);
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        
        /* Active/drag state - subtle scale */
        .wpm-slider:active::-webkit-slider-thumb {
          transform: scale(1.15);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.6), 0 0 6px rgba(255, 255, 255, 0.3);
        }
        
        .wpm-slider:active::-moz-range-thumb {
          transform: scale(1.15);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.6), 0 0 6px rgba(255, 255, 255, 0.3);
        }
        
        /* Hover state */
        .wpm-slider:hover::-webkit-slider-thumb {
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5), 0 0 5px rgba(255, 255, 255, 0.25);
        }
        
        .wpm-slider:hover::-moz-range-thumb {
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5), 0 0 5px rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
}
