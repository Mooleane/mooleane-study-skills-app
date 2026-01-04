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

function buildPrompt(payload) {
  const moods = Array.isArray(payload?.moods) ? payload.moods : [];
  const taskCounts = payload?.taskCounts ?? {};
  const topCategory = String(payload?.topCategory ?? "").trim();
  const hasUpcomingAssignment = Boolean(payload?.hasUpcomingAssignment);

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

  return [
    "You are a helpful study-skills assistant.",
    "Return ONLY valid JSON in this exact shape (no extra keys, no markdown):",
    '{"moodCorrelations":["..."],"moodSummary":"...","quickCheck":{"mood":"...","balance":"...","tip":"..."}}',
    "Rules:",
    "- moodCorrelations: 2 to 5 short, data-based bullets.",
    "- moodSummary: ONE sentence, <= 12 words.",
    "- quickCheck.mood/balance/tip: each <= 10 words; tip is actionable and supportive.",
    "Inputs:",
    topCategory ? `- Top category: ${topCategory}` : "- Top category: (unknown)",
    `- Has upcoming assignment session: ${hasUpcomingAssignment ? "yes" : "no"}`,
    countsLines ? `Task counts:\n${countsLines}` : "Task counts: (none)",
    "Mood timeline:",
    moodLines || "(no entries)",
  ].join("\n");
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const payload = body?.payload ?? {};

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const prompt = buildPrompt(payload);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 420,
        messages: [
          { role: "system", content: "Return only JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const details = (await openaiRes.text()).slice(0, 800);
      return NextResponse.json(
        { error: "OpenAI request failed", details },
        { status: openaiRes.status }
      );
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const parsed = safeJsonParse(content) ?? {};

    const quick = parsed?.quickCheck ?? {};

    return NextResponse.json({
      generatedAt: Date.now(),
      moodCorrelations: clampArrayStrings(parsed?.moodCorrelations, 5),
      moodSummary:
        typeof parsed?.moodSummary === "string" ? parsed.moodSummary.trim() : "",
      quickCheck: {
        mood: typeof quick?.mood === "string" ? quick.mood.trim() : "",
        balance: typeof quick?.balance === "string" ? quick.balance.trim() : "",
        tip: typeof quick?.tip === "string" ? quick.tip.trim() : "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
