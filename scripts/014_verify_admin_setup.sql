-- =====================================================
-- Verify and Fix Admin Setup
-- =====================================================

-- 1. Check if is_admin column exists in profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_admin column to profiles table';
    ELSE
        RAISE NOTICE 'is_admin column already exists';
    END IF;
END $$;

-- 2. List all current users and their admin status
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. To make a specific user an admin, uncomment and modify this line:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

-- 4. Verify RLS policies for products
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- 5. Test if admin policies exist
DO $$
BEGIN
    -- Check for admin insert policy
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Admins can insert products'
    ) THEN
        RAISE NOTICE 'Admin insert policy exists';
    ELSE
        RAISE WARNING 'Admin insert policy MISSING - run script 007_add_admin_role.sql';
    END IF;

    -- Check for admin update policy
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Admins can update products'
    ) THEN
        RAISE NOTICE 'Admin update policy exists';
    ELSE
        RAISE WARNING 'Admin update policy MISSING - run script 007_add_admin_role.sql';
    END IF;

    -- Check for admin delete policy
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Admins can delete products'
    ) THEN
        RAISE NOTICE 'Admin delete policy exists';
    ELSE
        RAISE WARNING 'Admin delete policy MISSING - run script 007_add_admin_role.sql';
    END IF;
END $$;
