# Fix for Infinite Recursion in Profile Policies

## Problem
When trying to create or update products in the admin panel, you encounter the error:
```
Failed to create product: infinite recursion detected in policy for relation "profiles"
```

This occurs because the Row Level Security (RLS) policies on the `profiles` table create a recursive loop when checking if a user has admin permissions.

## Root Cause
The issue happens when policies try to query the `profiles` table within themselves. For example, a policy checking if a user is an admin might query the `profiles` table to verify the `is_admin` flag, which triggers the same policy again, creating an infinite loop.

## Solution
We've implemented two approaches to fix this issue:

### Approach 1: Using LIMIT in EXISTS Queries
In `020_fix_infinite_recursion_policies.sql`, we added `LIMIT 1` to EXISTS clauses to prevent full table scans that could trigger recursion.

### Approach 2: Custom Function (Recommended)
In `021_improved_admin_check_function.sql`, we created a dedicated PostgreSQL function `is_admin_user()` that safely checks admin status without causing recursion.

## Implementation Steps

1. Execute the SQL scripts in the following order:
   ```sql
   -- First, run the function-based approach
   \i scripts/021_improved_admin_check_function.sql
   
   -- If you still have issues, you can also run the LIMIT-based approach
   \i scripts/020_fix_infinite_recursion_policies.sql
   ```

2. The updated `check-admin.ts` file now uses the RPC call to the `is_admin_user()` function instead of direct table queries.

## How It Works
The `is_admin_user()` function:
1. Directly queries the profiles table for the current user's admin status
2. Uses LIMIT 1 to prevent full table scans
3. Handles exceptions gracefully
4. Returns a boolean value indicating admin status

This approach eliminates recursion by encapsulating the admin check in a separate function that doesn't trigger the same RLS policies.

## Verification
After applying the fix:
1. Log in as an admin user
2. Navigate to the admin product creation page
3. Try to create a new product
4. The operation should complete successfully without the recursion error

## Prevention
To avoid similar issues in the future:
1. Always use LIMIT in EXISTS clauses when querying the same table
2. Prefer dedicated functions for complex permission checks
3. Test admin functionalities thoroughly after modifying RLS policies