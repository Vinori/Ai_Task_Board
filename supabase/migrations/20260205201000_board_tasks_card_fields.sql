-- Optional fields for Kanban task cards (UI parity with Task type)
ALTER TABLE public.board_tasks
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS assignee jsonb;
