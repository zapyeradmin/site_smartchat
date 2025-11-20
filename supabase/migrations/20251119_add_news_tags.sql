-- Add tags column to news_admin to store multiple tags
-- We use TEXT[] to keep tags normalized in array form

ALTER TABLE public.news_admin
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- Optional: index for tags searches (commented out for now)
-- CREATE INDEX IF NOT EXISTS idx_news_admin_tags ON public.news_admin USING GIN (tags);