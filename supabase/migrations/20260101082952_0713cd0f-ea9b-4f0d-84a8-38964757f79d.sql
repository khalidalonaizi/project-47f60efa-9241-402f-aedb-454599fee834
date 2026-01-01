-- Create financing_offers table for banks and financing companies
CREATE TABLE public.financing_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL DEFAULT 'bank', -- bank, financing_company
  logo_url TEXT,
  interest_rate NUMERIC NOT NULL,
  max_tenure INTEGER NOT NULL DEFAULT 25,
  max_amount NUMERIC NOT NULL,
  min_salary NUMERIC NOT NULL,
  max_dti NUMERIC NOT NULL DEFAULT 65,
  features TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financing_offers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view approved financing offers"
ON public.financing_offers
FOR SELECT
USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own financing offers"
ON public.financing_offers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financing offers"
ON public.financing_offers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financing offers"
ON public.financing_offers
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all financing offers"
ON public.financing_offers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_financing_offers_updated_at
BEFORE UPDATE ON public.financing_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();