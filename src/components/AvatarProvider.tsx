import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import boyImg from "@/assets/anime-boy.png";
import girlImg from "@/assets/anime-girl.png";

export type Companion = "boy" | "girl";

type Ctx = {
  companion: Companion;
  setCompanion: (c: Companion) => void;
  speaking: boolean;
  setSpeaking: (s: boolean) => void;
  /** Show a speech bubble from the anime companion for `ms` milliseconds. */
  hint: (text: string, ms?: number) => void;
};

const AvatarCtx = createContext<Ctx | null>(null);

export function useAvatar(): Ctx {
  const ctx = useContext(AvatarCtx);
  if (!ctx) {
    return {
      companion: "girl",
      setCompanion: () => {},
      speaking: false,
      setSpeaking: () => {},
      hint: () => {},
    };
  }
  return ctx;
}

const STORAGE_KEY = "sac.companion";

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [companion, setCompanionState] = useState<Companion>("girl");
  const [speaking, setSpeaking] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "boy" || v === "girl") setCompanionState(v);
    } catch { /* ignore */ }
  }, []);

  const setCompanion = (c: Companion) => {
    setCompanionState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
  };

  const hint = (text: string, ms = 4500) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(text);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  };

  return (
    <AvatarCtx.Provider value={{ companion, setCompanion, speaking, setSpeaking, hint }}>
      {children}
      <FloatingCompanion bubble={bubble} onDismissBubble={() => setBubble(null)} />
    </AvatarCtx.Provider>
  );
}

function FloatingCompanion({ bubble, onDismissBubble }: { bubble: string | null; onDismissBubble: () => void }) {
  const { companion, setCompanion, speaking } = useAvatar();
  const [open, setOpen] = useState(false);
  const img = companion === "boy" ? boyImg : girlImg;
  const accent = companion === "boy" ? "cyan" : "pink";

  const ringClass = speaking
    ? companion === "boy"
      ? "shadow-[0_0_28px_6px_rgba(34,211,238,0.55)]"
      : "shadow-[0_0_28px_6px_rgba(244,114,182,0.55)]"
    : "";

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {(bubble || open) && (
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {bubble && (
            <button
              onClick={onDismissBubble}
              className="max-w-[260px] text-left rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-snug bg-card/95 backdrop-blur border border-border/70 shadow-lg animate-fade-in"
            >
              <span className={`block text-[10px] uppercase tracking-wider mb-0.5 ${accent === "cyan" ? "text-cyan-400" : "text-pink-400"}`}>
                {companion === "boy" ? "Kai" : "Mira"}
              </span>
              <span className="text-foreground/90">{bubble}</span>
            </button>
          )}

          {open && (
            <div className="rounded-2xl p-3 w-60 text-sm animate-scale-in bg-card/95 backdrop-blur border border-border/70 shadow-xl">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your AI companion</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCompanion("boy")}
                  className={`p-2 rounded-lg border ${companion === "boy" ? "border-cyan-400/70 bg-cyan-400/10" : "border-border/60"}`}
                >
                  <img src={boyImg} alt="Kai" width={64} height={64} loading="lazy" className="mx-auto h-14 w-14 object-contain" />
                  <div className="mt-1 text-xs font-medium">Kai</div>
                  <div className="text-[10px] text-muted-foreground">Focused · Tactical</div>
                </button>
                <button
                  onClick={() => setCompanion("girl")}
                  className={`p-2 rounded-lg border ${companion === "girl" ? "border-pink-400/70 bg-pink-400/10" : "border-border/60"}`}
                >
                  <img src={girlImg} alt="Mira" width={64} height={64} loading="lazy" className="mx-auto h-14 w-14 object-contain" />
                  <div className="mt-1 text-xs font-medium">Mira</div>
                  <div className="text-[10px] text-muted-foreground">Warm · Strategic</div>
                </button>
              </div>
              <Link
                to="/gm-coach"
                onClick={() => setOpen(false)}
                className="mt-3 flex items-center justify-center gap-1.5 text-xs w-full py-1.5 rounded-md bg-primary text-primary-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Talk to {companion === "boy" ? "Kai" : "Mira"}
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle AI companion"
        className={`pointer-events-auto relative h-20 w-20 rounded-full grid place-items-center bg-transparent transition ${ringClass} rounded-full`}
      >
        <span
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${companion === "boy" ? "from-cyan-400/30 to-sky-500/10" : "from-pink-400/30 to-fuchsia-500/10"} blur-md`}
          aria-hidden
        />
        {speaking && (
          <span className={`absolute inset-0 rounded-full ${companion === "boy" ? "bg-cyan-400/20" : "bg-pink-400/20"} animate-ping`} />
        )}
        <img
          src={img}
          alt={companion === "boy" ? "Kai" : "Mira"}
          width={80}
          height={80}
          loading="lazy"
          className="relative h-20 w-20 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)] animate-float"
        />
      </button>
    </div>
  );
}
