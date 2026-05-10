import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/AppShell";
import { knowledgeLookup } from "@/lib/ai.functions";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge — NatureLens AI" }] }),
  component: Knowledge,
});

const SUGGESTIONS = ["Monstera deliciosa", "Snake plant", "Betta fish", "Neon tetra", "Goldfish care", "Orchid"];

function Knowledge() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState("");
  const lookup = useServerFn(knowledgeLookup);

  const search = async (term?: string) => {
    const query = (term ?? q).trim();
    if (!query) return;
    setQ(query); setBusy(true); setContent("");
    try {
      const { content } = await lookup({ data: { query } });
      setContent(content);
    } catch (e: any) { toast.error(e?.message || "Lookup failed"); }
    finally { setBusy(false); }
  };

  return (
    <AppShell title="Knowledge" subtitle="Search any plant or fish">
      <div className="glass rounded-full p-1.5 flex items-center gap-2">
        <Search className="size-4 ml-3 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. Monstera, Betta fish…" className="flex-1 bg-transparent outline-none text-sm" />
        <button onClick={() => search()} className="gradient-primary text-white text-sm font-semibold rounded-full px-4 py-2">Go</button>
      </div>

      {!content && !busy && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => search(s)} className="glass rounded-full px-3 py-1.5 text-xs">{s}</button>
            ))}
          </div>
        </div>
      )}

      {busy && <div className="mt-8 flex justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>}

      {content && (
        <article className="mt-4 glass rounded-2xl p-5 prose prose-sm max-w-none whitespace-pre-wrap text-sm">
          {content}
        </article>
      )}
    </AppShell>
  );
}