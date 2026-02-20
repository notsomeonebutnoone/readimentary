const calculateORP = (word) => {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
};

export const tokenizeText = (text) =>
  text
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((word) => ({
      text: word,
      orp: calculateORP(word)
    }));

export const detectChaptersFromText = (text) => {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const chapters = [];
  let wordCursor = 0;

  const chapterRegexes = [/^chapter\s+(\d+|[ivxlcdm]+)/i, /^part\s+(\d+|[ivxlcdm]+)/i];

  lines.forEach((line) => {
    if (chapterRegexes.some((r) => r.test(line)) || (line === line.toUpperCase() && line.length < 30)) {
      chapters.push({
        id: `ch-${chapters.length}-${Math.random()}`,
        title: line,
        startIndex: wordCursor
      });
    }
    wordCursor += line.split(/\s+/).length;
  });

  if (chapters.length === 0) {
    chapters.push({ id: 'ch-0', title: 'Start of Document', startIndex: 0 });
  }

  const totalWords = text.split(/\s+/).length;
  chapters.forEach((ch, i) => {
    const nextStart = chapters[i + 1]?.startIndex ?? totalWords;
    ch.wordCount = nextStart - ch.startIndex;
  });

  return chapters;
};
