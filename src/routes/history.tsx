import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { store, type Scan } from "@/lib/storage";
import { Leaf, Fish } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — NatureLens AI" }] }),
  component: History,
});

function History() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [filter, setFilter] = useState<"all" | "plant" | "fish">("all");
  useEffect(() => {
    const r = () => setScans(store.list());
    r();
    window.addEventListener("naturelens:update", r);
    return () => window.removeEventListener("naturelens:update", r);
  }, []);
  const filtered = scans.filter((s) => filter === "all" || s.kind === filter);

  return (
    <AppShell title="History" subtitle="All your past scans, saved on this device">
      <div className="flex gap-2 mb-4">
        {(["all", "plant", "fish"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? "gradient-primary text-white shadow-glow" : "glass"}`}>
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No scans yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Link key={s.id} to="/result/$id" params={{ id: s.id }} className="glass rounded-2xl p-3 flex items-center gap-3">
              <img src={s.imageDataUrl} alt={s.commonName} className="size-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {s.kind === "fish" ? <Fish className="size-3 text-secondary" /> : <Leaf className="size-3 text-primary" />}
                  <p className="font-semibold truncate">{s.commonName}</p>
                </div>
                {s.scientificName && <p className="text-xs italic text-muted-foreground truncate">{s.scientificName}</p>}
                <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(s.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold gradient-text">{s.healthScore}</p>
                <p className="text-[10px] text-muted-foreground">health</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}