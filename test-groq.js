require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function test() {
  const systemPrompt = `IMPORTANT: You must respond with ONLY a JSON object. No other text. No markdown. Just JSON.

{
  "today": ["task 1", "task 2"],
  "overall": ["task 3", "task 4"],
  "sneakout": ["task 5"]
}

Categories:
- "today": urgent, time-bound, or marked as "due today", "tonight", "asap"
- "overall": general, non-urgent work
- "sneakout": work related to events, partnerships, tickets, startups, or venues

User will provide journal text. Extract short, actionable, verb-first tasks. Return empty arrays if no tasks fit a category.`;

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: "Buy milk today. Email slides to team. Schedule meeting with Alice about Q1." },
    ],
    max_tokens: 512,
    temperature: 0.2,
  };

  try {
    const fetch = globalThis.fetch || require("node-fetch");
    const resp = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Error:", text);
      return;
    }

    const json = await resp.json();
    let msg = json.choices?.[0]?.message?.content || "";
    console.log("Raw response:", msg);

    // Strip markdown
    msg = msg.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    console.log("Cleaned:", msg);

    // Try to parse
    try {
      const tasks = JSON.parse(msg);
      console.log("✓ Successfully parsed:", JSON.stringify(tasks, null, 2));
    } catch (parseErr) {
      console.error("✗ Failed to parse JSON:", parseErr.message);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
