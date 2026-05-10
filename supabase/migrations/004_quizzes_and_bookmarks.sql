-- ============================================================
-- Migration 004: bookmarks table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id uuid        NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, material_id)
);

-- ============================================================
-- Migration 005: quizzes table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quizzes (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id        uuid        NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title             text        NOT NULL,
  description       text,
  year              int         CHECK (year IN (1, 2)),
  total_questions   int,
  time_limit_min    int         NOT NULL DEFAULT 15,
  max_attempts      int         NOT NULL DEFAULT 2,
  retake_threshold  int         NOT NULL DEFAULT 30,   -- score% below which retry unlocks
  created_by        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  published         boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Migration 006: quiz_questions table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       uuid  NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text  NOT NULL,
  options       jsonb NOT NULL,            -- ["opt A","opt B","opt C","opt D"]
  correct_index int   NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation   text,
  marks         int   NOT NULL DEFAULT 1,
  sort_order    int   NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Migration 007: quiz_attempts table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         uuid        NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score           int         NOT NULL DEFAULT 0,
  percentage      numeric(5,2) NOT NULL DEFAULT 0,
  time_taken_sec  int,
  answers         jsonb,                   -- {question_id: selected_index}
  attempt_number  int         NOT NULL DEFAULT 1 CHECK (attempt_number IN (1, 2)),
  created_at      timestamptz NOT NULL DEFAULT now()
);
