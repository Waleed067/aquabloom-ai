import { Link, useLocation } from "@tanstack/react-router";
import { Home, ScanLine, MessageCircle, History, BookOpen } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: History },
  { to: "/scan", label: "Scan", icon: ScanLine, primary: true },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/knowledge", label: "Learn", icon: BookOpen },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass shadow-elegant rounded-3xl flex items-center justify-around px-2 py-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.to;
            if (it.primary) {
              return (
                <Link key={it.to} to={it.to} className="-mt-8">
                  <div className="gradient-primary shadow-glow animate-pulse-glow size-16 rounded-full flex items-center justify-center text-white">
                    <Icon className="size-7" />
                  </div>
                </Link>
              );
            }
            return (
              <Link key={it.to} to={it.to} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl">
                <Icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}