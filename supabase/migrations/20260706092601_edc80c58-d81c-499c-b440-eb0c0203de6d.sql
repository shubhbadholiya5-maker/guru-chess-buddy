-- Faster per-user history loads for the GM Coach chat panel.
CREATE INDEX IF NOT EXISTS coach_messages_user_created_idx
  ON public.coach_messages(user_id, created_at);

-- Drop the unused legacy tactic puzzles seed table. No code path reads from it anymore.
DROP TABLE IF EXISTS public.tactic_puzzles;