// ─────────────────────────────────────────────
// Carrom League — AI Chat via OpenRouter
// ─────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const STORAGE_AI_KEY = "carromleague_openrouter_key";

/**
 * Get the OpenRouter API key from env var or localStorage.
 * Priority: NEXT_PUBLIC_OPENROUTER_KEY env var > localStorage fallback.
 */
function getApiKey(): string {
  const envKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY || "";
  if (envKey) return envKey;
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_AI_KEY) || "";
  }
  return "";
}

/** Save an API key to localStorage (for runtime config without env vars) */
export function saveAIKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_AI_KEY, key.trim());
  }
}

const SYSTEM_PROMPT = `You are Carrom League AI — a friendly, knowledgeable carrom tournament assistant.

You help with:
- Official carrom rules (ICF / All India Carrom Federation rules)
- Scoring: bucks calculation, queen coverage, coin counting
- Strategy tips for 2v2 doubles play
- Tournament format questions (round-robin, knockout brackets, seeding)
- General carrom history, technique (angles, rebounds, thumb/finger flick styles)

Keep answers concise (2-4 sentences max unless the user asks for detail).
Use a warm, sporty tone. If you don't know something, say so honestly.
Do NOT discuss topics unrelated to carrom or sports tournaments.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Send a message to the AI and get a response.
 * Maintains conversation history for multi-turn chat.
 */
export async function askAI(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const apiKey = getApiKey();
  if (!apiKey) {
    return "AI is not configured yet. Add your OpenRouter API key in the browser console: `localStorage.setItem('carromleague_openrouter_key', 'sk-or-v1-...')` and refresh.";
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://carromleague.vercel.app",
        "X-Title": "Carrom League",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter API error:", response.status, errorBody);
      return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return "I received an empty response. Please try asking again.";
    }

    return reply.trim();
  } catch (error) {
    console.error("AI request failed:", error);
    return "Network error — couldn't reach the AI service. Check your connection and try again.";
  }
}
