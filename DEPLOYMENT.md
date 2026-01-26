# Deploying Crystal XI to Vercel

This guide will walk you through deploying Crystal XI to Vercel, a popular hosting platform for Next.js applications.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas cluster set up and accessible

## Step 1: Prepare Your MongoDB Atlas

### Allow Vercel IP Addresses

Vercel uses dynamic IP addresses, so you need to allow all IPs to connect to your MongoDB Atlas cluster:

1. Go to your MongoDB Atlas dashboard
2. Navigate to **Network Access** (or **IP Access List**)
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (or add `0.0.0.0/0`)
5. Click **Confirm**

⚠️ **Security Note**: This allows any IP to connect. Make sure your MongoDB connection string uses a strong password and your database user has limited permissions.

## Step 2: Push Your Code to Git

If you haven't already, push your code to a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repository-url>
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. **Configure Environment Variables** (see Step 4 below)
6. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

## Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | `your-random-string` | A random secret (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |

### Setting NEXTAUTH_URL

- **For Production**: Use your Vercel deployment URL (e.g., `https://crystal-xi.vercel.app`)
- **For Preview Deployments**: Vercel automatically provides `VERCEL_URL` environment variable

### Automatic NEXTAUTH_URL (Recommended)

You can update your code to automatically use the Vercel URL. Update `lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  // ... existing config
  // NEXTAUTH_URL will be automatically set by Vercel
}
```

Or use this in your environment variables:
- For Production: `NEXTAUTH_URL=https://your-app.vercel.app`
- For Preview: Vercel sets `VERCEL_URL` automatically, but you may need to handle it in code

## Step 5: Update NextAuth Configuration (Optional)

To automatically handle both production and preview URLs, you can update your auth configuration:

```typescript
// lib/auth.ts
const baseUrl = process.env.NEXTAUTH_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4000');
```

However, the current setup should work fine if you set `NEXTAUTH_URL` correctly in Vercel.

## Step 6: Verify Deployment

1. After deployment, visit your Vercel URL
2. Test user registration
3. Test login functionality
4. Test FPL team connection
5. Verify the planner loads correctly

## Step 7: Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Update `NEXTAUTH_URL` environment variable to match your custom domain
5. Follow DNS configuration instructions

## Environment Variables Summary

### Development (.env.local)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fpl-planner?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secret-key-here
```

### Production (Vercel)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fpl-planner?retryWrites=true&w=majority
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here (same as development or generate new one)
```

## Troubleshooting

### MongoDB Connection Errors

- **Issue**: "MongoServerError: connection timed out"
- **Solution**: 
  - Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
  - Check your connection string is correct
  - Ensure your database user has proper permissions

### NextAuth Errors

- **Issue**: "NEXTAUTH_URL is not set"
- **Solution**: 
  - Set `NEXTAUTH_URL` in Vercel environment variables
  - Use your full Vercel URL (e.g., `https://crystal-xi.vercel.app`)
  - Redeploy after adding environment variables

### Build Errors

- **Issue**: Build fails on Vercel
- **Solution**:
  - Check build logs in Vercel dashboard
  - Ensure all dependencies are in `package.json`
  - Verify TypeScript compilation passes locally (`npm run build`)

### API Route Errors

- **Issue**: API routes return 500 errors
- **Solution**:
  - Check Vercel function logs
  - Verify environment variables are set correctly
  - Ensure MongoDB connection is working

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- **Production**: Deploys from `main` branch
- **Preview**: Creates preview deployments for pull requests

## Performance Optimization

Vercel automatically optimizes Next.js apps, but you can:
- Enable Edge Functions for API routes (if needed)
- Use Vercel's Image Optimization
- Configure caching headers in `next.config.ts`

## Monitoring

- Check **Analytics** tab in Vercel dashboard for performance metrics
- Monitor **Logs** for errors and debugging
- Set up **Alerts** for deployment failures

## Cost Considerations

- **Hobby Plan**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth
  - Serverless functions
  - Perfect for personal projects

- **Pro Plan**: If you need more resources or team features

## Next Steps

After deployment:
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Consider adding a custom domain
4. Share your app with users!

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)


