import assert from 'node:assert/strict';
import { parseLoadedPdfProgressively } from '../src/lib/progressivePdfParserCore.js';

const pages = ['Page one is immediately readable', 'Page two arrives later', 'Final page completes metadata'];
const events = [];
const pdf = {
  numPages: pages.length,
  getPage: async (pageNumber) => ({
    getTextContent: async () => ({ items: pages[pageNumber - 1].split(' ').map((str) => ({ str })) })
  })
};

const result = await parseLoadedPdfProgressively(pdf, {
  onReady: (snapshot) => events.push({ type: 'ready', pages: snapshot.parsedPages, words: snapshot.words.length }),
  onProgress: (snapshot) => events.push({ type: 'progress', pages: snapshot.parsedPages, words: snapshot.words.length })
});

assert.deepEqual(events[0], { type: 'ready', pages: 1, words: 5 });
assert.deepEqual(events.filter((event) => event.type === 'progress').map((event) => event.pages), [1, 2, 3]);
assert.ok(events[3].words > events[1].words, 'word count must grow as later pages arrive');
assert.equal(result.parsedPages, 3);
assert.equal(result.status, 'ready');
console.log('Progressive parser verified: page 1 published first; page and word totals grew through completion.');
