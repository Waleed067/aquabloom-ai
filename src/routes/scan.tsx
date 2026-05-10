import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/AppShell";
import { analyzeImage } from "@/lib/ai.functions";
import { store } from "@/lib/storage";
import { toast } from "sonner";
import { Camera, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Scan — NatureLens AI" }] }),
  component: Scan,
});

async function fileToCompressedDataURL(file: File, max = 1024): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function Scan() {
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const analyze = useServerFn(analyzeImage);

  const onPick = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      setPreview(dataUrl);
      setAnalyzing(true);
      const result = await analyze({ data: { imageDataUrl: dataUrl } });
      const id = crypto.randomUUID();
      store.add({ id, createdAt: Date.now(), imageDataUrl: dataUrl, ...result });
      navigate({ to: "/result/$id", params: { id } });
    } catch (e: any) {
      toast.error(e?.message || "Analysis failed");
      setAnalyzing(false);
    }
  };

  return (
    <AppShell title="Scan" subtitle="Capture or upload a photo of a plant or fish">
      <div className="glass rounded-3xl overflow-hidden">
        <div className="relative aspect-[4/5] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="size-full object-cover" />
              {analyzing && (
                <>
                  <div className="absolute inset-0 overflow-hidden"><div className="scan-line" /></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm">
                    <Loader2 className="size-10 text-primary animate-spin" />
                    <p className="mt-3 text-sm font-semibold gradient-text">AI analyzing…</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center px-6">
              <div className="mx-auto size-20 rounded-full gradient-primary shadow-glow flex items-center justify-center animate-float">
                <Sparkles className="size-10 text-white" />
              </div>
              <p className="mt-4 font-semibold">Powered by Gemini Vision</p>
              <p className="text-sm text-muted-foreground mt-1">Identifies species, detects diseases, and recommends care.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={analyzing}
          className="gradient-primary text-white rounded-2xl py-4 font-semibold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Camera className="size-5" /> Camera
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={analyzing}
          className="glass rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <ImageIcon className="size-5" /> Gallery
        </button>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPick(e.target.files?.[0] || undefined)} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || undefined)} />

      <div className="mt-6 glass rounded-2xl p-4 text-xs text-muted-foreground">
        💡 Tip: Get close, fill the frame, and use natural light for best accuracy.
      </div>
    </AppShell>
  );
}