import { Link, useRouter } from "@tanstack/react-router";
import { Crown, LayoutDashboard, Swords, MessageSquare, Puzzle, FileSearch, BookOpen, Target, AlertTriangle, Brain, Castle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/play", label: "Play", icon: Swords },
  { to: "/openings", label: "Openings", icon: BookOpen },
  { to: "/traps", label: "Traps", icon: AlertTriangle },
  { to: "/middlegame", label: "Middle", icon: Brain },
  { to: "/endgame", label: "Endgame", icon: Castle },
  { to: "/tactics", label: "Tactics", icon: Target },
  { to: "/coach", label: "Coach", icon: MessageSquare },
  { to: "/puzzles", label: "Daily", icon: Puzzle },
  { to: "/analyze", label: "Analyze", icon: FileSearch },
] as const;


export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-border/60 bg-card/40 backdrop-blur">
        <Link to="/dashboard" className="flex items-center gap-2 px-5 py-5 border-b border-border/60">
          <Crown className="h-6 w-6 text-primary" />
          <span className="font-display text-xl gold-gradient">Chess Trainer</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              activeProps={{ className: "flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-secondary text-foreground" }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="m-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card/40 backdrop-blur">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-display text-lg gold-gradient">Chess Trainer</span>
          </Link>
          <button onClick={signOut} className="text-xs text-muted-foreground">Sign out</button>
        </header>
        {title && (
          <div className="px-6 md:px-10 pt-6 md:pt-10">
            <h1 className="font-display text-3xl md:text-4xl gold-gradient">{title}</h1>
          </div>
        )}
        <div className="px-6 md:px-10 py-6 md:py-8">{children}</div>
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/60 bg-card/90 backdrop-blur flex justify-around py-2 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground px-2 py-1 shrink-0"
              activeProps={{ className: "flex flex-col items-center gap-1 text-[10px] text-primary px-2 py-1 shrink-0" }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="h-16 md:hidden" />
      </main>
    </div>
  );
}
