import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app/AppShell";
import { store, type Scan } from "@/lib/storage";
import { Camera, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Growth Tracking — NatureLens AI" }] }),
  validateSearch: z.object({ scanId: z.string().optional() }),
  component: Growth,
});

async function compress(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
  const max = 800; const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}

function Growth() {
  const { scanId } = Route.useSearch();
  const [scans, setScans] = useState<Scan[]>([]);
  const [selected, setSelected] = useState<string | undefined>(scanId);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = () => setScans(store.list());
    r(); window.addEventListener("naturelens:update", r);
    return () => window.removeEventListener("naturelens:update", r);
  }, []);
  useEffect(() => { if (!selected && scans[0]) setSelected(scans[0].id); }, [scans, selected]);

  const current = scans.find((s) => s.id === selected);

  const onAdd = async (f?: File) => {
    if (!f || !current) return;
    try {
      const dataUrl = await compress(f);
      store.addGrowth(current.id, { imageDataUrl: dataUrl });
      toast.success("Growth entry added");
    } catch { toast.error("Could not add image"); }
  };

  return (
    <AppShell title="Growth Tracking" subtitle="Compare progress over time">
      {scans.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Scan something first to track its growth.</div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {scans.map((s) => (
              <button key={s.id} onClick={() => setSelected(s.id)}
                className={`flex-shrink-0 glass rounded-2xl p-2 flex items-center gap-2 ${selected === s.id ? "ring-2 ring-primary" : ""}`}>
                <img src={s.imageDataUrl} alt="" className="size-10 rounded-lg object-cover" />
                <span className="text-xs font-medium pr-2">{s.commonName}</span>
              </button>
            ))}
          </div>

          {current && (
            <>
              <div className="mt-4 glass rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{current.commonName}</h3>
                    <p className="text-xs text-muted-foreground">{(current.growth?.length || 0) + 1} entries</p>
                  </div>
                  <button onClick={() => inputRef.current?.click()} className="gradient-primary text-white rounded-full size-12 flex items-center justify-center shadow-glow">
                    <Plus className="size-5" />
                  </button>
                </div>
              </div>
              <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onAdd(e.target.files?.[0] || undefined)} />

              <div className="mt-4 space-y-3">
                <Entry date={current.createdAt} src={current.imageDataUrl} label="Initial scan" />
                {(current.growth || []).map((g, i) => (
                  <Entry key={i} date={g.date} src={g.imageDataUrl} label={`Update #${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}

function Entry({ date, src, label }: { date: number; src: string; label: string }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <img src={src} alt={label} className="w-full aspect-video object-cover" />
      <div className="p-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</p>
      </div>
    </div>
  );
}