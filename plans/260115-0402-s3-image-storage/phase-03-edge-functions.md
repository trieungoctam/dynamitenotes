# Phase 3: Edge Functions Development

**Status**: `pending`
**Duration**: 4 hours
**Dependencies**: Phase 1 (infrastructure), Phase 2 (database)

---

## Objectives

Create Supabase Edge Functions for presigned URL generation and S3 object deletion with proper authentication and error handling.

---

## Prerequisites

- AWS credentials configured
- Supabase CLI installed
- Deno runtime understanding
- S3 bucket + CloudFront deployed

---

## Tasks

### 3.1 Setup Edge Functions Project (20 min)

**Initialize**:
```bash
supabase functions initialize
```

**Install dependencies** (in Edge Function):
```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "npm:@aws-sdk/client-s3@3"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3"
```

---

### 3.2 Create Shared S3 Client Module (30 min)

**File**: `supabase/functions/_shared/s3-client.ts`

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "npm:@aws-sdk/client-s3@3"

// Singleton S3 client
let s3Client: S3Client | null = null

export function getS3Client(): S3Client {
  if (!s3Client) {
    const region = Deno.env.get('AWS_REGION') || 'ap-southeast-1'
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured')
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })
  }

  return s3Client
}

export function getS3Bucket(): string {
  const bucket = Deno.env.get('S3_BUCKET')
  if (!bucket) throw new Error('S3_BUCKET not configured')
  return bucket
}
```

---

### 3.3 Implement Presigned URL Generator (90 min)

**File**: `supabase/functions/generate-upload-url/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getS3Client, getS3Bucket } from "../_shared/s3-client.ts"
import { PutObjectCommand } from "npm:@aws-sdk/client-s3@3"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    // 1. Validate HTTP method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 2. Authenticate request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 4. Verify user session
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. Parse request body
    const { bucket, contentType = 'image/webp' } = await req.json()

    if (!bucket || !['photos', 'posts'].includes(bucket)) {
      return new Response(
        JSON.stringify({ error: 'Invalid bucket' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 6. Generate unique keys for each size
    const uuid = crypto.randomUUID()
    const sizes = ['thumbnail', 'medium', 'large']
    const s3Client = getS3Client()
    const s3Bucket = getS3Bucket()

    const urls: Record<string, { url: string; key: string }> = {}

    for (const size of sizes) {
      const key = `${bucket}/${uuid}/${size}.webp`

      const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable'
      })

      // Generate presigned URL (15 min expiry)
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 900 // 15 minutes
      })

      urls[size] = { url, key }
    }

    // 7. Return response
    return new Response(
      JSON.stringify({
        success: true,
        uuid,
        urls,
        bucket: s3Bucket,
        region: Deno.env.get('AWS_REGION')
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    )

  } catch (error) {
    console.error('Error generating upload URL:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
```

---

### 3.4 Implement S3 Object Deleter (60 min)

**File**: `supabase/functions/delete-s3-object/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getS3Client, getS3Bucket } from "../_shared/s3-client.ts"
import { DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    // 1. Validate method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 2. Authenticate
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 3. Verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return new Response('Invalid token', { status: 401 })
    }

    // 4. Parse request
    const { s3Key } = await req.json()

    if (!s3Key) {
      return new Response(
        JSON.stringify({ error: 's3Key required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. Delete all sizes
    const sizes = ['thumbnail', 'medium', 'large']
    const s3Client = getS3Client()
    const s3Bucket = getS3Bucket()

    const baseKey = s3Key.replace(/\/(thumbnail|medium|large)\.webp$/, '')

    await Promise.all(
      sizes.map(size =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: s3Bucket,
            Key: `${baseKey}/${size}.webp`
          })
        )
      )
    )

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error deleting S3 object:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### 3.5 Add Rate Limiting (30 min)

**Simple in-memory rate limiter**:

```typescript
// supabase/functions/_shared/rate-limiter.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}
```

**Usage in Edge Function**:
```typescript
// In generate-upload-url/index.ts
import { checkRateLimit } from "../_shared/rate-limiter.ts"

// After authentication
if (!checkRateLimit(user.id, 10, 60000)) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  )
}
```

---

### 3.6 Deploy Edge Functions (20 min)

**Set secrets**:
```bash
supabase secrets set AWS_ACCESS_KEY_ID="your-key"
supabase secrets set AWS_SECRET_ACCESS_KEY="your-secret"
supabase secrets set AWS_REGION="ap-southeast-1"
supabase secrets set S3_BUCKET="dynamite-notes-images"
```

**Deploy functions**:
```bash
supabase functions deploy generate-upload-url
supabase functions deploy delete-s3-object
```

---

## Verification Checklist

- [ ] S3 client module created
- [ ] Presigned URL generator works
- [ ] Authenticated requests succeed
- [ ] Unauthenticated requests fail (401)
- [ ] Invalid buckets rejected
- [ ] URLs expire after 15 minutes
- [ ] Deleter function works
- [ ] All 3 sizes deleted
- [ ] Rate limiting works
- [ ] Functions deployed to Supabase
- [ ] Environment variables set

---

## Testing

**Test presigned URL generation**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-upload-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bucket": "photos"}'
```

**Expected response**:
```json
{
  "success": true,
  "uuid": "abc-123-def",
  "urls": {
    "thumbnail": { "url": "https://s3...?signature=...", "key": "photos/abc-123-def/thumbnail.webp" },
    "medium": { "url": "...", "key": "photos/abc-123-def/medium.webp" },
    "large": { "url": "...", "key": "photos/abc-123-def/large.webp" }
  },
  "bucket": "dynamite-notes-images",
  "region": "ap-southeast-1"
}
```

**Test presigned URL upload**:
```bash
# Use returned URL to upload
curl -X PUT "https://s3...?signature=..." \
  -H "Content-Type: image/webp" \
  --data-binary @test-image.webp
```

**Test deleter**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/delete-s3-object \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"s3Key": "photos/abc-123-def/large.webp"}'
```

---

## Error Handling

| Error Code | Description | Action |
|------------|-------------|---------|
| 400 | Invalid bucket or missing s3Key | Client validation |
| 401 | Invalid/expired token | Re-authenticate |
| 429 | Rate limit exceeded | Retry after delay |
| 500 | AWS SDK error | Check CloudWatch |

---

## Next Phase

Once Edge Functions are deployed and tested, proceed to **Phase 4: Browser Image Optimization**.
