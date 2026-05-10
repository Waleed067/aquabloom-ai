import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppShell } from "@/components/app/AppShell";
import { chatAboutScan } from "@/lib/ai.functions";
import { store, type Scan } from "@/lib/storage";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ scanId: z.string().optional() });

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chat — NatureLens AI" }] }),
  validateSearch: search,
  component: Chat,
});

type Msg = { role: "user" | "assistant"; content: string };

function Chat() {
  const { scanId } = Route.useSearch();
  const [scan, setScan] = useState<Scan | undefined>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useServerFn(chatAboutScan);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanId) setScan(store.get(scanId));
    setMessages([{ role: "assistant", content: scanId ? "I have the scan in context. Ask me anything about it!" : "Hi! I'm NatureLens AI. Ask me anything about plants or fish." }]);
  }, [scanId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const ctx = scan ? `${scan.commonName} (${scan.kind}). Health ${scan.healthScore}. Summary: ${scan.summary}.` : undefined;
      const { reply } = await ask({ data: { imageDataUrl: scan?.imageDataUrl, context: ctx, history: messages.slice(-8), message: text } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e?.message || "AI error");
    } finally { setBusy(false); }
  };

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-3">
        <div className="size-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"><Sparkles className="size-5 text-white" /></div>
        <div>
          <h1 className="text-lg font-bold gradient-text leading-none">AI Chat</h1>
          <p className="text-xs text-muted-foreground">{scan ? `About ${scan.commonName}` : "General assistant"}</p>
        </div>
      </div>

      <div ref={scrollRef} className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
        {scan && (
          <div className="glass rounded-2xl p-2 flex items-center gap-2">
            <img src={scan.imageDataUrl} alt="" className="size-12 rounded-xl object-cover" />
            <div className="text-xs">
              <p className="font-semibold">{scan.commonName}</p>
              <p className="text-muted-foreground">Health {scan.healthScore}%</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`${m.role === "user" ? "gradient-primary text-white" : "glass"} max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap`}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start"><div className="glass rounded-2xl px-4 py-2.5"><Loader2 className="size-4 animate-spin text-primary" /></div></div>
        )}
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-4">
        <div className="mx-auto max-w-md glass rounded-full p-1.5 flex items-center gap-2 shadow-elegant">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about care, disease, treatment…"
            className="flex-1 bg-transparent outline-none px-3 text-sm"
          />
          <button onClick={send} disabled={busy} className="size-10 rounded-full gradient-primary text-white flex items-center justify-center disabled:opacity-50">
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}