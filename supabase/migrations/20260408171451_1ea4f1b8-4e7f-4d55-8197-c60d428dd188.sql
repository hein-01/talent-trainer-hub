
-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  product TEXT NOT NULL,
  phone_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
  assigned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT TO authenticated
  USING (auth.uid() = assigned_user_id);

CREATE POLICY "Users can insert their own leads"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = assigned_user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE TO authenticated
  USING (auth.uid() = assigned_user_id);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create lead_outcomes table
CREATE TABLE public.lead_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  outcome TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view outcomes for their leads"
  ON public.lead_outcomes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_id AND leads.assigned_user_id = auth.uid()));

CREATE POLICY "Users can insert outcomes for their leads"
  ON public.lead_outcomes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_id AND leads.assigned_user_id = auth.uid()));

CREATE POLICY "Users can update outcomes for their leads"
  ON public.lead_outcomes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete outcomes for their leads"
  ON public.lead_outcomes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_lead_outcomes_updated_at
  BEFORE UPDATE ON public.lead_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_leads_assigned_user ON public.leads(assigned_user_id);
CREATE INDEX idx_leads_product ON public.leads(product);
CREATE INDEX idx_lead_outcomes_lead_id ON public.lead_outcomes(lead_id);
CREATE INDEX idx_lead_outcomes_outcome ON public.lead_outcomes(outcome);
