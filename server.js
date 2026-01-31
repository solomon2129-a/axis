const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

// ---------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------
// Parse JSON bodies (already used by the Groq proxy)
app.use(express.json());
// Parse URL‑encoded form bodies (required for login / signup POSTs)
app.use(express.urlencoded({ extended: true }));

// Serve static files from project root
// Serve static assets (CSS, JS, images, etc.) from the project root
app.use(express.static(path.join(__dirname)));

// ---------------------------------------------------------------------
// Server‑side routing – each route returns its own HTML file.
// This provides a clean, production‑grade flow without relying on SPA hacks.
// ---------------------------------------------------------------------
app.get('/', (req, res) => {
  // Start / intro page – includes the scramble animation.
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  // Login page – no intro animation.
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  // Signup page – no intro animation.
  res.sendFile(path.join(__dirname, 'signup.html'));
});

// Endpoint to expose Firebase client config from environment variables
app.get('/api/firebase-config', (req, res) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
  };

  // Keep response minimal and JSON only
  return res.json({ success: true, config });
});

  // ---------------------------------------------------------------------
  // Authentication routes (server‑side handling)
  // ---------------------------------------------------------------------
  // NOTE: The client‑side forms will POST to these endpoints. On success we
  // redirect to a protected dashboard page. On failure we re‑render the same
  // page with a simple error message (the client can display it).

  // POST /login – expects `email` and `password` fields.
  app.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      // Missing fields – redirect back to login with error
      console.log('[Login] Missing email or password');
      return res.redirect('/login');
    }
    try {
      // For demo: accept any non-empty credentials.
      // In production, verify against Firebase Admin SDK.
      console.log('[Login] Accepted credentials for:', email);
      // Use 303 (See Other) to ensure POST→GET redirect for browser form submission.
      return res.status(303).location('/dashboard').end();
    } catch (e) {
      console.error('[Login] Error', e);
      return res.redirect('/login');
    }
  });

  // POST /signup – expects `name`, `email`, `password`, `confirm` fields.
  app.post('/signup', async (req, res) => {
    const { name, email, password, confirm } = req.body || {};
    if (!name || !email || !password || !confirm || password !== confirm) {
      console.log('[Signup] Missing or mismatched fields');
      return res.redirect('/signup');
    }
    try {
      // For demo: accept any valid input.
      // In production, create user via Firebase Admin SDK.
      console.log('[Signup] Accepted signup for:', email);
      return res.status(303).location('/dashboard').end();
    } catch (e) {
      console.error('[Signup] Error', e);
      return res.redirect('/signup');
    }
  });

  // GET /dashboard – placeholder page shown after successful auth.
  app.get('/dashboard', (req, res) => {
    // In a real app you would verify the session / token here.
    return res.sendFile(path.join(__dirname, 'dashboard.html'));
  });


app.post("/api/grox", async (req, res) => {
  console.log("Request received at /api/grox");
  
  if (!GROQ_API_KEY) {
    console.error("No GROQ_API_KEY");
    return res.status(500).json({ success: false, error: "GROQ_API_KEY not set on server" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    console.error("Missing prompt");
    return res.status(400).json({ success: false, error: "Missing prompt" });
  }

  try {
    console.log("Calling Groq at:", GROQ_API_URL);
    console.log("Prompt:", prompt);
    // System prompt tells Groq to extract tasks as JSON array with detailed descriptions
    const systemPrompt = `IMPORTANT: You must respond with ONLY a JSON array of strings. No other text. No markdown. Just JSON.

["Create a logo for Vynce with modern design", "Design landing page mockups", "Setup Firebase database"]

User will provide journal text. Extract actionable tasks with full context and details. 
Include WHO/WHAT/WHERE details to make each task clear and understandable when read later.
Keep tasks detailed but concise (one short sentence each).
Return an empty array if no tasks found. Return ONLY the JSON array, no other text.`;

    // Groq uses OpenAI-compatible chat completions API
    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.2,
    };

    const fetchFn = globalThis.fetch || require("node-fetch");

    const upstream = await fetchFn(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("Upstream error:", text);
      return res.status(502).json({ success: false, error: "Upstream error", detail: text });
    }

    const json = await upstream.json();

    // Extract the assistant's response
    let assistantMessage = json.choices?.[0]?.message?.content || "{}";
    console.log("Groq response:", assistantMessage);
    
    // Strip markdown code blocks if present (e.g., ```json ... ```)
    assistantMessage = assistantMessage.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    console.log("Cleaned response:", assistantMessage);
    
    // Parse the JSON response
    let tasks;
    try {
      tasks = JSON.parse(assistantMessage);
      console.log("Parsed tasks type:", typeof tasks, "is array:", Array.isArray(tasks));
      
      // Ensure it's an array
      if (!Array.isArray(tasks)) {
        console.warn("Tasks is not an array, received:", tasks);
        // If it's an object with today/overall, flatten it
        if (tasks && typeof tasks === 'object' && (tasks.today || tasks.overall)) {
          console.log("Converting legacy format to array");
          tasks = [...(tasks.today || []), ...(tasks.overall || [])];
        } else {
          console.warn("Could not convert tasks to array format");
          tasks = [];
        }
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", assistantMessage, parseErr);
      return res.status(502).json({ success: false, error: "Invalid AI response format", raw: assistantMessage });
    }

    console.log("Final tasks to return:", tasks);
    return res.json({ success: true, tasks, meta: { model: json.model, usage: json.usage } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// Catch-all route: serve index.html for client-side routing
// This enables the SPA to handle routes like /journal, /tasks, etc.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
