-- Supabase Setup for Clerk Integration
-- Run this in your Supabase SQL Editor

-- 1. Create test function to check authentication
CREATE OR REPLACE FUNCTION test_authorization_header() 
RETURNS json 
LANGUAGE SQL 
AS $$ 
  SELECT auth.jwt();
$$;

-- 2. Drop existing policies that use auth.uid() (if they exist)
DROP POLICY IF EXISTS "Users can view their own data" ON onboarding;
DROP POLICY IF EXISTS "Users can insert their own data" ON onboarding;
DROP POLICY IF EXISTS "Users can update their own data" ON onboarding;

-- 3. Create Clerk-compatible policies using auth.jwt()
CREATE POLICY "Users can view their own onboarding data" ON onboarding
  FOR SELECT 
  TO authenticated 
  USING ((auth.jwt()->>'sub') = clerk_user_id);

CREATE POLICY "Users can insert their own onboarding data" ON onboarding
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((auth.jwt()->>'sub') = clerk_user_id);

CREATE POLICY "Users can update their own onboarding data" ON onboarding
  FOR UPDATE 
  TO authenticated 
  USING ((auth.jwt()->>'sub') = clerk_user_id)
  WITH CHECK ((auth.jwt()->>'sub') = clerk_user_id);

-- 4. TEMPORARY: Test with permissive policy (REMOVE AFTER TESTING)
-- Uncomment the line below if you need to test without RLS restrictions
-- CREATE POLICY "Temporary permissive select policy" ON onboarding
--   FOR SELECT 
--   TO authenticated 
--   USING (true);

-- 5. Enable RLS on the onboarding table (if not already enabled)
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- 6. Test the setup
-- You can run this query to test the authentication function:
-- SELECT test_authorization_header();

-- 7. Verify policies are working
-- You can check existing policies with:
-- SELECT * FROM pg_policies WHERE tablename = 'onboarding'; 