# Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. A Supabase project set up with all migrations applied
2. A Groq API key configured in Supabase secrets
3. All environment variables configured

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app

5. **Custom Domain (Optional)**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Environment Variables**
   Add in Site settings > Build & deploy > Environment:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy

### Option 3: Cloudflare Pages

1. **Connect Repository**
   - Go to Cloudflare Pages
   - Create a new project
   - Connect your Git repository

2. **Configure Build**
   - Framework preset: None
   - Build command: `npm run build`  
   - Build output directory: `dist`

3. **Environment Variables**
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy**
   - Save and Deploy

## Supabase Configuration

### 1. Authentication Setup

Configure your auth settings in Supabase Dashboard:

1. Go to Authentication > URL Configuration
2. Set **Site URL** to your deployed URL (e.g., `https://your-app.vercel.app`)
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `http://localhost:5173/**` (for local development)

### 2. Database Migrations

Ensure all migrations are applied:
```bash
# Check migration status in Supabase Dashboard
# Database > Migrations
```

### 3. Edge Functions

Edge functions are automatically deployed through Supabase. Verify in:
- Supabase Dashboard > Edge Functions

Required functions:
- `chat-with-agent`
- `analyze-file`
- `process-automations`

### 4. Storage Buckets

Verify storage buckets exist:
- `agent-files` - For agent avatars and user uploads

Configure RLS policies are in place for secure access.

### 5. Secrets Management

Set required secrets in Supabase Dashboard > Settings > Edge Functions:
- `GROQ_API_KEY` - Your Groq API key

## Post-Deployment Checklist

### Functionality Tests
- [ ] User can sign up and sign in
- [ ] User can create an agent
- [ ] Chat functionality works
- [ ] File upload works
- [ ] Marketplace shows public agents
- [ ] User profiles load correctly
- [ ] Automations can be created
- [ ] Comments and ratings work

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Chat responses are fast
- [ ] Images load properly
- [ ] No console errors

### Security Tests
- [ ] RLS policies are working
- [ ] Auth redirects work correctly
- [ ] Private agents stay private
- [ ] API keys are not exposed

## Monitoring

### Application Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API response times
- Track user engagement metrics

### Supabase Monitoring
- Check Database > Logs for errors
- Monitor Edge Function logs
- Watch database performance metrics
- Check storage usage

## Troubleshooting

### Common Issues

**Issue: "Failed to fetch" errors**
- Check CORS settings in Supabase
- Verify environment variables are set
- Check edge function logs

**Issue: Authentication redirects to localhost**
- Update Site URL in Supabase Auth settings
- Add correct redirect URLs

**Issue: Images not loading**
- Check storage bucket policies
- Verify file upload permissions
- Check network tab for CORS errors

**Issue: Edge functions timing out**
- Check Groq API key is set
- Verify RLS policies allow data access
- Check edge function logs for errors

## Scaling Considerations

### Database
- Monitor query performance
- Add indexes for frequently queried columns
- Consider connection pooling for high traffic

### Edge Functions
- Monitor execution time
- Implement caching where appropriate
- Consider rate limiting

### Storage
- Implement CDN for static assets
- Optimize image sizes
- Set up automatic backups

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review database performance monthly
- Update dependencies quarterly
- Backup database regularly

### Updates
- Test in staging before production
- Use feature flags for gradual rollouts
- Have rollback plan ready

## Support

For deployment issues:
1. Check Supabase logs
2. Review edge function logs  
3. Check browser console
4. Review network requests
5. Contact support if needed