
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tighten public bucket: still public-read of individual files via direct URL (since bucket is public),
-- but restrict listing to authenticated requests only by dropping the broad SELECT policy.
DROP POLICY IF EXISTS "Public read blog media" ON storage.objects;
