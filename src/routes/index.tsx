import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { store, type Scan, reminders } from "@/lib/storage";
import { Camera, Leaf, Fish, Sparkles, TrendingUp, Bell, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [tip, setTip] = useState("");
  useEffect(() => {
    const refresh = () => setScans(store.list());
    refresh();
    window.addEventListener("naturelens:update", refresh);
    const tips = [
      "Most houseplants prefer to dry slightly between waterings.",
      "Quarantine new fish for 2 weeks before adding to a tank.",
      "Yellow leaves often indicate overwatering, not underwatering.",
      "Stable water parameters matter more than perfect numbers.",
      "Wipe dust off leaves monthly — clean leaves photosynthesize better.",
    ];
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    return () => window.removeEventListener("naturelens:update", refresh);
  }, []);

  const plants = scans.filter((s) => s.kind === "plant").length;
  const fish = scans.filter((s) => s.kind === "fish").length;
  const avgHealth = scans.length ? Math.round(scans.reduce((a, s) => a + s.healthScore, 0) / scans.length) : 0;
  const upcoming = reminders.list().sort((a, b) => a.nextAt - b.nextAt).slice(0, 2);

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
          <Sparkles className="size-6 text-white" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Welcome to</p>
          <h1 className="text-2xl font-bold gradient-text leading-none">NatureLens AI</h1>
        </div>
      </div>

      <Link to="/scan" className="block">
        <div className="relative overflow-hidden rounded-3xl gradient-primary shadow-glow p-6 text-white animate-float">
          <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-sm opacity-90">Tap to start</p>
          <h2 className="text-2xl font-bold mt-1">Scan a plant or fish</h2>
          <p className="text-sm opacity-90 mt-1">Identify, diagnose & care in seconds.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur">
            <Camera className="size-4" /> Open camera
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <Stat icon={<Leaf className="size-4" />} label="Plants" value={plants} />
        <Stat icon={<Fish className="size-4" />} label="Fish" value={fish} />
        <Stat icon={<TrendingUp className="size-4" />} label="Health" value={`${avgHealth}%`} />
      </div>

      <Section title="Daily tip">
        <div className="glass rounded-2xl p-4 text-sm">{tip}</div>
      </Section>

      {upcoming.length > 0 && (
        <Section title="Upcoming reminders">
          <div className="space-y-2">
            {upcoming.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Bell className="size-4" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.nextAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Recent scans" right={<Link to="/history" className="text-xs text-primary font-medium flex items-center">All <ChevronRight className="size-3" /></Link>}>
        {scans.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
            No scans yet. Tap the camera to start.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {scans.slice(0, 4).map((s) => (
              <Link key={s.id} to="/result/$id" params={{ id: s.id }} className="glass rounded-2xl overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img src={s.imageDataUrl} alt={s.commonName} className="size-full object-cover" />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold truncate">{s.commonName}</p>
                  <p className="text-[10px] text-muted-foreground">{s.healthScore}% health</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Explore">
        <div className="grid grid-cols-2 gap-3">
          <NavCard to="/growth" title="Growth" subtitle="Track over time" />
          <NavCard to="/community" title="Community" subtitle="Tips & posts" />
        </div>
      </Section>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="text-xl font-bold mt-1 gradient-text">{value}</p>
    </div>
  );
}
function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
function NavCard({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
  return (
    <Link to={to} className="glass rounded-2xl p-4 block">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Link>
  );
}
