-- ============================================================
-- Migration 007: Row Level Security — Enable on all tables
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_replies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_upvotes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karma_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- Helper: check if calling user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper: check if calling user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'blocked'
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================

-- Anyone can read any profile (public leaderboard needs this)
CREATE POLICY "profiles_select_public"    ON public.profiles FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"       ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- New profile insert is handled by trigger only
CREATE POLICY "profiles_insert_trigger"   ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- SUBJECTS
-- ============================================================

-- Subjects are public to read
CREATE POLICY "subjects_select_public"    ON public.subjects FOR SELECT USING (true);

-- Only admin can insert/update/delete subjects
CREATE POLICY "subjects_admin_write"      ON public.subjects FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- MATERIALS
-- ============================================================

-- Approved materials readable by everyone (including logged-out)
CREATE POLICY "materials_select_approved" ON public.materials FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = uploaded_by
    OR public.is_admin()
  );

-- Logged-in non-blocked students can submit (pending only)
CREATE POLICY "materials_insert_student"  ON public.materials FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND status = 'pending'
    AND NOT public.is_blocked()
  );

-- Only admin can approve / reject / edit
CREATE POLICY "materials_update_admin"    ON public.materials FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- BOOKMARKS
-- ============================================================

CREATE POLICY "bookmarks_own"             ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- QUIZZES
-- ============================================================

-- Published quizzes readable by all
CREATE POLICY "quizzes_select_published"  ON public.quizzes FOR SELECT
  USING (published = true OR public.is_admin());

-- Admin can create/edit quizzes
CREATE POLICY "quizzes_admin_write"       ON public.quizzes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================

-- Readable if the quiz is published
CREATE POLICY "quiz_questions_select"     ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND (q.published = true OR public.is_admin())
    )
  );

CREATE POLICY "quiz_questions_admin_write" ON public.quiz_questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================

-- Users insert their own attempts
CREATE POLICY "quiz_attempts_insert_own"  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND NOT public.is_blocked());

-- Leaderboard: all attempts readable (aggregated in views)
CREATE POLICY "quiz_attempts_select_all"  ON public.quiz_attempts FOR SELECT
  USING (true);

-- ============================================================
-- DOUBTS
-- ============================================================

-- All doubts readable by everyone
CREATE POLICY "doubts_select_public"      ON public.doubts FOR SELECT USING (true);

-- Logged-in non-blocked users can post doubts
CREATE POLICY "doubts_insert_student"     ON public.doubts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND NOT public.is_blocked());

-- Author can update their doubt (mark resolved), admin can do anything
CREATE POLICY "doubts_update_author_admin" ON public.doubts FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- DOUBT REPLIES
-- ============================================================

CREATE POLICY "doubt_replies_select"      ON public.doubt_replies FOR SELECT USING (true);

CREATE POLICY "doubt_replies_insert"      ON public.doubt_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id AND NOT public.is_blocked());

CREATE POLICY "doubt_replies_update_own"  ON public.doubt_replies FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- DOUBT UPVOTES
-- ============================================================

CREATE POLICY "doubt_upvotes_own"         ON public.doubt_upvotes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MODERATION LOG
-- ============================================================

-- Only admins can read/write moderation log
CREATE POLICY "moderation_log_admin"      ON public.moderation_log FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- KARMA LOG
-- ============================================================

-- Users see own karma log; admin sees all
CREATE POLICY "karma_log_select"          ON public.karma_log FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Karma is written by triggers / edge functions only (service role bypasses RLS)
CREATE POLICY "karma_log_insert_service"  ON public.karma_log FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE POLICY "notifications_own"         ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can insert notifications for any user
CREATE POLICY "notifications_admin_insert" ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());
