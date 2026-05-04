import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let db;

const isDev = !app.isPackaged;

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
    ? process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173'
    : pathToFileURL(path.join(app.getAppPath(), 'dist', 'index.html')).href;

  mainWindow.loadURL(startURL);
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'library.db');
  db = new Database(dbPath);
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

  const settingsPath = path.join(app.getPath('userData'), 'settings.json');

  ipcMain.handle('settings:get', async () => {
    try {
      const data = await fs.promises.readFile(settingsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { wpm: 350, fontSize: 56, fontFamily: 'ui-serif', showORP: true };
    }
  });

  ipcMain.handle('settings:set', async (event, settings) => {
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  });

  const userIdPath = path.join(app.getPath('userData'), 'userId.txt');
  ipcMain.handle('user:getId', async () => {
    try {
      return await fs.promises.readFile(userIdPath, 'utf-8');
    } catch {
      const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      await fs.promises.writeFile(userIdPath, id, 'utf-8');
      return id;
    }
  });

  ipcMain.handle('library:getAll', async () => db.prepare('SELECT * FROM books').all());

  ipcMain.handle('library:save', async (event, book) => {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO books (id, title, filePath, totalWords, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(book.id, book.title, book.filePath, book.totalWords, book.createdAt || Date.now());
    return true;
  });

  ipcMain.handle('library:delete', async (event, bookId) => {
    db.prepare('DELETE FROM books WHERE id = ?').run(bookId);
    db.prepare('DELETE FROM chapters WHERE bookId = ?').run(bookId);
    db.prepare('DELETE FROM progress WHERE bookId = ?').run(bookId);
    return true;
  });

  ipcMain.handle('chapters:get', async (event, bookId) => db.prepare('SELECT * FROM chapters WHERE bookId = ?').all(bookId));

  ipcMain.handle('chapters:save', async (event, chapter) => {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO chapters (id, bookId, title, startWordIndex, endWordIndex) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(chapter.id, chapter.bookId, chapter.title, chapter.startWordIndex, chapter.endWordIndex);
    return true;
  });

  ipcMain.handle('progress:get', async (event, bookId, chapterId) => {
    const row = db.prepare('SELECT * FROM progress WHERE bookId = ? AND chapterId = ?').get(bookId, chapterId);
    return row || null;
  });

  ipcMain.handle('progress:set', async (event, prog) => {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO progress (bookId, chapterId, wordIndex, updatedAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(prog.bookId, prog.chapterId, prog.wordIndex, prog.updatedAt || Date.now());
    return true;
  });

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
      return data.buffer;
    } catch {
      return null;
    }
  });

  ipcMain.handle('files:deletePdf', async (event, bookId) => {
    const filePath = path.join(booksDir, `${bookId}.pdf`);
    await fs.promises.unlink(filePath).catch(() => {});
    return true;
  });

  ipcMain.handle('dialog:openPdf', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
      properties: ['openFile'],
    });
    if (canceled) return null;
    return filePaths[0];
  });

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
      // Recreate the file if it does not exist or cannot be parsed.
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
