import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-6">
        {title && (
          <header className="mb-5">
            <h1 className="text-3xl font-bold gradient-text leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
      <BottomNav />
    </div>
  );
}