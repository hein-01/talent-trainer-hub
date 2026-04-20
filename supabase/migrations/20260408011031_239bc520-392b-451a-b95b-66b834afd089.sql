
-- Features table
CREATE TABLE public.features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Feature details table
CREATE TABLE public.feature_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id uuid NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  overview text NOT NULL DEFAULT '',
  use_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_details ENABLE ROW LEVEL SECURITY;

-- Everyone can read features
CREATE POLICY "Anyone can view features" ON public.features FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view feature_details" ON public.feature_details FOR SELECT TO authenticated USING (true);

-- Authenticated users can manage features (admin restriction can be added later)
CREATE POLICY "Authenticated users can insert features" ON public.features FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update features" ON public.features FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete features" ON public.features FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert feature_details" ON public.feature_details FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update feature_details" ON public.feature_details FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete feature_details" ON public.feature_details FOR DELETE TO authenticated USING (true);

-- Updated_at triggers
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_details_updated_at BEFORE UPDATE ON public.feature_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for feature images
INSERT INTO storage.buckets (id, name, public) VALUES ('feature-images', 'feature-images', true);

-- Storage policies
CREATE POLICY "Anyone can view feature images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'feature-images');
CREATE POLICY "Authenticated users can upload feature images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'feature-images');
CREATE POLICY "Authenticated users can update feature images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'feature-images');
CREATE POLICY "Authenticated users can delete feature images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'feature-images');
