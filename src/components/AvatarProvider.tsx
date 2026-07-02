import { createContext, useContext, useState, type ReactNode } from "react";
import { Bot, Sparkles } from "lucide-react";

export type Coach = "athena" | "grandmaster";

type Ctx = {
  coach: Coach;
  setCoach: (c: Coach) => void;
  speaking: boolean;
  setSpeaking: (s: boolean) => void;
};

const AvatarCtx = createContext<Ctx | null>(null);

export function useAvatar() {
  const ctx = useContext(AvatarCtx);
  if (!ctx) return { coach: "athena" as Coach, setCoach: () => {}, speaking: false, setSpeaking: () => {} };
  return ctx;
}

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [coach, setCoach] = useState<Coach>("athena");
  const [speaking, setSpeaking] = useState(false);
  return (
    <AvatarCtx.Provider value={{ coach, setCoach, speaking, setSpeaking }}>
      {children}
      <FloatingAvatar />
    </AvatarCtx.Provider>
  );
}

function FloatingAvatar() {
  const { coach, setCoach, speaking } = useAvatar();
  const [open, setOpen] = useState(false);
  const isAthena = coach === "athena";
  const ring = isAthena ? "shadow-[0_0_28px_6px_rgba(34,211,238,0.55)]" : "shadow-[0_0_28px_6px_rgba(234,179,8,0.55)]";
  const glow = isAthena ? "from-cyan-400/70 to-sky-500/40" : "from-amber-300/70 to-yellow-500/40";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="card-elevated rounded-2xl p-3 w-56 text-sm animate-fade-in">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AI Coach</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setCoach("athena")}
              className={`p-2 rounded-lg border ${isAthena ? "border-cyan-400/60 bg-cyan-400/10" : "border-border/60"}`}>
              <Sparkles className="h-4 w-4 mx-auto text-cyan-300" />
              <div className="mt-1 text-xs">Athena</div>
            </button>
            <button onClick={() => setCoach("grandmaster")}
              className={`p-2 rounded-lg border ${!isAthena ? "border-amber-400/60 bg-amber-400/10" : "border-border/60"}`}>
              <Bot className="h-4 w-4 mx-auto text-amber-300" />
              <div className="mt-1 text-xs">Grandmaster</div>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Voice-reactive coach. Rings pulse while narrating.</p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI coach"
        className={`relative h-14 w-14 rounded-full grid place-items-center bg-gradient-to-br ${glow} border border-white/20 backdrop-blur transition ${speaking ? ring : ""}`}
      >
        {speaking && (
          <>
            <span className={`absolute inset-0 rounded-full ${isAthena ? "bg-cyan-400/30" : "bg-amber-400/30"} animate-ping`} />
            <span className={`absolute -inset-1 rounded-full border ${isAthena ? "border-cyan-300/60" : "border-amber-300/60"} animate-pulse`} />
          </>
        )}
        {isAthena ? <Sparkles className="h-6 w-6 text-white relative" /> : <Bot className="h-6 w-6 text-white relative" />}
      </button>
    </div>
  );
}
