import React, { useEffect, useMemo, useRef, useState } from 'react';
import Landing from './Landing';
import LibraryScreen from './screens/LibraryScreen';
import DashboardScreen from './screens/DashboardScreen';
import ChaptersScreen from './screens/ChaptersScreen';
import ReaderScreen from './screens/ReaderScreen';
import SettingsModal from './components/app/SettingsModal';
import { ensurePdfJsLoaded } from './lib/pdfEngine';
import { parsePdfProgressively } from './lib/progressivePdfParser';
import { api } from './lib/apiClient';
import { savePdfBlob, loadPdfBlob, deletePdfBlob } from './lib/pdfBlobStore';
import {
  getUserId,
  loadSettings,
  saveSettings,
  loadLibrary,
  saveLibrary,
  createDefaultAnalytics,
  loadAnalytics,
  saveAnalytics
} from './lib/appStorage';

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
  const [chapterProgressMap, setChapterProgressMap] = useState({});
  const [readingStats, setReadingStats] = useState(createDefaultAnalytics());
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');

  const [wpm, setWpm] = useState(350);
  const [fontSize, setFontSize] = useState(56);
  const [fontFamily, setFontFamily] = useState('ui-serif');
  const [showORP, setShowORP] = useState(true);

  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const userIdRef = useRef(null);
  const statsBufferRef = useRef({ ms: 0, words: 0 });
  const prevReaderPlayingRef = useRef(false);

  const fonts = [
    { name: 'Classic Serif', value: 'ui-serif, Georgia, serif' },
    { name: 'Modern Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
    { name: 'Monospace', value: 'ui-monospace, SFMono-Regular, monospace' },
    { name: 'Elegant', value: '"Times New Roman", serif' }
  ];

  const setCurrentIndexWithTracking = (nextIndex) => {
    setCurrentIndex((prevIndex) => (typeof nextIndex === 'function' ? nextIndex(prevIndex) : nextIndex));
  };

  const flushStatsBuffer = () => {
    const { ms, words: advancedWords } = statsBufferRef.current;
    if (ms <= 0 && advancedWords <= 0) return;
    const dayKey = new Date().toISOString().slice(0, 10);
    setReadingStats((prev) => ({
      ...prev,
      totalReadingMs: prev.totalReadingMs + ms,
      totalWordsAdvanced: prev.totalWordsAdvanced + advancedWords,
      dailyMs: {
        ...(prev.dailyMs || {}),
        [dayKey]: (prev.dailyMs?.[dayKey] || 0) + ms
      }
    }));
    statsBufferRef.current = { ms: 0, words: 0 };
  };

  const navigateTo = (nextScreen, { replace = false } = {}) => {
    setScreen(nextScreen);
    const state = { screen: nextScreen };
    if (replace) {
      window.history.replaceState(state, '', window.location.pathname);
    } else {
      window.history.pushState(state, '', window.location.pathname);
    }
  };

  useEffect(() => {
    userIdRef.current = getUserId();
    ensurePdfJsLoaded().catch(() => {});
    setLibrary(loadLibrary(userIdRef.current));
    setReadingStats(loadAnalytics(userIdRef.current));

    const s = loadSettings();
    setWpm(s.wpm);
    setFontSize(s.fontSize);
    setFontFamily(s.fontFamily);
    setShowORP(s.showORP);
    api.me().then(({ user: sessionUser }) => {
      setUser(sessionUser);
      userIdRef.current = sessionUser.id;
      setLibrary(loadLibrary(sessionUser.id));
      setReadingStats(loadAnalytics(sessionUser.id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    window.history.replaceState({ screen: 'home' }, '', window.location.pathname);
    const onPopState = (event) => {
      const nextScreen = event.state?.screen;
      if (!nextScreen) return;
      setIsPlaying(false);
      setShowSettings(false);
      setScreen(nextScreen);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const defaultTitle = 'Readimentary';
    if (screen === 'home') {
      document.title = 'Readimentary | Landing';
      return;
    }
    if (screen === 'library') {
      document.title = 'Readimentary | Library';
      return;
    }
    if (screen === 'dashboard') {
      document.title = 'Readimentary | Dashboard';
      return;
    }
    if (screen === 'chapters') {
      const bookTitle = currentBook?.title ? ` - ${currentBook.title}` : '';
      document.title = `Readimentary | Chapters${bookTitle}`;
      return;
    }
    if (screen === 'reader') {
      const chapterTitle = currentChapter?.title || currentBook?.title || 'Reader';
      document.title = `Readimentary | Reading: ${chapterTitle}`;
      return;
    }
    document.title = defaultTitle;
  }, [screen, currentBook?.title, currentChapter?.title]);

  useEffect(() => {
    if (screen !== 'reader') return;
    const onKeyDown = (event) => {
      if (event.code !== 'Space') return;
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) return;
      event.preventDefault();
      setIsPlaying((prev) => !prev);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen]);

  useEffect(() => {
    saveSettings({ wpm, fontSize, fontFamily, showORP });
  }, [wpm, fontSize, fontFamily, showORP]);

  useEffect(() => {
    if (userIdRef.current) saveAnalytics(userIdRef.current, readingStats);
  }, [readingStats]);

  useEffect(() => {
    if (userIdRef.current) saveLibrary(userIdRef.current, library);
  }, [library]);

  useEffect(() => {
    if (!currentBook || !userIdRef.current) return;
    const updatedBook = { ...currentBook, currentIndex, chapterProgressMap };
    setLibrary((prevLibrary) => prevLibrary.map((book) => (book.id === currentBook.id ? updatedBook : book)));
  }, [currentIndex, chapterProgressMap, currentBook]);

  useEffect(() => {
    if (!currentChapter || words.length === 0) return;
    const chapterStart = currentChapter.startIndex;
    const chapterEnd = currentChapter.startIndex + currentChapter.wordCount;
    if (currentIndex < chapterStart || currentIndex > chapterEnd) return;

    const pct = Math.max(0, Math.min(100, ((currentIndex - chapterStart) / currentChapter.wordCount) * 100));
    setChapterProgressMap((prev) => {
      const prevPct = prev[currentChapter.id] || 0;
      const nextPct = Math.max(prevPct, pct);
      return nextPct === prevPct ? prev : { ...prev, [currentChapter.id]: nextPct };
    });
  }, [currentIndex, currentChapter, words.length]);

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
        setCurrentIndexWithTracking((prev) => {
          const chapterEnd = currentChapter ? currentChapter.startIndex + currentChapter.wordCount : words.length;
          if (prev >= chapterEnd - 1) {
            setIsPlaying(false);
            return prev;
          }
          statsBufferRef.current.ms += msPerWord;
          statsBufferRef.current.words += 1;
          return prev + 1;
        });
      }
      if (isPlaying) intervalRef.current = requestAnimationFrame(advance);
    };

    intervalRef.current = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(intervalRef.current);
  }, [isPlaying, msPerWord, words.length, currentChapter]);

  useEffect(() => {
    if (screen === 'reader' && isPlaying && !prevReaderPlayingRef.current) {
      setReadingStats((prev) => ({ ...prev, totalSessions: prev.totalSessions + 1 }));
    }
    prevReaderPlayingRef.current = isPlaying;
  }, [isPlaying, screen]);

  useEffect(() => {
    if (!(screen === 'reader' && isPlaying)) {
      flushStatsBuffer();
      return;
    }
    const flushId = setInterval(() => flushStatsBuffer(), 1000);
    return () => {
      clearInterval(flushId);
      flushStatsBuffer();
    };
  }, [screen, isPlaying]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bufferForViewer = arrayBuffer.slice(0);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      const bookId = crypto.randomUUID?.() || Date.now().toString();
      const title = file.name.replace(/\.pdf$/i, '');
      try {
        await api.registerBook({ id: bookId, title });
      } catch (error) {
        if (error.code === 'PAYMENT_REQUIRED') {
          const { url } = await api.checkout();
          window.location.assign(url);
          return;
        }
        throw error;
      }
      await savePdfBlob(bookId, blob).catch(() => {});
      let opened = false;
      const applySnapshot = (snapshot, final = false) => {
        const chapters = final ? snapshot.chapters : [{ id: `${bookId}-live`, title: 'Live extraction', startIndex: 0, wordCount: snapshot.words.length }];
        const bookData = { id: bookId, title, ...snapshot, chapters, pdfUrl, pdfData: bufferForViewer, currentIndex: 0, chapterProgressMap: {} };
        setLibrary((prev) => prev.some((book) => book.id === bookId) ? prev.map((book) => book.id === bookId ? { ...book, ...bookData } : book) : [...prev, bookData]);
        setCurrentBook((current) => current?.id === bookId || !current ? bookData : current);
        setWords(snapshot.words);
        if (!opened) {
          opened = true;
          setCurrentIndexWithTracking(0);
          setChapterProgressMap({});
          setIsImporting(false);
          navigateTo('chapters');
        }
      };
      const result = await parsePdfProgressively(arrayBuffer.slice(0), {
        onReady: (snapshot) => applySnapshot(snapshot),
        onProgress: (snapshot) => {
          if (opened) applySnapshot(snapshot);
          api.updateBook(bookId, { status: snapshot.status, totalWords: snapshot.words.length, parsedPages: snapshot.parsedPages, totalPages: snapshot.totalPages }).catch(() => {});
        }
      });
      applySnapshot(result, true);
      await api.updateBook(bookId, { status: 'ready', totalWords: result.words.length, parsedPages: result.parsedPages, totalPages: result.totalPages }).catch(() => {});
    } catch (err) {
      console.error('PDF error:', err);
      setAuthError(err.message || 'The PDF could not be imported.');
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleBookSelect = async (book) => {
    let hydratedBook = book;
    if (!book.pdfUrl) {
      const blob = await loadPdfBlob(book.id).catch(() => null);
      if (blob) {
        const arrayBuffer = await blob.arrayBuffer();
        hydratedBook = { ...book, pdfUrl: URL.createObjectURL(blob), pdfData: arrayBuffer };
      }
    }
    setCurrentBook(hydratedBook);
    setWords(hydratedBook.words);
    setCurrentIndexWithTracking(hydratedBook.currentIndex || 0);
    setChapterProgressMap(hydratedBook.chapterProgressMap || {});
    navigateTo('chapters');
  };

  const deleteBook = (e, bookId) => {
    e.stopPropagation();
    setLibrary((prev) => prev.filter((b) => b.id !== bookId));
    deletePdfBlob(bookId).catch(() => {});
    api.deleteBook(bookId).catch(() => {});
    if (currentBook?.id === bookId) {
      setCurrentBook(null);
      navigateTo('library');
    }
  };

  const startChapter = (chapter) => {
    setCurrentChapter(chapter);
    setCurrentIndexWithTracking(chapter.startIndex);
    setIsPlaying(false);
    navigateTo('reader');
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

  const dashboardStats = useMemo(() => {
    const booksRead = library.filter((book) => {
      const hasProgressByIndex = (book.currentIndex || 0) > 0;
      const hasChapterProgress = Object.values(book.chapterProgressMap || {}).some((v) => v > 0);
      return hasProgressByIndex || hasChapterProgress;
    }).length;

    const completedBooks = library.filter((book) => {
      if (!book?.words?.length) return false;
      if ((book.currentIndex || 0) >= book.words.length - 1) return true;
      const chapters = book.chapters || [];
      if (chapters.length === 0) return false;
      const progressMap = book.chapterProgressMap || {};
      return chapters.every((ch) => (progressMap[ch.id] || 0) >= 100);
    }).length;

    const totalHours = readingStats.totalReadingMs / 3600000;
    const averageWpm = readingStats.totalReadingMs > 0 ? readingStats.totalWordsAdvanced / (readingStats.totalReadingMs / 60000) : 0;

    const heatmapDays = [];
    const today = new Date();
    for (let i = 55; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const minutes = Math.round((readingStats.dailyMs?.[key] || 0) / 60000);
      heatmapDays.push({ key, minutes });
    }

    return { booksRead, completedBooks, totalHours, averageWpm, totalSessions: readingStats.totalSessions, heatmapDays };
  }, [library, readingStats]);

  const handleEnterLibrary = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigateTo('library');
      setIsTransitioning(false);
    }, 400);
  };

  const handleEmailAuth = async ({ email, password, mode }) => {
    setAuthError('');
    try {
      const result = mode === 'register' ? await api.register(email, password) : await api.login(email, password);
      setUser(result.user);
      userIdRef.current = result.user.id;
      setLibrary(loadLibrary(result.user.id));
      setReadingStats(loadAnalytics(result.user.id));
      handleEnterLibrary();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const handleCheckout = async () => {
    try {
      const { url } = await api.checkout();
      window.location.assign(url);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleGoHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigateTo('home');
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 flex flex-col relative">
      {screen === 'home' && (
        <div
          id="landing-scroll-container"
          className={`fixed inset-0 z-[100] overflow-y-auto transition-opacity duration-400 ${isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
        >
          <Landing onEnter={handleEnterLibrary} onEmailAuth={handleEmailAuth} onOAuth={(provider) => { window.location.assign(api.oauthUrl(provider)); }} onCheckout={handleCheckout} user={user} authError={authError} />
        </div>
      )}

      {screen === 'library' && (
        <LibraryScreen
          isTransitioning={isTransitioning}
          isImporting={isImporting}
          fileInputRef={fileInputRef}
          onUploadClick={() => fileInputRef.current?.click()}
          onDashboardClick={() => navigateTo('dashboard')}
          onHomeClick={handleGoHome}
          onFileUpload={handleFileUpload}
          library={library}
          onBookClick={handleBookSelect}
          onDeleteBook={deleteBook}
        />
      )}

      {screen === 'dashboard' && <DashboardScreen navigateTo={navigateTo} dashboardStats={dashboardStats} readingStats={readingStats} library={library} />}

      {screen === 'chapters' && <ChaptersScreen currentBook={currentBook} chapterProgressMap={chapterProgressMap} startChapter={startChapter} navigateTo={navigateTo} />}

      {screen === 'reader' && (
        <ReaderScreen
          currentBook={currentBook}
          currentChapter={currentChapter}
          currentIndex={currentIndex}
          words={words}
          fontSize={fontSize}
          fontFamily={fontFamily}
          wpm={wpm}
          setWpm={setWpm}
          progress={progress}
          parsedContext={parsedContext}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setShowSettings={setShowSettings}
          setCurrentIndexWithTracking={setCurrentIndexWithTracking}
          navigateTo={navigateTo}
          renderWord={renderWord}
        />
      )}

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        fonts={fonts}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showORP={showORP}
        setShowORP={setShowORP}
      />

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
        .wpm-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          width: 100%;
          height: 6px;
          cursor: pointer;
        }
        .wpm-slider::-webkit-slider-runnable-track { width: 100%; height: 2px; background: #1a1a1a; border-radius: 1px; }
        .wpm-slider::-moz-range-track { width: 100%; height: 2px; background: #1a1a1a; border-radius: 1px; }
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
        .wpm-slider:active::-webkit-slider-thumb { transform: scale(1.15); box-shadow: 0 0 12px rgba(245, 158, 11, 0.6), 0 0 6px rgba(255, 255, 255, 0.3); }
        .wpm-slider:active::-moz-range-thumb { transform: scale(1.15); box-shadow: 0 0 12px rgba(245, 158, 11, 0.6), 0 0 6px rgba(255, 255, 255, 0.3); }
        .wpm-slider:hover::-webkit-slider-thumb { box-shadow: 0 0 10px rgba(245, 158, 11, 0.5), 0 0 5px rgba(255, 255, 255, 0.25); }
        .wpm-slider:hover::-moz-range-thumb { box-shadow: 0 0 10px rgba(245, 158, 11, 0.5), 0 0 5px rgba(255, 255, 255, 0.25); }
      `}</style>
    </div>
  );
}
