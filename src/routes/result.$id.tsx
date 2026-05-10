import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { store, reminders, type Scan } from "@/lib/storage";
import { ArrowLeft, MessageCircle, TrendingUp, Trash2, Bell, Leaf, Fish, AlertTriangle, CheckCircle2, Droplets, Sun, Thermometer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/result/$id")({
  head: () => ({ meta: [{ title: "Result — NatureLens AI" }] }),
  component: Result,
});

function Result() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | undefined>(undefined);
  useEffect(() => { setScan(store.get(id)); }, [id]);

  if (!scan) return <AppShell title="Not found"><p className="text-sm text-muted-foreground">This scan no longer exists.</p></AppShell>;

  const KindIcon = scan.kind === "fish" ? Fish : Leaf;
  const healthColor = scan.healthScore >= 75 ? "text-success" : scan.healthScore >= 50 ? "text-warning" : "text-destructive";

  const addReminder = (title: string, days: number) => {
    reminders.add({ scanId: scan.id, title: `${title} — ${scan.commonName}`, intervalDays: days });
    toast.success("Reminder added");
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="glass size-10 rounded-xl flex items-center justify-center"><ArrowLeft className="size-5" /></Link>
        <button onClick={() => { store.remove(scan.id); navigate({ to: "/history" }); }} className="glass size-10 rounded-xl flex items-center justify-center text-destructive">
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-elegant">
        <div className="relative aspect-square">
          <img src={scan.imageDataUrl} alt={scan.commonName} className="size-full object-cover" />
          <div className="absolute top-3 left-3 glass rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
            <KindIcon className="size-3" /> {scan.kind}
          </div>
          <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs font-semibold">
            {Math.round(scan.confidence)}% match
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-bold">{scan.commonName}</h2>
          {scan.scientificName && <p className="text-sm italic text-muted-foreground">{scan.scientificName}</p>}
          <div className="mt-3 flex items-center gap-3">
            <div className={`text-3xl font-bold ${healthColor}`}>{scan.healthScore}</div>
            <div>
              <p className="text-xs text-muted-foreground">Health score</p>
              <p className="text-xs">{scan.healthScore >= 75 ? "Thriving" : scan.healthScore >= 50 ? "Needs attention" : "At risk"}</p>
            </div>
          </div>
          <p className="text-sm mt-3">{scan.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Link to="/chat" search={{ scanId: scan.id }} className="gradient-primary text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 shadow-glow">
          <MessageCircle className="size-4" /> Ask AI
        </Link>
        <Link to="/growth" search={{ scanId: scan.id }} className="glass rounded-2xl py-3 font-semibold flex items-center justify-center gap-2">
          <TrendingUp className="size-4" /> Track growth
        </Link>
      </div>

      {scan.diseases.length > 0 && (
        <Section title="Diagnosis">
          <div className="space-y-3">
            {scan.diseases.map((d, i) => (
              <div key={i} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`size-4 ${d.severity === "severe" ? "text-destructive" : d.severity === "moderate" ? "text-warning" : "text-success"}`} />
                  <h4 className="font-semibold">{d.name}</h4>
                  <span className="ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted">{d.severity}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1"><b>Cause:</b> {d.cause}</p>
                <List title="Symptoms" items={d.symptoms} />
                <List title="Treatment" items={d.treatment} />
                <List title="Prevention" items={d.prevention} />
                {d.recoveryDays && <p className="text-xs mt-2"><CheckCircle2 className="size-3 inline text-success" /> Expected recovery: ~{d.recoveryDays} days</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Care guide">
        <div className="glass rounded-2xl p-4 grid grid-cols-2 gap-3 text-sm">
          {scan.care.light && <CareItem icon={<Sun className="size-4" />} label="Light" value={scan.care.light} />}
          {scan.care.water && <CareItem icon={<Droplets className="size-4" />} label="Water" value={scan.care.water} />}
          {scan.care.temperature && <CareItem icon={<Thermometer className="size-4" />} label="Temp" value={scan.care.temperature} />}
          {scan.care.ph && <CareItem icon={<span>pH</span>} label="pH" value={scan.care.ph} />}
          {scan.care.soil && <CareItem icon={<Leaf className="size-4" />} label="Soil" value={scan.care.soil} />}
          {scan.care.humidity && <CareItem icon={<Droplets className="size-4" />} label="Humidity" value={scan.care.humidity} />}
          {scan.care.tankSize && <CareItem icon={<Fish className="size-4" />} label="Tank" value={scan.care.tankSize} />}
          {scan.care.feeding && <CareItem icon={<Fish className="size-4" />} label="Feeding" value={scan.care.feeding} />}
        </div>
        {scan.care.extras && scan.care.extras.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {scan.care.extras.map((e, i) => <li key={i} className="glass rounded-xl px-3 py-2">{e}</li>)}
          </ul>
        )}
      </Section>

      <Section title="Reminders">
        <div className="grid grid-cols-2 gap-2">
          {scan.kind === "plant" ? (
            <>
              <RemBtn onClick={() => addReminder("Water", 3)} label="Water · 3d" />
              <RemBtn onClick={() => addReminder("Fertilize", 14)} label="Fertilize · 2w" />
            </>
          ) : (
            <>
              <RemBtn onClick={() => addReminder("Feed", 1)} label="Feed · daily" />
              <RemBtn onClick={() => addReminder("Clean tank", 7)} label="Clean · 1w" />
            </>
          )}
        </div>
      </Section>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </section>
  );
}
function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold">{title}</p>
      <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
function CareItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="text-sm">{value}</p>
    </div>
  );
}
function RemBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="glass rounded-2xl py-3 text-sm font-medium flex items-center justify-center gap-2">
      <Bell className="size-4 text-primary" /> {label}
    </button>
  );
}