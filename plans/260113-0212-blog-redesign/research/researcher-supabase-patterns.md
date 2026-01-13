# Supabase Integration Patterns Research
**Date:** 2026-01-13
**Environment:** React + Vite + TypeScript + Bun
**Context:** Admin-only blog with public read access

## 1. Client Initialization (React + Vite)

### Recommended Pattern
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### Environment Variables (.env)
```bash
VITE_SUPABASE_URL=https://<project_ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Key Points:**
- Use `createClient` for unified access (auth, storage, database)
- Typed client with `Database` generic for full TypeScript safety
- Vite requires `VITE_` prefix for client-side env vars
- Auto-refresh and session persistence enabled by default

## 2. TypeScript Types Generation

### CLI Command
```bash
bun add -D supabase  # Install Supabase CLI locally
bunx supabase gen types --linked > src/lib/types/database.ts
```

### Usage Pattern
```typescript
import type { Database } from './types/database'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']
```

**Benefits:**
- End-to-end type safety from DB schema to client
- Auto-completion for queries
- Compile-time error detection
- Regenerate on schema changes

## 3. Authentication Patterns (Admin-Only)

### Auth Hook
```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### Protected Route Pattern
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
```

**Session Management:**
- Tokens auto-propagate across all services (DB, Storage, Functions)
- Session persists in localStorage by default
- Auth state syncs across tabs automatically

## 4. Storage Patterns (Image Upload)

### Client-Side Resize + Upload
```typescript
// Recommended packages for image handling
// bun add browser-image-compression

import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'

async function uploadImage(file: File, postId: string) {
  // Client-side resize/compress
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
  const compressedFile = await imageCompression(file, options)

  // Upload to Supabase Storage
  const fileName = `${postId}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, compressedFile, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

### Bucket Configuration
```sql
-- Create public bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);
```

**Best Practices:**
- Resize client-side to save bandwidth
- Use timestamped filenames to prevent conflicts
- Set cache-control headers for CDN efficiency
- Public bucket for published content images

## 5. Row Level Security (RLS) Patterns

### Admin Write, Public Read
```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public read published posts"
ON posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admin-only write access
CREATE POLICY "Admin full access"
ON posts FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users
    WHERE email = 'admin@yourdomain.com'
  )
);
```

### Storage RLS (Public Bucket)
```sql
-- Public read for all images
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Admin-only upload/update/delete
CREATE POLICY "Admin upload access"
ON storage.objects FOR INSERT
TO authenticated
USING (
  bucket_id = 'post-images' AND
  auth.uid() IN (
    SELECT id FROM auth.users
    WHERE email = 'admin@yourdomain.com'
  )
);
```

**Security Considerations:**
- RLS automatically applies to all client queries
- Use email-based admin check or role column
- Storage policies separate from table policies
- Consider draft vs published content visibility

## Package Recommendations

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.58.0",
    "browser-image-compression": "^2.0.2"
  },
  "devDependencies": {
    "supabase": "^1.x"
  }
}
```

## Architecture Notes

- **Unified Client:** Single `createClient` instance manages all services
- **Token Propagation:** Auth tokens automatically apply to DB queries, Storage ops
- **Type Safety:** Generate types from schema for compile-time guarantees
- **Real-time:** Can subscribe to DB changes (not required for admin-only blog)

## Unresolved Questions

1. **Admin identification method:** Email hardcoding vs dedicated `is_admin` column in profiles table?
2. **Image optimization:** Server-side image transformation (Supabase supports this) vs client-side only?
3. **Draft content:** Separate drafts table or status column with RLS filtering?
4. **Offline support:** Service worker caching strategy for published content?
