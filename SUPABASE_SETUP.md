# Supabase Setup Guide

To get your Skinnova e-commerce application working properly, you need to set up a Supabase project and configure the database.

## 1. Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com/) and create an account
2. Create a new project with any name you prefer
3. Wait for the project to be provisioned (this may take a few minutes)

## 2. Get Your Supabase Credentials

Once your project is ready, navigate to the project dashboard and find:

1. **Project URL**: In the project settings, you'll find your project URL
2. **API Keys**: Go to Settings > API to find:
   - **anon key** (public key)
   - **service_role key** (secret key - keep this private)

## 3. Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

## 4. Set Up Database Tables

Run the following SQL scripts in order in your Supabase SQL editor:

1. `scripts/001_create_tables.sql` - Creates all database tables with RLS policies
2. `scripts/002_seed_products.sql` - Seeds 8 skincare products
3. `scripts/003_create_profile_trigger.sql` - Auto-creates user profiles on signup
4. `scripts/007_add_admin_role.sql` - Adds is_admin column to profiles table

## 5. Set Up Admin Access

### Step 1: Sign Up
1. Go to `/auth/sign-up` on your deployed site
2. Sign up with:
   - **Email**: `administrator@skinnova.ng`
   - **Password**: `administrator`
3. Confirm your email (check your inbox)

### Step 2: Grant Admin Access
After signing up and confirming email, run this SQL query in Supabase:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'administrator@skinnova.ng';
```

### Step 3: Access Admin Dashboard
1. Log in with your admin credentials
2. Visit `/admin` to access the dashboard
3. You can now:
   - View analytics (revenue, orders, customers)
   - Manage all products (edit, delete, add new)
   - View and update order statuses
   - View customer information

## 6. Set Up Storage (Optional but Recommended)

To enable product image uploads, run:

1. `scripts/013_create_storage_bucket.sql` - Creates storage bucket for product images

Then in your Supabase dashboard:
1. Go to Storage > Buckets
2. Find the "product-images" bucket
3. Click on it and then click "Settings"
4. Set the bucket to public access

## 7. Redeploy Your Application

After setting up all environment variables, redeploy your Vercel application for the changes to take effect.

## Troubleshooting

### Product Editing Issues
If you still can't edit products:
1. Ensure you're logged in as an admin user
2. Check that all SQL scripts have been run successfully
3. Verify environment variables are correctly set in Vercel

### Database Connection Errors
If you see database connection errors:
1. Double-check your Supabase URL and anon key
2. Ensure there are no typos in the environment variables
3. Make sure the database tables exist

### Missing Pages
If you see 404 errors for pages like /about, /contact, etc.:
These have been fixed in the latest version. Redeploy your application to apply the changes.