-- ============================================================
-- Migration 009: Materialized Views for leaderboards
-- ============================================================

-- ---- Contributor leaderboard (by karma, all-time) ----
CREATE MATERIALIZED VIEW IF NOT EXISTS public.contributor_leaderboard_alltime AS
SELECT
  p.id,
  CASE WHEN p.anonymous_mode THEN 'Anonymous JSS-2027' ELSE p.full_name END AS display_name,
  CASE WHEN p.anonymous_mode THEN NULL ELSE p.avatar_url END AS avatar_url,
  p.year,
  p.branch,
  p.karma_points AS points,
  RANK() OVER (ORDER BY p.karma_points DESC) AS rank
FROM public.profiles p
WHERE p.role = 'student' AND p.karma_points > 0
ORDER BY rank
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS contrib_alltime_id ON public.contributor_leaderboard_alltime(id);

-- ---- Contributor leaderboard (this week) ----
CREATE MATERIALIZED VIEW IF NOT EXISTS public.contributor_leaderboard_week AS
SELECT
  p.id,
  CASE WHEN p.anonymous_mode THEN 'Anonymous JSS-2027' ELSE p.full_name END AS display_name,
  CASE WHEN p.anonymous_mode THEN NULL ELSE p.avatar_url END AS avatar_url,
  p.year,
  p.branch,
  COALESCE(SUM(kl.points), 0) AS points,
  RANK() OVER (ORDER BY COALESCE(SUM(kl.points), 0) DESC) AS rank
FROM public.profiles p
LEFT JOIN public.karma_log kl
  ON kl.user_id = p.id
  AND kl.created_at >= date_trunc('week', now())
  AND kl.action IN ('upload_approved', 'accepted_answer', 'upvote_received')
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.avatar_url, p.year, p.branch, p.anonymous_mode
HAVING COALESCE(SUM(kl.points), 0) > 0
ORDER BY rank
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS contrib_week_id ON public.contributor_leaderboard_week(id);

-- ---- Quiz leaderboard (all-time) ----
CREATE MATERIALIZED VIEW IF NOT EXISTS public.quiz_leaderboard_alltime AS
SELECT
  p.id,
  CASE WHEN p.anonymous_mode THEN 'Anonymous JSS-2027' ELSE p.full_name END AS display_name,
  CASE WHEN p.anonymous_mode THEN NULL ELSE p.avatar_url END AS avatar_url,
  p.year,
  p.branch,
  p.quiz_points AS points,
  RANK() OVER (ORDER BY p.quiz_points DESC) AS rank
FROM public.profiles p
WHERE p.role = 'student' AND p.quiz_points > 0
ORDER BY rank
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS quiz_alltime_id ON public.quiz_leaderboard_alltime(id);

-- ---- Quiz leaderboard (this week) ----
CREATE MATERIALIZED VIEW IF NOT EXISTS public.quiz_leaderboard_week AS
SELECT
  p.id,
  CASE WHEN p.anonymous_mode THEN 'Anonymous JSS-2027' ELSE p.full_name END AS display_name,
  CASE WHEN p.anonymous_mode THEN NULL ELSE p.avatar_url END AS avatar_url,
  p.year,
  p.branch,
  COALESCE(SUM(kl.points), 0) AS points,
  RANK() OVER (ORDER BY COALESCE(SUM(kl.points), 0) DESC) AS rank
FROM public.profiles p
LEFT JOIN public.karma_log kl
  ON kl.user_id = p.id
  AND kl.created_at >= date_trunc('week', now())
  AND kl.action = 'quiz_score'
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.avatar_url, p.year, p.branch, p.anonymous_mode
HAVING COALESCE(SUM(kl.points), 0) > 0
ORDER BY rank
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS quiz_week_id ON public.quiz_leaderboard_week(id);

-- ---- Refresh function (called by daily cron Edge Function) ----
CREATE OR REPLACE FUNCTION public.refresh_leaderboards()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.contributor_leaderboard_alltime;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.contributor_leaderboard_week;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.quiz_leaderboard_alltime;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.quiz_leaderboard_week;
$$;
