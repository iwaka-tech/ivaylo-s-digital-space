
-- Blog posts table - public readable, no direct write access (writes go through edge function)
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can view published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- No public write/update/delete policies — writes happen via edge function with service role.

-- Storage bucket for blog media (images, videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true);

-- Allow public read of media
CREATE POLICY "Public read blog media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
