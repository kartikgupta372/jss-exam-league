-- ============================================================
-- Migration 008: Triggers — karma, auto-block, notifications
-- ============================================================

-- ---- TRIGGER 1: Award karma when material is approved ----

CREATE OR REPLACE FUNCTION public.on_material_approved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire when status changes TO 'approved'
  IF OLD.status IS DISTINCT FROM 'approved' AND NEW.status = 'approved' THEN
    -- Award +10 karma to uploader
    UPDATE public.profiles
      SET karma_points = karma_points + 10
      WHERE id = NEW.uploaded_by;

    -- Write to karma_log
    INSERT INTO public.karma_log (user_id, action, points, reference_id)
      VALUES (NEW.uploaded_by, 'upload_approved', 10, NEW.id);

    -- Send notification to uploader
    INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (
        NEW.uploaded_by,
        'approval',
        '✅ Your upload was approved!',
        'Your material "' || NEW.title || '" is now live. You earned +10 karma.',
        '/material/' || NEW.id::text
      );
  END IF;

  -- Fire when status changes TO 'rejected'
  IF OLD.status IS DISTINCT FROM 'rejected' AND NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (
        NEW.uploaded_by,
        'rejection',
        '❌ Upload not approved',
        'Your material "' || NEW.title || '" was rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'Not specified'),
        '/upload'
      );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER material_approval_trigger
  AFTER UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.on_material_approved();


-- ---- TRIGGER 2: Award +5 karma when a doubt reply is accepted ----

CREATE OR REPLACE FUNCTION public.on_doubt_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  reply_author uuid;
  doubt_title  text;
BEGIN
  IF OLD.accepted_reply_id IS NULL AND NEW.accepted_reply_id IS NOT NULL THEN
    -- Get the reply author
    SELECT user_id INTO reply_author
      FROM public.doubt_replies WHERE id = NEW.accepted_reply_id;

    SELECT title INTO doubt_title FROM public.doubts WHERE id = NEW.id;

    -- Award karma
    UPDATE public.profiles
      SET karma_points = karma_points + 5
      WHERE id = reply_author;

    INSERT INTO public.karma_log (user_id, action, points, reference_id)
      VALUES (reply_author, 'accepted_answer', 5, NEW.accepted_reply_id);

    -- Notify reply author
    INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (
        reply_author,
        'accepted_answer',
        '⭐ Your answer was accepted!',
        'Your reply on "' || doubt_title || '" was marked as the best answer. +5 karma!',
        '/doubts/' || NEW.id::text
      );

    -- Mark doubt as resolved
    NEW.status = 'resolved';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER doubt_accepted_trigger
  BEFORE UPDATE ON public.doubts
  FOR EACH ROW EXECUTE FUNCTION public.on_doubt_accepted();


-- ---- TRIGGER 3: Auto-block after 3 warnings ----

CREATE OR REPLACE FUNCTION public.on_warning_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.action = 'warn' THEN
    UPDATE public.profiles
      SET warnings_count = warnings_count + 1
      WHERE id = NEW.target_user_id;

    -- Auto-block if 3+ warnings
    UPDATE public.profiles
      SET role = 'blocked'
      WHERE id = NEW.target_user_id AND warnings_count >= 3;

    -- Notify warned user
    INSERT INTO public.notifications (user_id, type, title, body)
      VALUES (
        NEW.target_user_id,
        'warning',
        '⚠️ You received a warning',
        'Reason: ' || COALESCE(NEW.reason, 'Policy violation') || '. 3 warnings = account block.'
      );
  END IF;

  IF NEW.action = 'block' THEN
    UPDATE public.profiles SET role = 'blocked' WHERE id = NEW.target_user_id;
  END IF;

  IF NEW.action = 'unblock' THEN
    UPDATE public.profiles
      SET role = 'student', warnings_count = 0
      WHERE id = NEW.target_user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER warning_trigger
  AFTER INSERT ON public.moderation_log
  FOR EACH ROW EXECUTE FUNCTION public.on_warning_inserted();


-- ---- TRIGGER 4: Increment doubt_replies.upvote_count on upvote insert/delete ----

CREATE OR REPLACE FUNCTION public.on_upvote_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.doubt_replies SET upvote_count = upvote_count + 1 WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.doubt_replies SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.reply_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER upvote_count_trigger
  AFTER INSERT OR DELETE ON public.doubt_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.on_upvote_change();


-- ---- TRIGGER 5: Increment material view/download counts ----
-- These are called via RPC to avoid RLS conflicts

CREATE OR REPLACE FUNCTION public.increment_view_count(material_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.materials SET view_count = view_count + 1 WHERE id = material_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_download_count(material_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.materials SET download_count = download_count + 1 WHERE id = material_id;
$$;
