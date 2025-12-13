# Skinnova.ng E-commerce Setup Instructions

## Database Setup

Run the SQL scripts in order:

1. **001_create_tables.sql** - Creates all database tables with RLS policies
2. **002_seed_products.sql** - Seeds 8 skincare products
3. **003_create_profile_trigger.sql** - Auto-creates user profiles on signup
4. **007_add_admin_role.sql** - Adds is_admin column to profiles table
5. **009_fix_product_images_and_admin.sql** - Updates all product images to real paths

## Admin User Setup

### Step 1: Sign Up
1. Go to `/auth/sign-up`
2. Sign up with:
   - **Email**: `administrator@skinnova.ng`
   - **Password**: `administrator`
3. Confirm your email (check your inbox)

### Step 2: Grant Admin Access
After signing up and confirming email, run this SQL query in Supabase:

\`\`\`sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'administrator@skinnova.ng';
\`\`\`

### Step 3: Access Admin Dashboard
1. Log in with your admin credentials
2. Visit `/admin` to access the dashboard
3. You can now:
   - View analytics (revenue, orders, customers)
   - Manage all products (edit, delete, add new)
   - View and update order statuses
   - View customer information

## Product Management

### Edit Products
1. Go to `/admin/products`
2. Click the pencil icon on any product
3. You can edit:
   - Product name, slug, descriptions
   - Pricing (in Nigerian Naira ₦)
   - Category and stock quantity
   - **Main image URL** (e.g., `/images/product.jpg`)
   - **Additional images** (comma-separated URLs)
   - Ingredients and benefits
   - Featured/Bestseller status

### Add New Products
1. Go to `/admin/products`
2. Click "Add Product" button
3. Fill in all product details including images
4. Submit to create the new product

## Product Images

All 8 products have been assigned real skincare product images:

1. Hydrating Facial Cleanser - `/images/gentle-cleanser.jpg`
2. Vitamin C Brightening Serum - `/images/vitamin-c-serum.jpg`
3. Niacinamide Pore Refining Toner - `/images/exfoliating-toner.jpg`
4. Retinol Renewal Night Cream - `/images/retinol-night-cream.jpg`
5. Hyaluronic Acid Hydrating Serum - `/images/hydrating-serum.jpg`
6. SPF 50 Mineral Sunscreen - `/images/sunscreen-spf50.jpg`
7. Gentle Exfoliating AHA BHA Serum - `/images/exfoliating-serum.jpg`
8. Ceramide Barrier Repair Cream - `/images/barrier-cream.jpg`

Each product also has 2 additional images for the product gallery.

## Currency

All prices are displayed in Nigerian Naira (₦) with proper formatting:
- Products: ₦XX,XXX (no decimals)
- Shipping: ₦10,000
- Free shipping threshold: ₦80,000

## Features Implemented

### Customer Features
- Browse products by category
- Search functionality
- Product detail pages with reviews
- Shopping cart (saved for logged-in users)
- Checkout with shipping address management
- User accounts with order history
- Write product reviews

### Admin Features
- Analytics dashboard with revenue, orders, customers stats
- Product management (CRUD operations)
- Order management with status updates
- Customer list view
- Protected admin routes (requires is_admin = true)

### Authentication
- Email/password authentication via Supabase
- Protected routes for account and admin areas
- Session management with middleware
- Automatic profile creation on signup

## Troubleshooting

### Admin Access Issues
- Make sure you've run the `007_add_admin_role.sql` script
- Verify the UPDATE query ran successfully
- Try logging out and back in

### Product Images Not Showing
- Verify the image paths in the database match the files in `/public/images/`
- Run the `009_fix_product_images_and_admin.sql` script to update all images

### Database Errors
- Ensure all migration scripts are run in order
- Check Supabase logs for specific error messages
