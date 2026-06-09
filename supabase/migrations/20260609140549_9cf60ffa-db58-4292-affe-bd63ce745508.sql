
CREATE TABLE public.tactic_puzzles (
  id text PRIMARY KEY,
  fen text NOT NULL,
  solution_uci text[] NOT NULL,
  rating integer NOT NULL,
  tier text NOT NULL CHECK (tier IN ('Beginner','Intermediate','Advanced')),
  motif text NOT NULL,
  hints text[] NOT NULL DEFAULT '{}',
  lesson text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tactic_puzzles_tier_rating_idx ON public.tactic_puzzles (tier, rating);
CREATE INDEX tactic_puzzles_motif_idx ON public.tactic_puzzles (motif);

GRANT SELECT ON public.tactic_puzzles TO anon;
GRANT SELECT ON public.tactic_puzzles TO authenticated;
GRANT ALL ON public.tactic_puzzles TO service_role;

ALTER TABLE public.tactic_puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read puzzles"
ON public.tactic_puzzles FOR SELECT
TO anon, authenticated
USING (true);
