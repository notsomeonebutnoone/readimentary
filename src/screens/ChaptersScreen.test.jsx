/* @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ChaptersScreen from './ChaptersScreen.jsx';

const baseBook = {
  id: 'book-1',
  title: 'Sample Book',
  status: 'ready',
  words: Array.from({ length: 20 }, (_, index) => ({ text: `word-${index}` })),
  parsedPages: 4,
  totalPages: 4
};

const renderScreen = (bookOverrides = {}) => {
  const startChapter = vi.fn();
  const navigateTo = vi.fn();

  render(
    <ChaptersScreen
      currentBook={{ ...baseBook, ...bookOverrides }}
      chapterProgressMap={{}}
      startChapter={startChapter}
      navigateTo={navigateTo}
    />
  );

  return { startChapter, navigateTo };
};

afterEach(() => {
  cleanup();
});

describe('ChaptersScreen', () => {
  it('shows the no-chapters state with a read full document action', async () => {
    const { startChapter } = renderScreen({ chapters: [] });

    expect(screen.getByText('We couldn’t detect chapter headings in this document.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /read full document/i }));

    expect(startChapter).toHaveBeenCalledWith({
      id: 'book-1-full-document',
      title: 'Sample Book',
      startIndex: 0,
      wordCount: 20
    });
  });

  it('renders real chapters and starts a chapter from keyboard activation', async () => {
    const chapter = {
      id: 'ch-0-chapter-1',
      title: 'Chapter 1',
      startIndex: 0,
      wordCount: 20
    };
    const { startChapter } = renderScreen({ chapters: [chapter] });

    expect(screen.queryByText('We couldn’t detect chapter headings in this document.')).not.toBeInTheDocument();

    const chapterButton = screen.getByRole('button', { name: /open chapter 1/i });
    expect(chapterButton).toBeInTheDocument();

    chapterButton.focus();
    fireEvent.click(chapterButton);

    expect(startChapter).toHaveBeenCalledWith(chapter);
  });
});
