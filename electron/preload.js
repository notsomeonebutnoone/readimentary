// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  // User ID
  getUserId: () => ipcRenderer.invoke('user:getId'),

  // Library
  getLibrary: () => ipcRenderer.invoke('library:getAll'),
  saveBook: (book) => ipcRenderer.invoke('library:save', book),
  deleteBook: (bookId) => ipcRenderer.invoke('library:delete', bookId),

  // Chapters
  getChapters: (bookId) => ipcRenderer.invoke('chapters:get', bookId),
  saveChapter: (chapter) => ipcRenderer.invoke('chapters:save', chapter),

  // Progress
  getProgress: (bookId, chapterId) => ipcRenderer.invoke('progress:get', bookId, chapterId),
  setProgress: (prog) => ipcRenderer.invoke('progress:set', prog),

  // PDF file operations
  savePdf: (bookId, arrayBuffer) => ipcRenderer.invoke('files:savePdf', bookId, arrayBuffer),
  loadPdf: (bookId) => ipcRenderer.invoke('files:loadPdf', bookId),
  deletePdf: (bookId) => ipcRenderer.invoke('files:deletePdf', bookId),

  // Dialogs
  openPdfDialog: () => ipcRenderer.invoke('dialog:openPdf'),

  // Analytics
  getAnalytics: (userId) => ipcRenderer.invoke('analytics:get', userId),
  setAnalytics: (userId, analytics) => ipcRenderer.invoke('analytics:set', userId, analytics),
});
