# Phase 07: Edge Function for Scheduled Publishing

**Effort**: 1h

## Overview

Create Supabase Edge Function to auto-publish scheduled posts every minute.

## Tasks

### 1. Create Edge Function

**File**: `supabase/functions/scheduled-publisher/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface Post {
  id: string;
  title_vi: string;
  scheduled_for: string;
}

serve(async (req) => {
  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current timestamp
    const now = new Date().toISOString();

    // Find posts that should be published
    const { data: posts, error: fetchError } = await supabase
      .from("posts")
      .select("id, title_vi, scheduled_for")
      .eq("published", false)
      .lte("scheduled_for", now);

    if (fetchError) {
      console.error("Error fetching scheduled posts:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch posts" }),
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ published: 0, message: "No posts to publish" }),
        { status: 200 }
      );
    }

    // Publish the posts
    const postIds = posts.map((p: Post) => p.id);

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        published: true,
        published_at: now,
        scheduled_for: null, // Clear scheduled date
      })
      .in("id", postIds);

    if (updateError) {
      console.error("Error publishing posts:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to publish posts" }),
        { status: 500 }
      );
    }

    // Log published posts
    console.log(`Published ${posts.length} posts:`, posts.map((p: Post) => p.title_vi));

    return new Response(
      JSON.stringify({
        published: posts.length,
        posts: posts.map((p: Post) => ({ id: p.id, title: p.title_vi })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

### 2. Deploy Function

```bash
# Ensure Supabase CLI is installed
supabase functions deploy scheduled-publisher

# Verify deployment
supabase functions list
```

### 3. Set Up Cron Job

**In Supabase Dashboard**:

1. Navigate to Edge Functions
2. Click on `scheduled-publisher`
3. Go to "Cron" section
4. Add cron expression: `* * * * *` (every minute)
5. Save

Alternatively via CLI:

```bash
supabase functions inspect scheduled-publisher
# Then configure cron in dashboard
```

### 4. Test Locally (Optional)

```bash
# Start local Supabase
supabase start

# Invoke function locally
supabase functions invoke scheduled-publisher
```

### 5. Manual Testing

1. Create a post with `scheduled_for` = 1 minute in future
2. Wait 1 minute
3. Check if post is published

```sql
-- Check scheduled posts in Supabase SQL Editor
SELECT id, title_vi, scheduled_for, published
FROM posts
WHERE scheduled_for IS NOT NULL
ORDER BY scheduled_for DESC;
```

### 6. Monitoring

**Add logging to track executions**:

Edge Function automatically logs to Supabase dashboard. Check:
- Edge Functions → scheduled-publisher → Logs

**Optional: Add health check endpoint**

```typescript
// Add to index.ts
if (req.method === "GET" && new URL(req.url).pathname === "/health") {
  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}
```

## Acceptance Criteria

- [ ] Edge function deployed successfully
- [ ] Cron job configured (every minute)
- [ ] Scheduled posts auto-publish on time
- [ ] `published_at` set correctly
- [ ] `scheduled_for` cleared after publishing
- [ ] Function logs visible in Supabase dashboard
- [ ] Error handling works (invalid data, connection issues)

## Security Considerations

- Uses `SERVICE_ROLE_KEY` (bypasses RLS)
- Only updates posts matching scheduled criteria
- No user input accepted (cron-triggered only)
- Errors logged but don't expose sensitive data

## Files

- `supabase/functions/scheduled-publisher/index.ts` (create)

## Rollback

```bash
supabase functions delete scheduled-publisher
```

Remove cron job in Supabase dashboard.
