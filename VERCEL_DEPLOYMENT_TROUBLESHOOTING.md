# Vercel Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Deployment Not Showing in Vercel Dashboard

#### Possible Causes:
1. Repository not properly connected to Vercel
2. Wrong branch being monitored (should be `master`, not `main`)
3. Vercel integration issues

#### Solutions:
1. **Verify Repository Connection**:
   - Go to your Vercel dashboard
   - Check if the `skinnova-ecommerce` repository is listed
   - If not, import the repository manually:
     - Click "New Project"
     - Select "Import Git Repository"
     - Choose the `skinnova-ecommerce` repository
     - Make sure to select the `master` branch

2. **Check Branch Configuration**:
   - In Vercel project settings, verify that `master` is set as the production branch
   - The project uses `master` as the default branch, not `main`

3. **Redeploy Manually**:
   - In Vercel dashboard, go to your project
   - Click on "Deployments"
   - Click "Redeploy" for the latest commit

### 2. Environment Variables Missing

#### Required Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
DEFAULT_PAYMENT_GATEWAY=paystack
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
CRON_SECRET=your-random-secret-string
```

#### Solution:
- Add all required environment variables in Vercel project settings
- Go to your project → Settings → Environment Variables
- Add each variable with the appropriate values

### 3. Build Failures

#### Common Build Issues:
1. TypeScript errors (though `ignoreBuildErrors` is set to true)
2. Dependency installation issues
3. Node.js version compatibility

#### Solutions:
1. **Check Build Logs**:
   - In Vercel dashboard, go to your project
   - Click on "Deployments"
   - Select the latest deployment
   - Check the build logs for specific error messages

2. **Node.js Version**:
   - Ensure Vercel is using a compatible Node.js version
   - Add an `.nvmrc` file to specify the Node version:
     ```
     18.x
     ```

3. **Dependency Issues**:
   - Clear Vercel's build cache:
     - Go to project settings → General → Click "Cancel Builds" if any are running
     - Then redeploy

### 4. Git Hooks Issues

#### Solution:
- Make sure your local repository is properly synced with GitHub
- Recent commits have been pushed to the `master` branch

## Manual Deployment Steps

If automatic deployment continues to fail:

1. **Export the Project**:
   ```bash
   # Export as static files
   npm run build
   ```

2. **Deploy Manually via Vercel CLI**:
   ```bash
   # Install Vercel CLI globally
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

## Verification Checklist

Before contacting support, verify:

- [ ] Repository is connected to Vercel
- [ ] Correct branch (`master`) is selected
- [ ] All environment variables are set
- [ ] Recent commits are pushed to GitHub
- [ ] No build errors in Vercel logs
- [ ] Vercel integration is active

## Contact Support

If all else fails:
1. Collect build logs from Vercel
2. Document the exact error messages
3. Contact Vercel support with:
   - Project name
   - Repository URL
   - Error messages
   - Steps already taken