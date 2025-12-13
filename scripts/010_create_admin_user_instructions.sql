-- Instructions for creating the admin user
-- ===========================================
-- 
-- To create the admin user with credentials:
-- Email: administrator@skinnova.ng
-- Password: administrator
--
-- Follow these steps:
--
-- 1. Go to the sign-up page of your application
-- 2. Sign up with email: administrator@skinnova.ng
-- 3. Use password: administrator
-- 4. Confirm your email through the confirmation link
-- 5. Then run this SQL to make the user an admin:

UPDATE profiles 
SET is_admin = true 
WHERE email = 'administrator@skinnova.ng';

-- That's it! You can now log in as admin with:
-- Email: administrator@skinnova.ng
-- Password: administrator
