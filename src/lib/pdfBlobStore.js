const PDF_DB_NAME = 'rsvp_pdf_store';
const PDF_STORE_NAME = 'pdf_blobs';

const openPdfDb = () =>
  new Promise((resolve, reject) => {
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

export const savePdfBlob = async (bookId, blob) => {
  const db = await openPdfDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, 'readwrite');
    tx.objectStore(PDF_STORE_NAME).put(blob, bookId);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

export const loadPdfBlob = async (bookId) => {
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

export const deletePdfBlob = async (bookId) => {
  const db = await openPdfDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, 'readwrite');
    tx.objectStore(PDF_STORE_NAME).delete(bookId);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};
