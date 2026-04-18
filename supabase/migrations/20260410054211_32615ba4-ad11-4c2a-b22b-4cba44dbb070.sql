
CREATE TABLE public.sales_training_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product text NOT NULL,
  role text NOT NULL,
  title text NOT NULL,
  dialogues jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_training_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sales_training_cards"
ON public.sales_training_cards
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sales_training_cards"
ON public.sales_training_cards
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales_training_cards"
ON public.sales_training_cards
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sales_training_cards"
ON public.sales_training_cards
FOR DELETE
TO authenticated
USING (true);

CREATE TRIGGER update_sales_training_cards_updated_at
BEFORE UPDATE ON public.sales_training_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
