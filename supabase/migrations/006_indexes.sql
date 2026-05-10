-- ============================================================
-- Migration 006: Indexes for performance
-- ============================================================

-- materials
CREATE INDEX IF NOT EXISTS idx_materials_subject_status   ON public.materials(subject_id, status);
CREATE INDEX IF NOT EXISTS idx_materials_status_created   ON public.materials(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_uploaded_by      ON public.materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_materials_type             ON public.materials(type, status);

-- quiz_attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz    ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_score   ON public.quiz_attempts(quiz_id, percentage DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_date    ON public.quiz_attempts(user_id, created_at DESC);

-- doubts
CREATE INDEX IF NOT EXISTS idx_doubts_subject_status      ON public.doubts(subject_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doubts_user                ON public.doubts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doubt_replies_doubt        ON public.doubt_replies(doubt_id, upvote_count DESC);

-- karma + notifications
CREATE INDEX IF NOT EXISTS idx_karma_log_user             ON public.karma_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karma_log_action_date      ON public.karma_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read    ON public.notifications(user_id, read, created_at DESC);

-- bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user             ON public.bookmarks(user_id, created_at DESC);

-- quiz_questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz        ON public.quiz_questions(quiz_id, sort_order);
