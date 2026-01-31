# Axis (v1)

Axis is a lightweight journaling → task extraction tool built with **plain HTML, CSS, and JavaScript**.

Flow: write freely → click **Generate Tasks** → get clear next actions → leave and do the work.

## Features

- Clean, calm, dark UI (daily-use)
- Large writing area
- Save entries with date + time (persist after refresh)
- Previous entries list (newest first)
  - Click an entry to load it back into the editor
  - Delete individual entries
  - Clear all (with confirmation)
- Offline “Generate Tasks” (simulated)
  - Produces short, verb-first tasks
  - Splits into Today / Overall / (Sneakout if relevant)

## How journaling works

- Write in the editor.
- Click **Save entry** to create a new entry (or update the currently loaded one).
- Click an entry in **Previous entries** to load it back into the editor.
- Click **New entry** to clear the editor and start fresh.

## How task extraction works (offline)

Axis includes a **simulated** task engine (no network calls).

When you click **Generate Tasks**, the app:
- Reads the current editor text
- Rewrites it into short, actionable, verb-first tasks
- Classifies urgent/time-bound items into **Today’s Tasks**
- Classifies the rest into **Overall Tasks**
- If startup/Sneakout work is mentioned, isolates those into **Sneakout Tasks**

## Data storage (localStorage)

Everything stays in your browser using `localStorage`:

- `axis.entries.v1`: your saved entries (text + timestamps)
- `axis.draft.v1`: your current in-progress draft (saved automatically while typing)
- `axis.selectedId.v1`: which entry (if any) is currently loaded

Clearing your browser storage or using a different browser/device will result in a fresh, empty journal.

## Running the project

### Option A: Open directly

Open `index.html` in your browser.

### Option B: Run a local static server (recommended)

If you have Node.js installed, you can use a tiny server:

1. Install `serve` (once):

   ```bash
   npm install -g serve
   ```

2. From this project directory, run:

   ```bash
   serve .
   ```

## Groq AI integration (optional)

To enable the Groq journaling agent for AI-powered task extraction, follow these steps:

1. Copy `.env.example` to `.env` and paste your Groq API key into `GROQ_API_KEY`:

```bash
cp .env.example .env
# edit .env and paste your key
```

2. Install dependencies:

```bash
npm install
```

3. Run the local server (serves files + `/api/grox` proxy):

```bash
npm run dev
```

4. Open the printed URL (usually `http://localhost:3000`) in your browser and use **Generate Tasks** — the app will call the local `/api/grox` proxy, which forwards requests to the Groq API using your key. If the proxy fails, the app falls back to the built-in offline extractor.

Notes:
- Do not commit `.env` containing `GROQ_API_KEY` to version control.
- If you have a custom Groq API base URL, set `GROQ_API_URL` in `.env`.

# axis
