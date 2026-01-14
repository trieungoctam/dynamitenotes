# Phase 8: Migration & Deployment

**Status**: `pending`
**Duration**: 1 hour
**Dependencies**: Phase 7 (Testing Complete)

---

## Objectives

Deploy infrastructure to production, run database migration, deploy Edge Functions, update application, and monitor initial traffic.

---

## Prerequisites

- All tests passing
- AWS credentials configured
- Supabase project access
- Deployment access (Vercel/Netlify)

---

## Tasks

### 8.1 Pre-Deployment Checklist (15 min)

**Infrastructure**:
- [ ] CloudFormation/Terraform stack reviewed
- [ ] S3 bucket name confirmed (unique)
- [ ] CloudFront distribution planned
- [ ] ACM certificate requested (if custom domain)
- [ ] Route 53 records prepared

**Environment Variables**:
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION (ap-southeast-1)
- [ ] S3_BUCKET
- [ ] VITE_CLOUDFRONT_DOMAIN
- [ ] VITE_USE_S3 (start as false)

**Rollback Plan**:
- [ ] Feature flag ready
- [ ] Database backup created
- [ ] Supabase Storage kept active (7 days)
- [ ] Rollback procedure documented

---

### 8.2 Deploy AWS Infrastructure (15 min)

**Option 1: CloudFormation**
```bash
# Deploy stack
aws cloudformation create-stack \
  --stack-name dynamite-notes-images \
  --template-body file://infrastructure/s3-cloudfront.yaml \
  --capabilities CAPABILITY_IAM \
  --region ap-southeast-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name dynamite-notes-images

# Get outputs
aws cloudformation describe-stacks \
  --stack-name dynamite-notes-images \
  --query 'Stacks[0].Outputs'
```

**Option 2: Terraform**
```bash
# Initialize
cd infrastructure/terraform
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Get outputs
terraform output
```

**Save outputs** to `.env.production`:
```bash
S3_BUCKET=dynamite-notes-images
CLOUDFRONT_DOMAIN=d1abc123.cloudfront.net
CLOUDFRONT_DISTRIBUTION_ID=E1234ABCD
```

---

### 8.3 Deploy Edge Functions (10 min)

**Set secrets** (via Supabase Dashboard):
```bash
supabase secrets set AWS_ACCESS_KEY_ID="AKIA..." --project-ref YOUR_PROJECT_ID
supabase secrets set AWS_SECRET_ACCESS_KEY="..." --project-ref YOUR_PROJECT_ID
supabase secrets set AWS_REGION="ap-southeast-1" --project-ref YOUR_PROJECT_ID
supabase secrets set S3_BUCKET="dynamite-notes-images" --project-ref YOUR_PROJECT_ID
```

**Deploy functions**:
```bash
supabase functions deploy generate-upload-url --project-ref YOUR_PROJECT_ID
supabase functions deploy delete-s3-object --project-ref YOUR_PROJECT_ID
```

**Verify deployment**:
```bash
# List functions
supabase functions list --project-ref YOUR_PROJECT_ID

# Test function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-upload-url \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"bucket": "photos"}'
```

---

### 8.4 Run Database Migration (10 min)

**Backup first**:
```bash
# Via Supabase Dashboard
# Or via CLI:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Run migration**:
```bash
# Generate migration (if not done)
npx prisma migrate dev --name add_s3_image_metadata

# Apply to production
npx prisma migrate deploy

# Verify
npx prisma studio
```

**Backfill existing records** (if needed):
```bash
npx tsx scripts/backfill-s3-metadata.ts
```

---

### 8.5 Deploy Application (10 min)

**Update environment variables** (Vercel/Netlify):
```bash
# Via CLI
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add S3_BUCKET production
vercel env add VITE_CLOUDFRONT_DOMAIN production
vercel env add VITE_USE_S3 production  # Set to "false" initially
```

**Deploy**:
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

**Verify deployment**:
```bash
# Check environment variables
vercel env ls

# Check logs
vercel logs
```

---

### 8.6 Initial Testing (10 min)

**Smoke tests**:
1. **Upload Test**
   - Navigate to PhotosAdmin
   - Upload test photo
   - Verify S3 keys in database
   - Verify CDN URL accessible
   - Delete photo

2. **CDN Test**
   - Open CloudFront URL in browser
   - Check response headers (Cache-Control)
   - Verify HTTPS

3. **Edge Function Test**
   - Generate presigned URL
   - Upload via curl
   - Verify object in S3

4. **Rollback Test**
   - Set `VITE_USE_S3=false`
   - Deploy
   - Verify Supabase Storage works
   - Set `VITE_USE_S3=true`
   - Deploy

---

### 8.7 Enable S3 Migration (5 min)

**When ready to switch**:
```bash
# Update feature flag
vercel env add VITE_USE_S3 production --value "true"

# Redeploy
vercel --prod
```

**Monitor**:
- Error rates (Sentry/Vercel)
- Upload success rate
- CloudWatch metrics
- CDN cache hit ratio

---

### 8.8 Monitor & Validate (Ongoing)

**CloudWatch Metrics**:
- S3 PutObject requests
- S3 4xx/5xx errors
- CloudFront requests
- CloudFront error rate
- Edge Function invocations

**Alarms**:
```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name s3-upload-errors \
  --alarm-description "Alert on S3 upload errors" \
  --metric-name Errors \
  --namespace AWS/S3 \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=BucketName,Value=dynamite-notes-images
```

---

## Verification Checklist

### Infrastructure
- [ ] S3 bucket created
- [ ] CloudFront distribution deployed
- [ ] OAC configured
- [ ] Bucket policy set
- [ ] CORS configured
- [ ] ACM certificate (if custom domain)

### Edge Functions
- [ ] Functions deployed
- [ ] Secrets configured
- [ ] Auth working
- [ ] Presigned URLs generated
- [ ] Delete working

### Database
- [ ] Migration applied
- [ ] Backfill complete
- [ ] Types regenerated

### Application
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Feature flag works
- [ ] Uploads working
- [ ] CDN serving

### Monitoring
- [ ] CloudWatch alarms set
- [ ] Error tracking enabled
- [ ] Logging configured

---

## Rollback Procedure

**If critical issues occur**:

1. **Immediate rollback** (feature flag):
   ```bash
   vercel env add VITE_USE_S3 production --value "false"
   vercel --prod
   ```

2. **Full rollback** (if needed):
   ```bash
   # Revert database migration
   npx prisma migrate resolve --rolled-back add_s3_image_metadata

   # Delete CloudFront distribution
   aws cloudfront delete-distribution --id E1234ABCD

   # Delete S3 bucket
   aws s3 rb s3://dynamite-notes-images --force
   ```

3. **Verify Supabase Storage working**

---

## Post-Deployment Tasks

**Week 1**:
- Monitor error rates
- Check upload success rate
- Verify CDN caching
- Gather performance metrics

**Week 2**:
- Optimize based on metrics
- Tune cache policies
- Update documentation
- Train users

**Month 1**:
- Review costs (S3 + CloudFront)
- Adjust lifecycle policies
- Archive old images (Glacier)
- Plan capacity expansion

---

## Migration Timeline

| Time | Action | Owner |
|------|--------|-------|
| T-7 days | Testing complete | Dev |
| T-1 day | Database backup | DevOps |
| T-0 | Deploy infrastructure | DevOps |
| T+30min | Deploy Edge Functions | Dev |
| T+1hr | Run migration | Dev |
| T+1.5hr | Deploy app (flag=false) | Dev |
| T+2hr | Smoke tests | QA |
| T+24hr | Enable flag (switch to S3) | Dev |
| T+48hr | Monitor & tune | DevOps |
| T+7 days | Deprecate Supabase Storage | DevOps |

---

## Success Criteria

- [ ] All images upload to S3
- [ ] CDN serving images
- [ ] < 1% upload failure rate
- [ ] < 500ms CDN response time
- [ ] No critical bugs
- [ ] Cost under $60/month
- [ ] Stakeholder approval

---

## Known Issues

**Document any post-deployment issues**:

| Issue | Severity | Workaround | Fix Date |
|-------|----------|------------|----------|
| | | | |

---

## Handoff

**Provide to operations team**:
- Architecture diagram
- Runbook for common issues
- Monitoring dashboard links
- Cost report
- Rollback procedure

---

## Next Steps

**After successful migration**:
1. Remove Supabase Storage files (after 7 days)
2. Update documentation
3. Archive project plan
4. Share lessons learned

---

**Project Complete!** 🎉
