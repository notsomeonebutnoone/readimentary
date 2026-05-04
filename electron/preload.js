import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  getUserId: () => ipcRenderer.invoke('user:getId'),

  getLibrary: () => ipcRenderer.invoke('library:getAll'),
  saveBook: (book) => ipcRenderer.invoke('library:save', book),
  deleteBook: (bookId) => ipcRenderer.invoke('library:delete', bookId),

  getChapters: (bookId) => ipcRenderer.invoke('chapters:get', bookId),
  saveChapter: (chapter) => ipcRenderer.invoke('chapters:save', chapter),

  getProgress: (bookId, chapterId) => ipcRenderer.invoke('progress:get', bookId, chapterId),
  setProgress: (prog) => ipcRenderer.invoke('progress:set', prog),

  savePdf: (bookId, arrayBuffer) => ipcRenderer.invoke('files:savePdf', bookId, arrayBuffer),
  loadPdf: (bookId) => ipcRenderer.invoke('files:loadPdf', bookId),
  deletePdf: (bookId) => ipcRenderer.invoke('files:deletePdf', bookId),

  openPdfDialog: () => ipcRenderer.invoke('dialog:openPdf'),

  getAnalytics: (userId) => ipcRenderer.invoke('analytics:get', userId),
  setAnalytics: (userId, analytics) => ipcRenderer.invoke('analytics:set', userId, analytics),
});
