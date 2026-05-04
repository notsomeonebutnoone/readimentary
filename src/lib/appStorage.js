// src/lib/appStorage.js

const getLibraryKey = (userId) => `rsvp_library_${userId}`;
const getAnalyticsKey = (userId) => `rsvp_analytics_${userId}`;
const SETTINGS_KEY = 'rsvp_settings_v4';

export const createDefaultAnalytics = () => ({
  totalReadingMs: 0,
  totalWordsAdvanced: 0,
  totalSessions: 0,
  dailyMs: {}
});

export const getUserId = () => {
  let userId = localStorage.getItem('rsvp_userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('rsvp_userId', userId);
  }
  return userId;
};

export const getUserEmail = () => localStorage.getItem('rsvp_userEmail') || null;

export const saveSettings = (settings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

export const loadSettings = () => {
  const defaults = { wpm: 350, fontSize: 56, fontFamily: 'ui-serif', showORP: true };
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
};

export const saveAnalytics = (userId, analytics) => {
  try {
    localStorage.setItem(getAnalyticsKey(userId), JSON.stringify(analytics));
  } catch (e) {
    console.error('Failed to save analytics:', e);
  }
};

export const loadAnalytics = (userId) => {
  try {
    const stored = localStorage.getItem(getAnalyticsKey(userId));
    const defaults = createDefaultAnalytics();
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch (e) {
    console.error('Failed to load analytics:', e);
    return createDefaultAnalytics();
  }
};

export const saveLibrary = (userId, library) => {
  try {
    const safe = (library || []).map((b) => {
      if (!b) return b;
      const rest = { ...b };
      delete rest.pdfData;
      delete rest.pdfUrl;
      return rest;
    });
    localStorage.setItem(getLibraryKey(userId), JSON.stringify(safe));
  } catch (e) {
    console.error('Failed to save library:', e);
  }
};

export const loadLibrary = (userId) => {
  try {
    const stored = localStorage.getItem(getLibraryKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load library:', e);
    return [];
  }
};
