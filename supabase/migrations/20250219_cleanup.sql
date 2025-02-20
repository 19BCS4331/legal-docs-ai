-- Drop existing tables and related objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.document_templates;
DROP TABLE IF EXISTS public.credits;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.profiles;
