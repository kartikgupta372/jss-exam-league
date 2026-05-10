-- ============================================================
-- Migration 002: subjects table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subjects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  code        text,                          -- e.g. JCS-403
  year        int         NOT NULL CHECK (year IN (1, 2)),
  semester    int         CHECK (semester BETWEEN 1 AND 8),
  branch      text        DEFAULT 'ALL',    -- CSE | IT | ECE | ALL
  description text,
  icon_emoji  text,                          -- e.g. '💻'
  sort_order  int         DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
