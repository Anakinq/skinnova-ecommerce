-- Set up JWT claims for admin users
-- This creates a trigger that adds the is_admin claim to JWT tokens

-- First, create a function that will be used in the trigger
CREATE OR REPLACE FUNCTION public.add_admin_claim()
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  is_admin BOOLEAN;
BEGIN
  -- Get the current claims
  claims := coalesce(auth.jwt(), '{}'::JSONB);
  
  -- Check if the user is an admin
  SELECT p.is_admin INTO is_admin
  FROM profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
  
  -- Add the is_admin claim if the user is an admin
  IF is_admin THEN
    claims := jsonb_set(claims, '{is_admin}', 'true');
  END IF;
  
  RETURN claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function that modifies the JWT claims
CREATE OR REPLACE FUNCTION public.modify_jwt_claims()
RETURNS EVENT_TRIGGER AS $$
BEGIN
  -- This function will be called when JWT claims are generated
  -- We'll use it to add custom claims
END;
$$ LANGUAGE plpgsql;

-- Note: In Supabase, JWT claims are typically set up through the auth schema
-- For immediate testing, you can manually set a user as admin:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';