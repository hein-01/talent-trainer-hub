
CREATE TABLE public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guides" ON public.guides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update guides" ON public.guides FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete guides" ON public.guides FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
