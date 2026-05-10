-- ============================================================
-- Migration 001: profiles table (extends auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text        NOT NULL,
  avatar_url      text,
  year            int         CHECK (year IN (1, 2)),
  branch          text,       -- CSE, IT, ECE, ME, CE, ALL
  roll_number     text        UNIQUE,
  role            text        NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'blocked')),
  karma_points    int         NOT NULL DEFAULT 0,
  quiz_points     int         NOT NULL DEFAULT 0,
  warnings_count  int         NOT NULL DEFAULT 0,
  anonymous_mode  boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsec AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set kartik as admin on insert (update email if needed)
-- Run manually after first login:
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'kartikkartikgupta04@gmail.com');
