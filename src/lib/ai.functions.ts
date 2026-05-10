import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const ANALYZE_TOOL = {
  type: "function" as const,
  function: {
    name: "report",
    description: "Return identification, diagnosis, and care details.",
    parameters: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["plant", "fish", "unknown"] },
        commonName: { type: "string" },
        scientificName: { type: "string" },
        confidence: { type: "number", description: "0-100" },
        healthScore: { type: "number", description: "0-100" },
        summary: { type: "string" },
        diseases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              cause: { type: "string" },
              severity: { type: "string", enum: ["mild", "moderate", "severe"] },
              symptoms: { type: "array", items: { type: "string" } },
              treatment: { type: "array", items: { type: "string" } },
              prevention: { type: "array", items: { type: "string" } },
              recoveryDays: { type: "number" },
            },
            required: ["name", "cause", "severity", "symptoms", "treatment", "prevention"],
          },
        },
        care: {
          type: "object",
          properties: {
            light: { type: "string" }, water: { type: "string" }, soil: { type: "string" },
            humidity: { type: "string" }, temperature: { type: "string" }, ph: { type: "string" },
            tankSize: { type: "string" }, feeding: { type: "string" },
            extras: { type: "array", items: { type: "string" } },
          },
        },
      },
      required: ["kind", "commonName", "confidence", "healthScore", "summary", "diseases", "care"],
    },
  },
};

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((d: { imageDataUrl: string }) => d)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are NatureLens AI, an expert botanist and aquarist. Analyze the image and return a single tool call with detailed identification, disease diagnosis, and care guidance. Be specific. If the image isn't a plant or fish, set kind=unknown and explain in summary." },
          { role: "user", content: [
            { type: "text", text: "Identify this organism, diagnose any visible diseases or stress, and provide care guidance." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ] },
        ],
        tools: [ANALYZE_TOOL],
        tool_choice: { type: "function", function: { name: "report" } },
      }),
    });
    if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
    if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("AI returned no analysis");
    return JSON.parse(call.function.arguments);
  });

export const chatAboutScan = createServerFn({ method: "POST" })
  .inputValidator((d: {
    imageDataUrl?: string;
    context?: string;
    history: Array<{ role: "user" | "assistant"; content: string }>;
    message: string;
  }) => d)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const userContent: any[] = [{ type: "text", text: data.message }];
    if (data.imageDataUrl) userContent.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are NatureLens AI — a friendly expert in plants and fish care. Be concise, actionable, and clear. ${data.context ? "Scan context: " + data.context : ""}` },
          ...data.history,
          { role: "user", content: userContent },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json = await res.json();
    return { reply: json.choices?.[0]?.message?.content ?? "Sorry, no response." };
  });

export const knowledgeLookup = createServerFn({ method: "POST" })
  .inputValidator((d: { query: string }) => d)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a botanical and aquatic encyclopedia. Reply in clean markdown with sections: Overview, Habitat, Lifespan, Toxicity, Common Diseases, Care Tips, FAQs." },
          { role: "user", content: `Tell me about: ${data.query}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json = await res.json();
    return { content: json.choices?.[0]?.message?.content ?? "" };
  });