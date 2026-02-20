# Readimentary

Readimentary is a React + Vite web app for RSVP (Rapid Serial Visual Presentation) reading.
It lets you upload a PDF, extract its text, split content into chapters, and read one word at a time at controlled speed (WPM) with ORP (Optimal Recognition Point) highlighting.

## Highlights

- PDF upload and text extraction in-browser (no backend required).
- RSVP reading engine with play/pause, reset, and adjustable WPM.
- ORP-based word rendering to keep visual focus centered.
- Chapter detection and per-chapter progress tracking.
- Persistent local library:
  - metadata in `localStorage`
  - PDF blobs in `IndexedDB`
- Landing page + interactive demo reader.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- `lucide-react` icons
- `pdfjs-dist` / PDF.js for parsing and rendering
- `react-scroll` for landing-page section navigation

## Project Structure

```text
src/
  App.jsx                      # Main app: library, chapters, reader, settings
  Landing.jsx                  # Marketing/landing experience
  components/
    LibraryComponents.jsx      # Stats and library card UI
    Logo.jsx
  ScrollStack.jsx              # Scroll-based stacked card interactions
  index.css                    # Global styles + motion utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended current LTS)
- npm 9+

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## How to Use

1. Start the app and enter the reading workspace from the landing page.
2. Upload a PDF from the library screen.
3. Select a detected chapter.
4. Use play/pause and adjust WPM as needed.
5. Optionally tune typography and ORP highlight in settings.

## Data & Privacy

Readimentary currently stores user data locally in your browser:

- `localStorage`:
  - reader settings
  - library metadata
  - mock local user ID
- `IndexedDB`:
  - uploaded PDF blobs (for reload persistence)

No authentication backend is wired in this version; login UI is currently presentational.

## AI Integration Notes

The app includes Gemini helper functions for chapter summary/flashcards in `src/App.jsx`.
If you plan to use this in production, do not keep API keys in client code.

- Current placeholder key location: `src/App.jsx` (search for `const apiKey`).
- Recommended approach:
  - move AI calls to a backend service
  - keep real keys in server-side environment variables

## Known Limitations

- Chapter detection is heuristic-based and may need manual tuning for some PDFs.
- Complex PDFs (scanned pages, unusual layouts) may extract text imperfectly.
- Some UI/auth areas are prototype-level and not backed by server logic.
- A nested git entry named `readimentary` exists in repo history (mode `160000`), which may behave like a submodule depending on your clone state.

## Troubleshooting

- Push rejected on GitHub:
  - run `git pull --rebase origin main`
  - resolve conflicts
  - run `git push -u origin main`
- Git identity error:
  - `git config user.name "Your Name"`
  - `git config user.email "you@example.com"`

## Scripts

From `package.json`:

- `npm run dev` -> start Vite dev server
- `npm run build` -> create production build
- `npm run preview` -> preview production build
- `npm run lint` -> run ESLint

## Contributing

1. Fork or clone the repository.
2. Create a feature branch.
3. Make focused commits with clear messages.
4. Run lint/build locally before opening a PR.
5. Open a pull request with:
   - what changed
   - why it changed
   - how it was tested

## License

No license file is currently defined in this repository.
Add a `LICENSE` file (for example MIT) if you want explicit usage terms.
