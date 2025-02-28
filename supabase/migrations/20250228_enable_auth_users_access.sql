-- Enable access to auth.users table for our queries
CREATE POLICY "Allow users to view other users' basic info"
    ON auth.users FOR SELECT
    USING (true);

-- Grant access to auth schema for authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
