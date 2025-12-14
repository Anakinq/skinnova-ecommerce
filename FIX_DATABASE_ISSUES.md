# Database Issue Fix

You're experiencing a database error due to recursive policies in your Supabase database. The error message "infinite recursion detected in policy for relation 'profiles'" indicates that there's a circular reference in your Row Level Security (RLS) policies.

## Problem

The issue is in the profiles table policy that checks if a user is an admin. The policy was referencing the profiles table within itself, causing infinite recursion.

## Solution

Run the following SQL script in your Supabase SQL editor to fix the issue:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the script in `scripts/019_fix_profiles_policy.sql`

This will:
- Drop the problematic policy
- Create a new policy that avoids recursion

## Alternative Manual Fix

If you prefer to fix this manually, you can run this SQL directly in your Supabase SQL editor:

```sql
-- Fix recursive policy issue in profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simpler policy that avoids recursion
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
  OR auth.uid() = id
);
```

## After Applying the Fix

1. Refresh your admin products page
2. Try clicking the pencil icon again

The error should be resolved, and you should be able to edit products normally.