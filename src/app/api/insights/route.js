import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function clampArrayStrings(value, maxLen) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, maxLen);
}

function buildPrompt(mode, payload) {
  const moods = Array.isArray(payload?.moods) ? payload.moods : [];
  const topCategory = String(payload?.topCategory ?? "").trim();
  const taskCounts = payload?.taskCounts ?? {};

  const moodLines = moods
    .slice(0, 30)
    .map((m) => {
      const date = String(m?.date ?? "").trim();
      const mood = String(m?.mood ?? "").trim();
      const note = String(m?.note ?? "").trim();
      return `- ${date} | ${mood}${note ? ` | ${note}` : ""}`;
    })
    .join("\n");

  const countsLines = Object.entries(taskCounts)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  if (mode === "moodCorrelations") {
    return [
      "You analyze a mood timeline and output ONLY valid JSON.",
      "Shape:",
      '{"bullets":["bullet 1","bullet 2"]}',
      "Rules:",
      "- 2 to 5 bullets",
      "- Bullets must be short, specific, and based on the data",
      "- No extra keys, no extra text",
      "Mood timeline:",
      moodLines || "(no entries)",
    ].join("\n");
  }

  if (mode === "moodSummary") {
    return [
      "Summarize the overall mood trend in ONE short sentence.",
      "Return ONLY valid JSON.",
      "Shape:",
      '{"summary":"..."}',
      "Rules:",
      "- <= 12 words",
      "- No extra keys, no extra text",
      "Mood timeline:",
      moodLines || "(no entries)",
    ].join("\n");
  }

  // quickCheck
  return [
    "You generate a quick dashboard check-in based on moods and planner balance.",
    "Return ONLY valid JSON.",
    "Shape:",
    '{"mood":"...","balance":"...","tip":"..."}',
    "Rules:",
    "- Each value must be short (<= 10 words)",
    "- Balance should reflect the top category if provided",
    "- Tip must be actionable and supportive",
    "Inputs:",
    topCategory ? `- Top category: ${topCategory}` : "- Top category: (unknown)",
    countsLines ? `Task counts:\n${countsLines}` : "Task counts: (none)",
    "Mood timeline:",
    moodLines || "(no entries)",
  ].join("\n");
}

async function callOpenAI({ apiKey, model, prompt }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: "system", content: "Return only JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  return res;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode ?? "").trim();
    const payload = body?.payload ?? {};

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const prompt = buildPrompt(mode, payload);

    const openaiRes = await callOpenAI({ apiKey, model, prompt });
    if (!openaiRes.ok) {
      const details = (await openaiRes.text()).slice(0, 500);
      return NextResponse.json(
        { error: "OpenAI request failed", details },
        { status: openaiRes.status }
      );
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const parsed = safeJsonParse(content) ?? {};

    if (mode === "moodCorrelations") {
      return NextResponse.json({
        bullets: clampArrayStrings(parsed?.bullets, 5),
      });
    }

    if (mode === "moodSummary") {
      const summary = typeof parsed?.summary === "string" ? parsed.summary.trim() : "";
      return NextResponse.json({ summary });
    }

    // quickCheck
    return NextResponse.json({
      mood: typeof parsed?.mood === "string" ? parsed.mood.trim() : "",
      balance: typeof parsed?.balance === "string" ? parsed.balance.trim() : "",
      tip: typeof parsed?.tip === "string" ? parsed.tip.trim() : "",
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
