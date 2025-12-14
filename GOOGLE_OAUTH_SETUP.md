# Google OAuth Setup Guide

## Prerequisites
1. A Google Cloud Platform account
2. A project in Google Cloud Console
3. OAuth 2.0 credentials from Google

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   Replace `your-project-ref` with your actual Supabase project reference.

7. Save the credentials and note the Client ID and Client Secret

## Step 2: Configure Supabase Authentication

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list of providers
4. Toggle it to "Enabled"
5. Enter the Google Client ID and Client Secret from Step 1
6. Save the configuration

## Step 3: Update Environment Variables

Add the following to your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Test Google Authentication

1. Start your Next.js application
2. Navigate to the login or signup page
3. Click the "Sign in with Google" or "Sign up with Google" button
4. You should be redirected to Google's OAuth flow

## Troubleshooting

### Common Issues:
1. **Redirect URI mismatch**: Ensure the redirect URI in Google Cloud Console matches your Supabase project's callback URL
2. **Invalid client ID/secret**: Double-check that you've entered the correct credentials in Supabase
3. **CORS errors**: Make sure your site URL is properly configured in Google Cloud Console

### Debugging Tips:
1. Check the browser console for any error messages
2. Review the Supabase authentication logs
3. Verify that the OAuth credentials are properly configured in both Google Cloud Console and Supabase

## How It Works

The implementation uses Supabase's `signInWithOAuth` method which:
1. Redirects users to Google's OAuth consent screen
2. After successful authentication, Google redirects back to your Supabase project
3. Supabase handles the token exchange and creates a session
4. Users are redirected back to your application

The Google Auth Button component we created:
1. Uses the Supabase client to initiate OAuth flow
2. Handles redirects properly
3. Provides a consistent UI with other authentication methods