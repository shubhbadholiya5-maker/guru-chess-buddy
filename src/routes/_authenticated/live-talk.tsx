import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import LiveTalkPlayer from "@/components/LiveTalkPlayer";

export const Route = createFileRoute("/_authenticated/live-talk")({
  component: LiveTalkPage,
  head: () => ({
    meta: [
      { title: "Live Talk — Auto-Play Middlegame Coaching | Socratic AI Coach" },
      { name: "description", content: "Watch a Grandmaster-narrated board auto-play through 10+ fresh middlegame examples with bilingual voice narration in English and Hinglish." },
    ],
  }),
});

function LiveTalkPage() {
  return (
    <AppShell title="Live Talk — Auto-Play Middlegames">
      <p className="text-muted-foreground -mt-2 mb-6 max-w-2xl">
        Hit play and the coach narrates while the board moves. 11 fresh middlegame examples — Greek Gift, IQP outpost, Minority Attack, King's Indian storm, and more.
      </p>
      <LiveTalkPlayer />
    </AppShell>
  );
}
