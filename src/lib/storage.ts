export type ScanKind = "plant" | "fish" | "unknown";

export interface Scan {
  id: string;
  createdAt: number;
  imageDataUrl: string;
  kind: ScanKind;
  commonName: string;
  scientificName?: string;
  confidence: number; // 0-100
  healthScore: number; // 0-100
  summary: string;
  diseases: Array<{
    name: string;
    cause: string;
    severity: "mild" | "moderate" | "severe";
    symptoms: string[];
    treatment: string[];
    prevention: string[];
    recoveryDays?: number;
  }>;
  care: {
    light?: string;
    water?: string;
    soil?: string;
    humidity?: string;
    temperature?: string;
    ph?: string;
    tankSize?: string;
    feeding?: string;
    extras?: string[];
  };
  notes?: string;
  growth?: Array<{ date: number; imageDataUrl: string; note?: string }>;
}

const KEY = "naturelens.scans.v1";

function read(): Scan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(s: Scan[]) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("naturelens:update"));
}

export const store = {
  list(): Scan[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },
  get(id: string) {
    return read().find((s) => s.id === id);
  },
  add(scan: Scan) {
    const all = read();
    all.push(scan);
    write(all);
  },
  update(id: string, patch: Partial<Scan>) {
    const all = read().map((s) => (s.id === id ? { ...s, ...patch } : s));
    write(all);
  },
  remove(id: string) {
    write(read().filter((s) => s.id !== id));
  },
  addGrowth(id: string, entry: { imageDataUrl: string; note?: string }) {
    const all = read().map((s) =>
      s.id === id
        ? { ...s, growth: [...(s.growth || []), { date: Date.now(), ...entry }] }
        : s,
    );
    write(all);
  },
};

// Reminders
export interface Reminder {
  id: string;
  scanId?: string;
  title: string;
  intervalDays: number;
  nextAt: number;
}
const RKEY = "naturelens.reminders.v1";
export const reminders = {
  list(): Reminder[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(RKEY) || "[]"); } catch { return []; }
  },
  save(r: Reminder[]) { localStorage.setItem(RKEY, JSON.stringify(r)); window.dispatchEvent(new Event("naturelens:update")); },
  add(r: Omit<Reminder, "id" | "nextAt"> & { nextAt?: number }) {
    const list = reminders.list();
    list.push({ ...r, id: crypto.randomUUID(), nextAt: r.nextAt ?? Date.now() + r.intervalDays * 86400000 });
    reminders.save(list);
  },
  remove(id: string) { reminders.save(reminders.list().filter((x) => x.id !== id)); },
};