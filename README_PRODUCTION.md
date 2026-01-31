# Axis — Production-Ready Personal Productivity App

> Make sense of your thoughts. Let AI extract what matters.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Copy `.env.example` to `.env` and add your Groq API key:
```bash
GROQ_API_KEY=gsk_...
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

Get a free API key at [console.groq.com](https://console.groq.com)

### 3. Start the Server
```bash
npm start
# or
node server.js
```

Server runs on **http://localhost:3000**

---

## How It Works

### The Flow
1. **Journal** — Write freely about your day, thoughts, goals, or challenges
2. **Generate** — Click "Make Sense" to send to Groq AI
3. **Extract** — AI parses your journal and creates structured goals
4. **Track** — Check off goals as you complete them
5. **Regenerate** — Generate new goals anytime; your progress is saved

### Key Feature: Persistent State
When you regenerate goals, your completed checkmarks are preserved. The app uses semantic text matching to recognize that "Buy Milk!" is the same goal as "Buy milk" — even if the AI reworded it slightly.

---

## Architecture

### Modular Design
The codebase is organized into 5 independent modules for easy understanding and modification:

- **StorageModule** — Persistence to localStorage
- **DOMModule** — DOM element queries with caching
- **TextMatchingModule** — Semantic task matching for state preservation
- **TasksModule** — Task state management and rendering
- **GroqModule** — AI integration
- **UIModule** — High-level user interactions

See [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md) for detailed architecture documentation.

### Tech Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no build step)
- **Backend**: Express.js
- **AI**: Groq API (llama-3.3-70b-versatile model)
- **Storage**: Browser localStorage
- **Design**: Modern dark mode with glassmorphism

### File Structure
```
index.html              App structure (70 lines)
style.css              Modern design system (472 lines)
script.js              Modular JavaScript (532 lines)
server.js              Express proxy to Groq API
package.json           Dependencies and scripts
.env                   Groq API credentials
PRODUCTION_NOTES.md    Complete architecture guide
CSS_DESIGN_SYSTEM.md   Design token documentation
```

---

## Design System

**Modern Dark Dashboard Aesthetic**
- Deep charcoal background (#0f1015)
- Glassmorphism effects with backdrop blur
- Subtle gradient overlays for depth
- Blue accent color (#6b8eff) for actions
- Calm typography and generous spacing
- No harsh whites or jarring animations

See [CSS_DESIGN_SYSTEM.md](CSS_DESIGN_SYSTEM.md) for the complete design token system.

---

## Features

### ✅ Core Functionality
- [x] Two-page SPA (Journal → Tasks)
- [x] Groq AI integration for task extraction
- [x] Auto-save journal drafts
- [x] Persistent task state with completion tracking
- [x] Semantic task matching for state preservation
- [x] Mobile-responsive design
- [x] Keyboard shortcut (Cmd/Ctrl+Enter to generate)
- [x] Regenerate goals without losing progress

### ✅ Production Quality
- [x] Clean modular architecture
- [x] Comprehensive error handling
- [x] WCAG AA accessibility compliance
- [x] CSS custom properties for theming
- [x] Performance optimized (DOM caching, debouncing)
- [x] Mobile-first responsive design
- [x] ~35 KB total bundle size (uncompressed)

### 🚀 Easy to Extend
Due to modular design:
- Add habit tracking
- Integrate different AI models
- Add backend persistence
- Export goals as markdown/PDF
- Add voice input for journal entries

---

## Customization

### Change Accent Color
In `style.css`:
```css
:root {
  --accent: #6b8eff;  /* Change this */
}
```

### Modify Task Categories
Currently extracts: `today` and `overall` goals

To add a third category (e.g., `projects`):

1. Edit `server.js` system prompt to tell Groq to extract `projects`
2. Update `TasksModule.mergeWithOldState()` to process `projects`
3. Update `TasksModule.render()` to display `projects` section

### Switch AI Provider
Replace `GroqModule.generateTasks()` to call OpenAI, Claude, or another API:

```javascript
async function generateTasks(journalText) {
  const resp = await fetch("https://api.openai.com/...", {
    method: "POST",
    body: JSON.stringify({ ...yourPayload }),
  });
  return resp.json();
}
```

---

## Troubleshooting

### Goals not saving
- Clear browser cache and reload
- Check browser DevTools console for errors
- Verify localStorage is enabled

### Groq API errors
- Verify `.env` has valid `GROQ_API_KEY`
- Check server logs: `node server.js`
- Visit [console.groq.com](https://console.groq.com) to check API key status

### Styles not loading
- Hard refresh browser (Cmd+Shift+R on Mac)
- Verify `style.css` exists in project directory
- Check browser Network tab for 404 errors

### Text is hard to read
- Check your display color settings
- The design meets WCAG AA accessibility standards
- Try adjusting browser zoom if needed

---

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Safari 14+
- ✅ Firefox 85+
- ❌ Internet Explorer (no support)

---

## Performance

### Metrics
- **Initial load**: ~2 seconds
- **Task generation**: ~3-5 seconds (varies by journal length)
- **Page transition**: <300ms
- **Auto-save debounce**: 800ms

### Optimizations
- DOM element caching
- Debounced auto-save
- Minimal reflows (flexbox layout)
- Hardware-accelerated transforms
- No animations on scroll

---

## API Reference

### StorageModule
```javascript
StorageModule.getJournalDraft()      // Get saved journal text
StorageModule.saveJournalDraft(text) // Save journal text
StorageModule.getTasks()              // Get { today: [], overall: [] }
StorageModule.saveTasks(tasks)        // Save tasks object
StorageModule.clear()                 // Reset all storage
```

### TasksModule
```javascript
TasksModule.getState()                // Get current tasks state
TasksModule.setState(tasks)           // Update state
TasksModule.render(tasks)             // Render tasks to DOM
TasksModule.mergeWithOldState(new, old) // Preserve completion state
```

### UIModule
```javascript
UIModule.navigateToPage(name)         // Switch pages
UIModule.setStatus(message, options)  // Show status message
UIModule.handleMakeSense()            // Generate tasks
UIModule.handleRegenerate()           // Regenerate from current journal
```

---

## License

Open source. Built with ❤️ for focused productivity.

---

## Support

For issues or questions:
1. Check [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md) for architecture details
2. Review [CSS_DESIGN_SYSTEM.md](CSS_DESIGN_SYSTEM.md) for design tokens
3. Check browser console for error messages
4. Verify Groq API key in `.env`

---

## Philosophy

Axis is built on three core principles:

1. **Clarity** — Code is easy to understand and modify
2. **Calmness** — UI is peaceful and grounded, never flashy
3. **Continuity** — User progress is never lost, even on regeneration

The modular architecture ensures the codebase remains maintainable as it grows.
