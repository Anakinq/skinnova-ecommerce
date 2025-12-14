# Comprehensive Fix for Infinite Recursion in Profile Policies

## Current Issue
You're still experiencing the error:
```
Failed to create product: infinite recursion detected in policy for relation "profiles"
```

## Immediate Solution

### Step 1: Apply Direct Policy Fix
Run the SQL script `scripts/022_direct_recursion_fix.sql` in your Supabase SQL Editor:

1. Open the [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
2. Copy and paste the contents of `scripts/022_direct_recursion_fix.sql`
3. Execute the script

This script does the following:
- Removes problematic recursive policies on the `profiles` table
- Creates simple, non-recursive policies
- Updates product and order policies to use JWT claims instead of querying profiles

### Step 2: Update Your Admin User
Make sure your user is marked as admin in the database:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';
```

Replace `'your-admin-email@example.com'` with your actual admin email.

## Why This Fixes the Issue

The recursion happens because:
1. When creating a product, the policy checks if the user is admin
2. To check if the user is admin, it queries the `profiles` table
3. Querying the `profiles` table triggers its RLS policies
4. Those policies check if the user is admin (back to step 2) - hence the recursion

Our fix breaks this cycle by:
1. Simplifying the `profiles` policy to only check `auth.uid() = id`
2. Using JWT claims for admin checks in other policies
3. Adding error handling to prevent uncaught exceptions

## Long-term Improvements

### Better JWT Claim Management
The script `scripts/023_setup_jwt_claims.sql` contains functions to properly set up JWT claims for admin users.

### Enhanced Admin Check Logic
The updated `lib/check-admin.ts` file now:
1. Checks JWT claims first (most efficient)
2. Falls back to database query with proper error handling
3. Prevents unhandled exceptions that could crash your application

## Verification Steps

After applying the fixes:

1. Log out and log back in to refresh your session
2. Navigate to the admin product creation page
3. Try to create a new product
4. The operation should complete successfully

## If Issues Persist

If you're still experiencing problems:

1. Check that your admin user has `is_admin = true` in the profiles table:
   ```sql
   SELECT email, is_admin FROM profiles WHERE email = 'your-admin-email@example.com';
   ```

2. Temporarily disable RLS on the profiles table to test:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
   
   Remember to re-enable it afterward:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

3. Check the Supabase logs for more detailed error information in the [Supabase Log Explorer](https://app.supabase.com/project/_/logs)

## Prevention for Future Development

1. Always test policy changes with both admin and regular users
2. Avoid querying the same table within its own policies
3. Use JWT claims for user attributes when possible
4. Implement proper error handling in all database interactions
5. Keep policies as simple as possible