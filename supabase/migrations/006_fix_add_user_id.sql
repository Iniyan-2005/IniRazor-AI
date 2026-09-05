-- 1. Add user_id linking to Supabase Auth
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.settlements ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.reconciliations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Turn on Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- 3. Create strict policies so users can ONLY see their own data
CREATE POLICY "Users can manage their own payments" 
  ON public.payments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settlements" 
  ON public.settlements FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reconciliations" 
  ON public.reconciliations FOR ALL USING (auth.uid() = user_id);