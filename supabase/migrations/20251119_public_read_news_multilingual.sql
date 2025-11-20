-- Public read policy for published news (multi‑lingual)
-- Allows general public (anon) to read news when status indicates published,
-- handling both English ('published') and Portuguese ('Publicado'/'publicado').
-- Also requires a non‑NULL published_at to avoid leaking drafts.

-- Clean up old policies that conflict or are single‑language
DROP POLICY IF EXISTS "Public can read published news" ON public.news_admin;
DROP POLICY IF EXISTS "Public can view published news" ON public.news_admin;
DROP POLICY IF EXISTS "Authenticated users can manage news" ON public.news_admin;

-- Create new policy with multi‑lingual status handling
ALTER TABLE public.news_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published news (multi-lingual)"
ON public.news_admin
FOR SELECT
USING (
  (
    lower(status) = 'published'
    OR lower(status) = 'publicado'
  )
  AND published_at IS NOT NULL
);

-- Keep supporting index for common queries
CREATE INDEX IF NOT EXISTS idx_news_admin_status_published_at
ON public.news_admin (status, published_at DESC);