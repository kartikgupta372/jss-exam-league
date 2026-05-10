-- ============================================================
-- Migration 003: materials table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.materials (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  description         text,
  subject_id          uuid        NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  type                text        NOT NULL CHECK (type IN ('full_notes', 'summary', 'unit_test', 'youtube')),
  file_url            text,                  -- supabase storage path for PDFs
  youtube_url         text,                  -- for type=youtube
  source_material_id  uuid        REFERENCES public.materials(id) ON DELETE SET NULL,
  ai_generated        boolean     NOT NULL DEFAULT false,
  ai_summary_text     text,                  -- raw AI markdown if type=summary
  uploaded_by         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason    text,
  approved_by         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at         timestamptz,
  view_count          int         NOT NULL DEFAULT 0,
  download_count      int         NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
