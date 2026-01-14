# AWS S3 Presigned URL Implementation for Direct Browser Uploads

**Research Date:** 2026-01-15
**Status:** Complete

## Executive Summary

Presigned URLs enable secure, direct browser-to-S3 uploads without exposing AWS credentials or routing through your server. Recommended approach for 2024-2025 uses AWS SDK v3 with Supabase Edge Functions (Deno) for URL generation.

---

## 1. How Presigned URLs Work

**Architecture:**
1. Server generates time-limited, cryptographically signed URL
2. Browser uploads directly to S3 using PUT request
3. S3 validates signature without server involvement
4. URL expires after specified duration (max 7 days, recommend 15 min)

**Benefits:**
- Reduced server load and bandwidth costs
- Better upload performance (direct to S3)
- No AWS credential exposure to clients
- Scalable architecture

---

## 2. Security Best Practices (2024-2025)

### Core Security Principles
- **Short expiration:** Limit to 15 minutes max for uploads
- **Minimal permissions:** PUT-only URLs, avoid GET unless needed
- **HTTPS enforcement:** Never allow HTTP
- **Server-side generation:** Never create URLs in browser

### IAM Role Requirements
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:PutObjectAcl"
    ],
    "Resource": "arn:aws:s3:::your-bucket/*"
  }]
}
```

### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::your-bucket/*",
    "Condition": {
      "StringEquals": {
        "s3:signatureversion": "AWS4-HMAC-SHA256"
      }
    }
  }]
}
```

### CORS Configuration (Required for Browser Uploads)
```json
{
  "CORSRules": [{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }]
}
```

**Critical:** `AllowedHeaders: ["*"]` required for presigned URLs. `ExposeHeaders: ["ETag"]` needed for verification.

### Additional Guardrails
- **CloudTrail monitoring:** Log all S3 API calls
- **Rate limiting:** Throttle URL generation requests
- **Content validation:** Scan files post-upload
- **IP restrictions:** Limit URLs to specific IP ranges when possible
- **Unique keys:** Use UUIDs to prevent conflicts

---

## 3. AWS SDK v3 Implementation

### Packages
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Server-Side URL Generation
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!
  }
});

async function generateUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn: number = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn,
    signableHeaders: new Set(['content-type'])
  });

  return url;
}
```

### Client-Side Upload (React)
```typescript
import { useState } from 'react';

async function uploadFile(file: File, presignedUrl: string) {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const etag = response.headers.get('ETag');
    console.log('Upload successful, ETag:', etag);
    return etag;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

function UploadComponent() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    setUploading(true);

    // 1. Get presigned URL from your API
    const response = await fetch('/api/upload-url', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size
      })
    });

    const { url, key } = await response.json();

    // 2. Upload directly to S3
    try {
      const etag = await uploadFile(file, url);
      console.log('File uploaded:', key);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  );
}
```

---

## 4. Supabase Edge Function (Deno)

### Using aws_s3_presign Module
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSignedUrl } from 'https://deno.land/x/aws_s3_presign@v2.2.1/mod.ts';

serve(async (req) => {
  try {
    const { filename, contentType } = await req.json();

    // Generate unique key
    const key = `uploads/${crypto.randomUUID()}/${filename}`;

    const url = getSignedUrl({
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
      secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      region: 'us-east-1',
      bucket: 'your-bucket',
      key,
      method: 'PUT',
      expiresIn: 900
    });

    return new Response(
      JSON.stringify({ url, key }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Alternative: Using AWS SDK v3 in Deno
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  S3Client,
  PutObjectCommand
} from 'npm:@aws-sdk/client-s3@3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!
  }
});

serve(async (req) => {
  const { filename, contentType } = await req.json();
  const key = `uploads/${crypto.randomUUID()}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: 'your-bucket',
    Key: key,
    ContentType: contentType
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 900
  });

  return new Response(
    JSON.stringify({ url, key }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

---

## 5. Upload Progress Tracking

### Using XMLHttpRequest (Better Progress Support)
```typescript
function uploadWithProgress(
  file: File,
  url: string,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const etag = xhr.getResponseHeader('ETag');
        resolve(etag || '');
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

// Usage
const [progress, setProgress] = useState(0);

await uploadWithProgress(file, presignedUrl, (percent) => {
  setProgress(percent);
});
```

---

## 6. Multipart Upload for Large Files (Resumable)

**When to use:** Files > 5MB (S3 requirement) or for resumable uploads

### Server-Side: Initialize Multipart Upload
```typescript
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'us-east-1 });

async function initializeMultipartUpload(
  bucket: string,
  key: string,
  contentType: string
) {
  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const result = await s3Client.send(command);
  return result.UploadId;
}

async function generatePartPresignedUrl(
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number
) {
  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

async function completeMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>
) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts }
  });

  return await s3Client.send(command);
}
```

### Client-Side: Multipart Upload with Resume
```typescript
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadMultipartFile(
  file: File,
  bucket: string,
  key: string,
  uploadId?: string
) {
  // 1. Initialize or resume
  const currentUploadId = uploadId || await initializeMultipartUpload(bucket, key, file.type);

  // 2. Calculate chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const parts: Array<{ PartNumber: number; ETag: string }> = [];

  // 3. Upload each chunk
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    // Get presigned URL for this part
    const partUrl = await generatePartPresignedUrl(
      bucket,
      key,
      currentUploadId,
      i + 1
    );

    // Upload chunk with retry
    const etag = await uploadWithRetry(chunk, partUrl, 3);
    parts.push({ PartNumber: i + 1, ETag: etag });
  }

  // 4. Complete upload
  const result = await completeMultipartUpload(bucket, key, currentUploadId, parts);
  return result;
}

async function uploadWithRetry(
  chunk: Blob,
  url: string,
  maxRetries: number
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: chunk
      });

      if (response.ok) {
        const etag = response.headers.get('ETag');
        if (etag) return etag;
      }
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Upload failed after retries');
}
```

### Resume Logic
```typescript
async function resumeUpload(
  file: File,
  bucket: string,
  key: string,
  uploadId: string
) {
  // List existing parts (server-side)
  const existingParts = await listParts(bucket, key, uploadId);

  // Upload only missing parts
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const parts: Array<{ PartNumber: number; ETag: string }> = [...existingParts];

  for (let i = 0; i < totalChunks; i++) {
    const partNumber = i + 1;

    // Skip if already uploaded
    if (existingParts.find(p => p.PartNumber === partNumber)) {
      continue;
    }

    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const partUrl = await generatePartPresignedUrl(bucket, key, uploadId, partNumber);
    const etag = await uploadWithRetry(chunk, partUrl, 3);
    parts.push({ PartNumber: partNumber, ETag: etag });
  }

  // Sort by PartNumber (critical!)
  parts.sort((a, b) => a.PartNumber - b.PartNumber);

  return await completeMultipartUpload(bucket, key, uploadId, parts);
}
```

**Note:** AWS SDK v3 doesn't natively support resume. Use AWS Amplify or custom implementation shown above.

---

## 7. Error Handling and Retry Logic

### Common Errors
- **400 Bad Request:** Expired URL, wrong content type, missing headers
- **403 Forbidden:** Invalid signature, IAM permissions
- **404 Not Found:** Bucket doesn't exist
- **CORS errors:** Bucket CORS misconfigured

### Retry Strategy
```typescript
async function uploadWithExponentialBackoff(
  file: File,
  url: string,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      return; // Success
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error; // Final attempt failed
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Timeout Handling
```typescript
function uploadWithTimeout(
  file: File,
  url: string,
  timeoutMs: number
): Promise<void> {
  return Promise.race([
    fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout')), timeoutMs)
    )
  ]);
}
```

---

## 8. Best Practices for 2024-2025

### Performance
- **Chunk size:** 5-10MB for multipart uploads
- **Parallel uploads:** 3-5 concurrent parts
- **Transfer acceleration:** Enable for long-distance uploads
- **Client-side compression:** Compress before upload when possible

### Security
- **Validate file types:** Check magic bytes, not just extensions
- **Size limits:** Enforce max file sizes server-side
- **Virus scanning:** Scan uploads asynchronously
- **Audit logging:** Track all uploads in CloudTrail

### Cost Optimization
- **S3 Lifecycle policies:** Move old files to Glacier
- **Monitoring alerts:** Set billing alarms
- **Request metrics:** Use CloudWatch for insights

### User Experience
- **Progress indicators:** Show upload percentage
- **Cancel support:** Allow aborting uploads
- **Retry UI:** Auto-retry with manual override
- **Resume capability:** For large files

---

## 9. Alternative Approaches

### S3 Access Points
- Granular access control per application
- Network origin restrictions
- Better for multi-tenant scenarios

### AWS Transfer Family
- Managed SFTP, FTPS, FTP
- Additional compliance features
- Higher cost

### Amplify Storage
- Built-in resumable uploads
- Simpler API
- AWS ecosystem lock-in

---

## Unresolved Questions

1. **Deno AWS SDK compatibility:** Need to verify full feature parity with Node.js SDK v3
2. **Presigned URL refresh:** Strategy for long-running uploads approaching URL expiration
3. **Part cleanup:** Automated cleanup of orphaned multipart uploads
4. **Edge function cold starts:** Impact on URL generation latency

---

## Sources

- [AWS S3 Presigned URLs Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [AWS SDK v3 S3 Presigned URLs](https://github.com/aws/aws-sdk-js-v3/blob/main/packages/s3-request-presigner/README.md)
- [AWS Prescriptive Guidance: Presigned URL Best Practices](https://docs.aws.amazon.com/pdfs/prescriptive-guidance/latest/presigned-url-best-practices/presigned-url-best-practices.pdf)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno aws_s3_presign Module](https://deno.land/x/aws_s3_presign@2.2.1)
- [AWS Multipart Upload API](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [AWS Compute Blog: Securing Presigned URLs](https://aws.amazon.com/blogs/compute/securing-amazon-s3-presigned-urls-for-serverless-applications/)
