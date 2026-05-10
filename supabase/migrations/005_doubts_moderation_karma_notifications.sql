-- ============================================================
-- Migration 008: doubts + doubt_replies + doubt_upvotes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.doubts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id       uuid        REFERENCES public.subjects(id) ON DELETE SET NULL,
  title            text        NOT NULL,
  body             text        NOT NULL,
  image_url        text,
  status           text        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  accepted_reply_id uuid,                  -- FK set after table created below
  view_count       int         NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doubt_replies (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id     uuid        NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body         text        NOT NULL,
  upvote_count int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Add FK from doubts.accepted_reply_id -> doubt_replies.id
ALTER TABLE public.doubts
  ADD CONSTRAINT doubts_accepted_reply_id_fkey
  FOREIGN KEY (accepted_reply_id) REFERENCES public.doubt_replies(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.doubt_upvotes (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_id   uuid NOT NULL REFERENCES public.doubt_replies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, reply_id)
);

-- ============================================================
-- Migration 009: moderation_log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.moderation_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action          text        NOT NULL CHECK (action IN ('warn', 'block', 'unblock')),
  reason          text,
  moderator_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Migration 010: karma_log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.karma_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action       text        NOT NULL,  -- upload_approved | quiz_score | accepted_answer | upvote_received | ai_summary_generated
  points       int         NOT NULL,
  reference_id uuid,                  -- material_id / quiz_attempt_id / reply_id
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Migration 011: notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN ('approval','rejection','warning','reply','accepted_answer')),
  title      text        NOT NULL,
  body       text        NOT NULL,
  link       text,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
