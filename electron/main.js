// electron/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const Database = require('better-sqlite3');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  const startURL = isDev
    ? 'http://localhost:5173' // Vite dev server default
    : `file://${path.join(app.getAppPath(), 'dist', 'index.html')}`;
  mainWindow.loadURL(startURL);
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'library.db');
  db = new Database(dbPath);
  // Create tables if not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      filePath TEXT,
      totalWords INTEGER,
      createdAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT,
      bookId TEXT,
      title TEXT,
      startWordIndex INTEGER,
      endWordIndex INTEGER,
      PRIMARY KEY (id, bookId)
    );
    CREATE TABLE IF NOT EXISTS progress (
      bookId TEXT,
      chapterId TEXT,
      wordIndex INTEGER,
      updatedAt INTEGER,
      PRIMARY KEY (bookId, chapterId)
    );
  `);
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  // Settings (JSON file)
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');

  ipcMain.handle('settings:get', async () => {
    try {
      const data = await fs.promises.readFile(settingsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Return defaults if file missing
      return { wpm: 350, fontSize: 56, fontFamily: 'ui-serif', showORP: true };
    }
  });

  ipcMain.handle('settings:set', async (event, settings) => {
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  });

  // User ID (simple file storage)
  const userIdPath = path.join(app.getPath('userData'), 'userId.txt');
  ipcMain.handle('user:getId', async () => {
    try {
      return await fs.promises.readFile(userIdPath, 'utf-8');
    } catch {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await fs.promises.writeFile(userIdPath, id, 'utf-8');
      return id;
    }
  });

  // Library CRUD (SQLite)
  ipcMain.handle('library:getAll', async () => {
    const rows = db.prepare('SELECT * FROM books').all();
    return rows;
  });

  ipcMain.handle('library:save', async (event, book) => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO books (id, title, filePath, totalWords, createdAt) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(book.id, book.title, book.filePath, book.totalWords, book.createdAt || Date.now());
    return true;
  });

  ipcMain.handle('library:delete', async (event, bookId) => {
    db.prepare('DELETE FROM books WHERE id = ?').run(bookId);
    // also delete related chapters and progress
    db.prepare('DELETE FROM chapters WHERE bookId = ?').run(bookId);
    db.prepare('DELETE FROM progress WHERE bookId = ?').run(bookId);
    return true;
  });

  // Chapters CRUD
  ipcMain.handle('chapters:get', async (event, bookId) => {
    return db.prepare('SELECT * FROM chapters WHERE bookId = ?').all(bookId);
  });

  ipcMain.handle('chapters:save', async (event, chapter) => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO chapters (id, bookId, title, startWordIndex, endWordIndex) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(chapter.id, chapter.bookId, chapter.title, chapter.startWordIndex, chapter.endWordIndex);
    return true;
  });

  // Progress CRUD
  ipcMain.handle('progress:get', async (event, bookId, chapterId) => {
    const row = db.prepare('SELECT * FROM progress WHERE bookId = ? AND chapterId = ?').get(bookId, chapterId);
    return row || null;
  });

  ipcMain.handle('progress:set', async (event, prog) => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO progress (bookId, chapterId, wordIndex, updatedAt) VALUES (?, ?, ?, ?)`);
    stmt.run(prog.bookId, prog.chapterId, prog.wordIndex, prog.updatedAt || Date.now());
    return true;
  });

  // File operations for PDFs
  const booksDir = path.join(app.getPath('userData'), 'books');
  fs.mkdirSync(booksDir, { recursive: true });

  ipcMain.handle('files:savePdf', async (event, bookId, arrayBuffer) => {
    const filePath = path.join(booksDir, `${bookId}.pdf`);
    await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));
    return filePath;
  });

  ipcMain.handle('files:loadPdf', async (event, bookId) => {
    const filePath = path.join(booksDir, `${bookId}.pdf`);
    try {
      const data = await fs.promises.readFile(filePath);
      return data.buffer; // Return ArrayBuffer
    } catch {
      return null;
    }
  });

  ipcMain.handle('files:deletePdf', async (event, bookId) => {
    const filePath = path.join(booksDir, `${bookId}.pdf`);
    await fs.promises.unlink(filePath).catch(() => {});
    return true;
  });

  // Open file dialog for PDF import
  ipcMain.handle('dialog:openPdf', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
      properties: ['openFile']
    });
    if (canceled) return null;
    return filePaths[0];
  });

  // Analytics storage (simple JSON file)
  const analyticsPath = path.join(app.getPath('userData'), 'analytics.json');
  ipcMain.handle('analytics:get', async (event, userId) => {
    try {
      const raw = await fs.promises.readFile(analyticsPath, 'utf-8');
      const all = JSON.parse(raw);
      return all[userId] || null;
    } catch {
      return null;
    }
  });
  ipcMain.handle('analytics:set', async (event, userId, analytics) => {
    let all = {};
    try {
      const raw = await fs.promises.readFile(analyticsPath, 'utf-8');
      all = JSON.parse(raw);
    } catch {
      // Ignore missing or corrupt analytics files and recreate them below.
    }
    all[userId] = analytics;
    await fs.promises.writeFile(analyticsPath, JSON.stringify(all, null, 2), 'utf-8');
    return true;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
