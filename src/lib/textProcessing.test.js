import { describe, expect, it } from 'vitest';
import { detectChaptersFromText } from './textProcessing.js';

describe('detectChaptersFromText', () => {
  it('does not create a fallback chapter when no headings are detected', () => {
    const chapters = detectChaptersFromText('This is a plain document.\nIt has paragraphs, but no structural headings.');

    expect(chapters).toEqual([]);
  });

  it('returns real chapters with deterministic ids and word counts', () => {
    const chapters = detectChaptersFromText([
      'Chapter 1',
      'First chapter words here.',
      'Chapter 2',
      'Second chapter words.'
    ].join('\n'));

    expect(chapters).toEqual([
      {
        id: 'ch-0-chapter-1',
        title: 'Chapter 1',
        startIndex: 0,
        wordCount: 6
      },
      {
        id: 'ch-1-chapter-2',
        title: 'Chapter 2',
        startIndex: 6,
        wordCount: 5
      }
    ]);
  });
});
