import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const router = useRouter();
  const [rating, setRating] = useState(800);
  const [goal, setGoal] = useState("Reach 1500");
  const [daily, setDaily] = useState(20);
  const [lang, setLang] = useState("en");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (p?.onboarded) router.navigate({ to: "/dashboard", replace: true });
      if (p?.display_name) setName(p.display_name);
    });
  }, [router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({
      rating, goal, daily_minutes: daily, language: lang, display_name: name, onboarded: true,
    }).eq("id", u.user.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    router.navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={save} className="w-full max-w-lg card-elevated rounded-2xl p-8 space-y-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-primary" />
          <span className="font-display text-2xl gold-gradient">Welcome to Guru</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">Tell me about you so I can coach you perfectly.</p>

        <label className="block">
          <span className="text-sm">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border" />
        </label>

        <label className="block">
          <span className="text-sm">Current rating: <b className="text-primary">{rating}</b></span>
          <input type="range" min={400} max={2000} step={50} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-2 w-full accent-[var(--gold)]" />
        </label>

        <label className="block">
          <span className="text-sm">Daily training time: <b className="text-primary">{daily} min</b></span>
          <input type="range" min={5} max={120} step={5} value={daily} onChange={(e) => setDaily(Number(e.target.value))} className="mt-2 w-full accent-[var(--gold)]" />
        </label>

        <label className="block">
          <span className="text-sm">Goal</span>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border">
            <option>Reach 1000</option>
            <option>Reach 1500</option>
            <option>Reach 1800</option>
            <option>Reach 2000</option>
            <option>Win my local tournament</option>
            <option>Just have fun</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Preferred coaching language</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </label>

        <button disabled={loading} className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-60">
          Begin training
        </button>
      </form>
    </div>
  );
}
