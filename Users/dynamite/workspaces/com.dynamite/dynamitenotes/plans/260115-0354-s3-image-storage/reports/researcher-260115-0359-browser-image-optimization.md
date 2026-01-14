# Browser-Side Image Optimization Research

## Executive Summary
Client-side image optimization before S3 upload reduces bandwidth, storage costs, and improves UX. WebP/AVIF formats offer 25-50% better compression than JPEG/PNG with excellent browser support (>93%).

## 1. Format Conversion (WebP/AVIF)

### Browser Support (2025)
- **WebP**: 95.29% global support
- **AVIF**: 93.8% global support
- Both supported in Chrome, Firefox, Safari, Edge

### Implementation Approaches

**Canvas API (Simple, Universal)**
```typescript
const convertToWebP = async (file: File, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', quality);
    };
    img.src = URL.createObjectURL(file);
  });
};
```

**WebCodecs API (Advanced, Workers)**
```typescript
// Available in dedicated workers for better performance
const encodeAVIF = async (bitmap: ImageBitmap): Promise<Blob> => {
  const encoder = new VideoEncoder({
    output: (chunk) => { /* handle chunk */ },
    error: (e) => console.error(e)
  });
  // Configure for AVIF encoding
  encoder.configure({ codec: 'av01' });
  // Encode frame...
};
```

**Recommendation**: Use Canvas for simplicity, WebCodecs for batch processing in workers.

## 2. Multi-Size Generation

**Implementation with Pica**
```typescript
import Pica from 'pica';

const generateSizes = async (file: File): Promise<{[size: string]: Blob}> => {
  const pica = Pica();
  const sizes = { thumbnail: 200, medium: 800, large: 1920 };
  const results: {[key: string]: Blob} = {};

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise(r => img.onload = r);

  for (const [name, width] of Object.entries(sizes)) {
    const scale = width / img.width;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = img.height * scale;

    await pica.resize(img, canvas, {
      quality: 3,
      alpha: true,
      unsharpAmount: 80
    });

    const blob = await new Promise<Blob>(r =>
      canvas.toBlob(r!, 'image/webp', 0.8)
    );
    results[name] = blob;
  }

  return results;
};
```

**Performance**: Pica resizes 1280x1024px in ~0.1s, 5000x3000px in ~1s.

## 3. Compression Libraries

### browser-image-compression (Recommended)
```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8
  };
  return await imageCompression(file, options);
};
```

**Pros**: Web workers, TS support, React-compatible, privacy-focused
**Cons**: Format conversion limited

### Pica + Custom Pipeline
- Best for: Quality resizing, Web Workers
- Bundle size: ~50KB
- Use with `image-blob-reduce` for EXIF handling

## 4. Multipart Upload to S3

**AWS SDK v3 Implementation**
```typescript
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

const uploadMultipart = async (file: File, key: string) => {
  const createResponse = await s3.send(new CreateMultipartUploadCommand({
    Bucket: 'my-bucket',
    Key: key,
    ContentType: file.type
  }));

  const uploadId = createResponse.UploadId!;
  const partSize = 5 * 1024 * 1024; // 5MB
  const parts = [];

  for (let i = 0; i < file.size; i += partSize) {
    const end = Math.min(i + partSize, file.size);
    const chunk = file.slice(i, end);

    const uploadPart = await s3.send(new UploadPartCommand({
      Bucket: 'my-bucket',
      Key: key,
      UploadId: uploadId,
      PartNumber: parts.length + 1,
      Body: chunk
    }));

    parts.push({ PartNumber: parts.length + 1, ETag: uploadPart.ETag });
  }

  await s3.send(new CompleteMultipartUploadCommand({
    Bucket: 'my-bucket',
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts }
  }));
};
```

**Resumable Upload Pattern**:
```typescript
// Store state in IndexedDB for resume capability
interface UploadState {
  uploadId: string;
  key: string;
  uploadedParts: Array<{PartNumber: number, ETag: string}>;
}

const saveState = (state: UploadState) => {
  localStorage.setItem(`upload-${state.key}`, JSON.stringify(state));
};

const resumeUpload = async (key: string) => {
  const saved = localStorage.getItem(`upload-${key}`);
  if (!saved) return null;
  return JSON.parse(saved) as UploadState;
};
```

**Best Practices**:
- Part size: 5-10MB optimal
- Concurrent uploads: 3-10 parts
- Store state in IndexedDB (not localStorage for large data)
- Use EvaporateJS for automatic resume handling

## 5. Progress Tracking

```typescript
const uploadWithProgress = async (
  files: File[],
  onProgress: (current: number, total: number, percent: number) => void
) => {
  let completed = 0;
  const total = files.reduce((sum, f) => sum + f.size, 0);
  let uploaded = 0;

  for (const file of files) {
    const sizes = await generateSizes(file);

    for (const [name, blob] of Object.entries(sizes)) {
      await uploadMultipart(blob, `${file.name}-${name}.webp`, (progress) => {
        uploaded += blob.size * (progress - uploaded / blob.size);
        const percent = (uploaded / total) * 100;
        onProgress(completed, files.length, percent);
      });
    }
    completed++;
  }
};

// React usage
const [progress, setProgress] = useState(0);
const uploadImages = async (files: File[]) => {
  await uploadWithProgress(files, (curr, total, pct) => {
    setProgress(pct);
  });
};
```

## 6. File Size Validation

```typescript
const validateImage = (file: File, maxSizeMB = 2): {valid: boolean, error?: string} => {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File exceeds ${maxSizeMB}MB limit` };
  }

  if (!file.type.match(/image\/(jpeg|png|webp|avif)/)) {
    return { valid: false, error: 'Invalid image format' };
  }

  return { valid: true };
};
```

**React Hook**
```typescript
const useImageValidation = (maxSizeMB = 2) => {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (files: FileList) => {
    const newErrors: string[] = [];
    Array.from(files).forEach(file => {
      const result = validateImage(file, maxSizeMB);
      if (!result.valid) newErrors.push(`${file.name}: ${result.error}`);
    });
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return { errors, validate };
};
```

## 7. EXIF Handling

### Privacy-First Approach (Strip All)
```typescript
const stripExif = async (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => resolve(blob!), file.type, 0.95);
    };
    img.src = URL.createObjectURL(file);
  });
};
```

**Note**: Canvas automatically strips EXIF by default. No additional library needed.

### Selective Preservation (Piexifjs)
```typescript
import piexifjs from 'piexifjs';

const readExif = (file: File): any => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const exif = piexifjs.load(e.target!.result as string);
      resolve(exif);
    };
    reader.readAsDataURL(file);
  });
};

const insertExif = (blob: Blob, exif: any): Blob => {
  const dataUrl = URL.createObjectURL(blob);
  const exifStr = piexifjs.dump(exif);
  const newDataUrl = piexifjs.insert(exifStr, dataUrl);
  return /* convert dataUrl back to blob */;
};
```

**iOS Note**: iOS automatically strips GPS from uploaded files for privacy.

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebP | ✅ 23+ | ✅ 65+ | ✅ 14+ | ✅ 18+ |
| AVIF | ✅ 85+ | ✅ 93+ | ✅ 16+ | ✅ 121+ |
| WebCodecs | ✅ 94+ | ✅ 109+ | ❌ | ✅ 94+ |
| Web Workers | ✅ | ✅ | ✅ | ✅ |
| Canvas | ✅ | ✅ | ✅ | ✅ |

## Performance Considerations

1. **Web Workers**: Essential for UI responsiveness
   - Use for compression, resizing, format conversion
   - Avoid main thread blocking

2. **Memory Management**:
   - iOS canvas memory limits ~256MB
   - Reuse canvas elements
   - Revoke object URLs: `URL.revokeObjectURL(url)`

3. **Parallel Processing**:
   - Process multiple sizes concurrently (3-5 workers)
   - Upload parts in parallel (3-10 concurrent)

4. **Fallback Strategy**:
```typescript
const canUseWebP = () => document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
const canUseAVIF = () => document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;

const getBestFormat = () => {
  if (canUseAVIF()) return 'image/avif';
  if (canUseWebP()) return 'image/webp';
  return 'image/jpeg';
};
```

## Recommended Stack

```typescript
// Core libraries
import Pica from 'pica';                    // Resizing
import imageCompression from 'browser-image-compression';  // Compression
import { S3Client } from '@aws-sdk/client-s3';  // Upload

// Implementation flow
1. Validate file size (<2MB)
2. Load image (Image object)
3. Strip EXIF via canvas redraw
4. Generate sizes (200px, 800px, 1920px) with Pica
5. Compress with browser-image-compression
6. Convert to WebP/AVIF via canvas.toBlob()
7. Multipart upload to S3 with progress tracking
8. Store upload state for resume capability
```

## Unresolved Questions

1. Should we implement client-side AVIF encoding given Safari 16+ support?
2. How to handle browser memory limits for batch uploads (20+ images)?
3. Implement custom WebCodecs solution or wait for broader Safari support?
4. Best approach for iOS canvas memory limits in batch processing?

## Sources

- MDN WebCodecs API: https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API
- WebP vs AVIF: https://speedvitals.com/blog/webp-vs-avif/
- browser-image-compression: https://github.com/Donaldcwl/browser-image-compression
- Pica: https://github.com/nodeca/pica
- AWS S3 Multipart Upload: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
- EvaporateJS: https://github.com/TTLabs/EvaporateJS
