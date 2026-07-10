# Readimentary

<p align="center">
  <a href="https://react.dev/" target="_blank" rel="noreferrer">
    <img alt="React" src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB">
  </a>
  <a href="https://vite.dev/" target="_blank" rel="noreferrer">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white">
  </a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer">
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white">
  </a>
  <a href="./LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</p>

<p align="center">
  <b>RSVP reading for speed, focus, and flow.</b><br/>
  Upload PDFs, detect chapters, and read one word at a time with ORP highlighting.
</p>

<p align="center">
  <a href="#-getting-started">🚀 Quick Start</a> •
  <a href="#-how-to-use">📖 Usage</a> •
  <a href="#-scripts">📜 Scripts</a> •
  <a href="#-license">📄 License</a>
</p>

---

## Quick Links

- [✨ Highlights](#-highlights)
- [🧰 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📖 How to Use](#-how-to-use)
- [🔒 Data and Privacy](#-data--privacy)
- [⚠️ Known Limitations](#-known-limitations)
- [🛠️ Troubleshooting](#-troubleshooting)

## ✨ Highlights

- PDF upload and text extraction in-browser (no backend required).
- RSVP reading engine with play/pause, reset, and adjustable WPM.
- ORP-based word rendering to keep visual focus centered.
- Chapter detection and per-chapter progress tracking.
- Persistent local library:
  - metadata in `localStorage`
  - PDF blobs in `IndexedDB`
- Landing page + interactive demo reader.

> Tip: This project runs fully in the browser for the core reading flow.

## 🎛️ At a Glance

| Mode | Description | Status |
|---|---|---|
| Library | Upload/select books and manage your reading collection | ✅ Ready |
| Chapters | Auto-detected chapter list with progress tracking | ✅ Ready |
| Reader | RSVP playback with ORP focus and WPM controls | ✅ Ready |
| AI Helpers | Summary / flashcard stubs for chapter context | ⚠️ Prototype |

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite 7 |
| Styling | Tailwind CSS 4 |
| PDF Processing | `pdfjs-dist` / PDF.js |
| UI Utilities | `lucide-react`, `react-scroll` |

## 🗂️ Project Structure

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

## 🚀 Getting Started

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

---

## 📖 How to Use

1. Start the app and enter the reading workspace from the landing page.
2. Upload a PDF from the library screen.
3. Select a detected chapter.
4. Use play/pause and adjust WPM as needed.
5. Optionally tune typography and ORP highlight in settings.

### 🧭 Reading Flow

`Upload PDF` -> `Parse Text` -> `Detect Chapters` -> `Start RSVP` -> `Track Progress`

## 🔒 Data & Privacy

Readimentary currently stores user data locally in your browser:

- `localStorage`:
  - reader settings
  - library metadata
  - mock local user ID
- `IndexedDB`:
  - uploaded PDF blobs (for reload persistence)

PDF bytes remain local (IndexedDB in the browser). Account identity, book-slot metadata,
and paid entitlement are handled by the API; passwords are scrypt-hashed and sessions
are signed JWTs stored in HttpOnly, SameSite cookies.

## API, authentication, and billing

Copy `.env.example` to `.env` in your process environment, configure provider/Stripe
credentials, then run the frontend and API in separate terminals:

```bash
npm run dev
npm run dev:api
```

The API uses Node's built-in SQLite module and requires Node.js 22.5 or newer.

Register these OAuth callbacks:

- Google: `http://localhost:8787/api/auth/callback/google`
- Apple: `http://localhost:8787/api/auth/callback/apple`

Forward Stripe events to `http://localhost:8787/api/webhooks/stripe`. The API accepts
`checkout.session.completed` and `invoice.paid`; Stripe signature verification is
required. The free entitlement is enforced transactionally at book registration:
one book per account unless `users.is_paid` is true.

---

## 🤖 AI Integration Notes

The app includes Gemini helper functions for chapter summary/flashcards in `src/App.jsx`.
If you plan to use this in production, do not keep API keys in client code.

- Current placeholder key location: `src/App.jsx` (search for `const apiKey`).
- Recommended approach:
  - move AI calls to a backend service
  - keep real keys in server-side environment variables

---

## ⚠️ Known Limitations

- Chapter detection is heuristic-based and may need manual tuning for some PDFs.
- Complex PDFs (scanned pages, unusual layouts) may extract text imperfectly.
- Production deployments must provide strong JWT, OAuth, Apple client-secret, and Stripe secrets.
- A nested git entry named `readimentary` exists in repo history (mode `160000`), which may behave like a submodule depending on your clone state.

---

## 🛠️ Troubleshooting

- Push rejected on GitHub:
  - run `git pull --rebase origin main`
  - resolve conflicts
  - run `git push -u origin main`
- Git identity error:
  - `git config user.name "Your Name"`
  - `git config user.email "you@example.com"`

## 📜 Scripts

From `package.json`:

- `npm run dev` -> start Vite dev server
- `npm run build` -> create production build
- `npm run preview` -> preview production build
- `npm run lint` -> run ESLint

## 🛣️ Roadmap

- [x] Local PDF upload and chapter parsing
- [x] RSVP reader with adjustable WPM and ORP
- [x] Persisted local library and reading progress
- [ ] Server-backed authentication
- [ ] Backend AI integration (secure API keys)
- [ ] Multi-device sync

## 📄 License

This project is licensed under the MIT License.
