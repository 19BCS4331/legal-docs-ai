-- Fix permissions for the handle_new_user trigger function

-- 1. First, make sure the function has the right security context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- This is crucial - makes the function run with the privileges of the owner
AS $$
DECLARE
    full_name_value TEXT;
BEGIN
    -- Extract full name from raw_user_meta_data for social logins
    IF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        full_name_value := new.raw_user_meta_data->>'full_name';
    ELSIF new.raw_user_meta_data->>'name' IS NOT NULL THEN
        full_name_value := new.raw_user_meta_data->>'name';
    ELSE
        full_name_value := NULL;
    END IF;

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, full_name_value);

    INSERT INTO public.subscriptions (user_id, plan_type, status)
    VALUES (new.id, 'free', 'active');

    INSERT INTO public.credits (user_id, amount)
    VALUES (new.id, 3); -- Start with 3 free credits

    RETURN new;
END;
$$;

-- 2. Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions to the authenticated and anon roles
GRANT INSERT ON public.profiles TO authenticated, anon, service_role;
GRANT INSERT ON public.subscriptions TO authenticated, anon, service_role;
GRANT INSERT ON public.credits TO authenticated, anon, service_role;

-- 4. Add INSERT policies to the tables
-- For profiles table
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated, anon
WITH CHECK (auth.uid() = id);

-- For subscriptions table
CREATE POLICY "Users can insert their own subscription" 
ON public.subscriptions 
FOR INSERT 
TO authenticated, anon
WITH CHECK (auth.uid() = user_id);

-- For credits table
CREATE POLICY "Users can insert their own credits" 
ON public.credits 
FOR INSERT 
TO authenticated, anon
WITH CHECK (auth.uid() = user_id);
