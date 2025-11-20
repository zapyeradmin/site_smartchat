-- Create RLS policy to allow public reading of published news
CREATE POLICY "Public can view published news" 
ON public.news_admin 
FOR SELECT 
USING (status = 'published');

-- Create index for better performance on status and published_at queries
CREATE INDEX IF NOT EXISTS idx_news_admin_status_published_at 
ON public.news_admin (status, published_at DESC);