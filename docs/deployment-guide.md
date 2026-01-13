# Deployment Guide

This guide covers deploying Dynamite Notes to production on Vercel.

## Prerequisites

1. **Supabase Project**
   - Create a project at [supabase.com](https://supabase.com)
   - Run database migrations to create tables
   - Enable Row Level Security (RLS)
   - Create an admin user in Auth and `admins` table

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Install GitHub integration (recommended)

3. **Domain (Optional)**
   - Custom domain for production
   - Configure DNS after deployment

## Pre-Deployment Checklist

### 1. Seed Taxonomy Data

Run the taxonomy seed script to populate goals and outcomes:

```bash
SUPABASE_URL=your_supabase_url \
SUPABASE_SERVICE_KEY=your_service_key \
bun run scripts/seed-taxonomy.ts
```

### 2. Set Environment Variables

Create `.env.production` or set in Vercel dashboard:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://your-domain.com
```

**Important:** Use production Supabase credentials, not development keys.

### 3. Build Verification

Test production build locally:

```bash
bun run build
bun run preview
```

Visit `http://localhost:4173` to verify.

## Deployment Methods

### Method A: Vercel CLI (Recommended for First Deploy)

1. **Install Vercel CLI**
   ```bash
   bun add -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Method B: Vercel Dashboard (Recommended for Ongoing)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Connect your GitHub repository
   - Import the repository

2. **Configure Build**
   - **Framework Preset:** Vite
   - **Build Command:** `bun run build`
   - **Output Directory:** `dist`
   - **Install Command:** `bun install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the variables from Pre-Deployment Checklist

4. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on git push to main branch

### Method C: GitHub Integration (Best for CI/CD)

1. **Install Vercel GitHub App**
   - Connect Vercel to your GitHub account

2. **Configure Project**
   - Import repository in Vercel dashboard
   - Configure build settings as above

3. **Auto-Deploy**
   - Push to `main` branch → automatic production deploy
   - Push to other branches → preview deployments

## Post-Deployment Tasks

### 1. Verify Deployment

- [ ] Homepage loads at production URL
- [ ] All 7 pages accessible (/, /posts, /insights, /series, /photos, /resume, /about)
- [ ] Search page works
- [ ] Admin login works
- [ ] Language toggle works

### 2. Test Admin Panel

- [ ] Log in at `/login`
- [ ] Create a test post
- [ ] Upload an image
- [ ] Publish post
- [ ] Verify post appears on public site

### 3. Configure Domain (Optional)

**For Custom Domain:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for DNS propagation (15-60 min)

**Vercel Domain:**
- Your site is available at `https://your-project.vercel.app`

### 4. Set Up Analytics

Vercel Analytics is already integrated. View metrics at:
`https://vercel.com/dashboard/your-project/analytics`

### 5. Monitor Error Logs

Check Vercel Logs for any runtime errors:
`https://vercel.com/dashboard/your-project/logs`

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_SITE_URL` | No | Production URL for SEO meta tags |
| `VITE_BUTTONDOWN_API_KEY` | No | Newsletter integration |

## Rollback Procedure

If issues occur after deployment:

### Quick Rollback (Vercel)
```bash
vercel rollback
```

### Manual Rollback
1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "Promote to Production"

### Data Rollback
- Use Supabase Dashboard → Database → Backups
- Or point-in-time recovery (if enabled)

## Performance Optimization

After deployment, check:

1. **Lighthouse Score**
   - Run Lighthouse audit on production URL
   - Target: Performance > 90, SEO > 90

2. **Core Web Vitals**
   - Check Vercel Analytics → Core Web Vitals
   - Monitor LCP, FID, CLS metrics

3. **Bundle Size**
   - Check build output for large chunks
   - Consider additional code splitting if needed

## Troubleshooting

### Build Fails

**Error: "Environment variable not found"**
- Set environment variables in Vercel dashboard
- Redeploy after setting variables

**Error: "Module not found"**
- Run `bun install` locally
- Commit `bun.lockb` to repository

### Runtime Errors

**Error: "Supabase connection failed"**
- Verify `VITE_SUPABASE_URL` is correct
- Check Supabase project is active
- Verify RLS policies allow public access for reads

**Error: "404 on refresh"**
- Verify `vercel.json` includes rewrites rule
- Check SPA fallback is configured

### Performance Issues

**Slow page loads**
- Check Vercel Edge Network location
- Verify images are optimized
- Check bundle size in build output

## Security Checklist

- [ ] Production API keys different from dev
- [ ] Supabase service role key NOT exposed to client
- [ ] RLS policies enabled on all tables
- [ ] Admin routes protected with authentication
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured in `vercel.json`

## Continuous Monitoring

### Daily/Weekly
- Check Vercel Analytics for traffic trends
- Review error logs in Vercel Dashboard
- Monitor Supabase quota usage

### Monthly
- Review Core Web Vitals
- Check for outdated dependencies
- Update `bun` and dependencies

## Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)

## Next Steps

After successful deployment:

1. Create your first content
2. Set up regular backups
3. Configure custom domain (if desired)
4. Add analytics tracking goals
5. Set up uptime monitoring
6. Document any custom configurations

---

**Last Updated:** 2026-01-13
