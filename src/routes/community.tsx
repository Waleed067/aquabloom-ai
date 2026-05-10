import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Heart, MessageSquare, Leaf, Fish } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — NatureLens AI" }] }),
  component: Community,
});

const POSTS = [
  { id: 1, kind: "plant" as const, author: "Maya", title: "My Monstera finally fenestrated! 🌱", body: "After 6 months of bright indirect light and weekly watering, the new leaf split. Patience pays off.", likes: 124, comments: 18 },
  { id: 2, kind: "fish" as const, author: "Ravi", title: "Curing fin rot naturally", body: "Daily 25% water changes and aquarium salt cleared up my betta's fins in 9 days. No meds needed.", likes: 89, comments: 22 },
  { id: 3, kind: "plant" as const, author: "Zoe", title: "Snake plant propagation cheat", body: "Cut a leaf into 3 pieces, let callous for 2 days, plant in dry soil. 95% success rate.", likes: 201, comments: 30 },
  { id: 4, kind: "fish" as const, author: "Liu", title: "Cycling a tank in 7 days", body: "Seed media from a healthy tank + heavy ammonia source. Test daily and don't add fish until 0/0/<20.", likes: 64, comments: 9 },
  { id: 5, kind: "plant" as const, author: "Ana", title: "Yellow leaves saved!", body: "It wasn't water — it was light. Moved to a south window and new growth is back to deep green.", likes: 47, comments: 6 },
];

function Community() {
  return (
    <AppShell title="Community" subtitle="Tips, wins, and lessons from the NatureLens community">
      <div className="space-y-3">
        {POSTS.map((p) => (
          <article key={p.id} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <div className={`size-9 rounded-full ${p.kind === "plant" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"} flex items-center justify-center`}>
                {p.kind === "plant" ? <Leaf className="size-4" /> : <Fish className="size-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{p.author}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{p.kind} care</p>
              </div>
            </div>
            <h3 className="font-bold mt-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.body}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="size-3.5" /> {p.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare className="size-3.5" /> {p.comments}</span>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}