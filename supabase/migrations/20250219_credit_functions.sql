-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credit(
  user_id UUID,
  amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has enough credits
  IF NOT EXISTS (
    SELECT 1 FROM public.credits 
    WHERE credits.user_id = deduct_credit.user_id 
    AND credits.amount >= deduct_credit.amount
  ) THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct credits
  UPDATE public.credits 
  SET amount = credits.amount - deduct_credit.amount,
      updated_at = NOW()
  WHERE credits.user_id = deduct_credit.user_id;
END;
$$;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credit(
  user_id UUID,
  amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add credits
  UPDATE public.credits 
  SET amount = credits.amount + add_credit.amount,
      updated_at = NOW()
  WHERE credits.user_id = add_credit.user_id;
  
  -- If user doesn't exist in credits table, create a new record
  IF NOT FOUND THEN
    INSERT INTO public.credits (user_id, amount)
    VALUES (add_credit.user_id, add_credit.amount);
  END IF;
END;
$$;
