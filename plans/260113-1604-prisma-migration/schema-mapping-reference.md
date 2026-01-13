# Prisma Schema Mapping Reference

Quick reference for mapping SQL schema to Prisma schema.

## Complete Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================
// ENUMS
// ============================================

enum TaxonomyType {
  goal
  outcome
}

enum PostLevel {
  starter
  builder
  advanced
}

enum ResumeSectionType {
  highlight
  experience
  project
  writing
  speaking
}

// ============================================
// MODELS
// ============================================

model Taxonomy {
  id            String        @id @default(uuid()) @db.Text
  type          TaxonomyType
  slug          String        @unique @db.Text
  nameVi        String        @map("name_vi") @db.Text
  nameEn        String        @map("name_en") @db.Text
  descriptionVi String?       @map("description_vi") @db.Text
  descriptionEn String?       @map("description_en") @db.Text
  icon          String?       @db.Text
  color         String?       @db.Text
  sortOrder     Int           @default(0) @map("sort_order")
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  postsAsGoal      Post[]      @relation("PostsGoal")
  postsAsOutcome   Post[]      @relation("PostsOutcome")

  @@index([type])
  @@index([slug])
  @@map("taxonomy")
}

model Post {
  id          String     @id @default(uuid()) @db.Text
  slug        String     @unique @db.Text
  titleVi     String     @map("title_vi") @db.Text
  titleEn     String?    @map("title_en") @db.Text
  contentVi   String     @map("content_vi") @db.Text
  contentEn   String?    @map("content_en") @db.Text
  excerptVi   String?    @map("excerpt_vi") @db.Text
  excerptEn   String?    @map("excerpt_en") @db.Text
  goalId      String?    @map("goal_id") @db.Text
  outcomeId   String?    @map("outcome_id") @db.Text
  level       PostLevel?
  readTime    Int?       @map("read_time")
  featured    Boolean    @default(false)
  published   Boolean    @default(false)
  publishedAt DateTime?  @map("published_at") @db.Timestamptz
  createdAt   DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime   @default(now()) @map("updated_at") @db.Timestamptz

  // Relations
  goal      Taxonomy? @relation("PostsGoal", fields: [goalId], references: [id], onDelete: SetNull)
  outcome   Taxonomy? @relation("PostsOutcome", fields: [outcomeId], references: [id], onDelete: SetNull)
  insights  Insight[]

  @@index([slug])
  @@index([goalId])
  @@index([outcomeId])
  @@index([published, publishedAt(sort: Desc)])
  @@index([featured], where: { featured: true })
  @@map("posts")
}

model Insight {
  id            String    @id @default(uuid()) @db.Text
  contentVi     String    @map("content_vi") @db.Text
  contentEn     String?   @map("content_en") @db.Text
  tags          String[]  @default([])
  relatedPostId String?   @map("related_post_id") @db.Text
  pinned        Boolean   @default(false)
  published     Boolean   @default(false)
  publishedAt   DateTime? @map("published_at") @db.Timestamptz
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  relatedPost Post? @relation(fields: [relatedPostId], references: [id], onDelete: SetNull)

  @@index([published, publishedAt(sort: Desc)])
  @@index([pinned], where: { pinned: true })
  @@map("insights")
}

model Photo {
  id            String    @id @default(uuid()) @db.Text
  url           String    @db.Text
  thumbnailUrl  String?   @map("thumbnail_url") @db.Text
  captionVi     String?   @map("caption_vi") @db.Text
  captionEn     String?   @map("caption_en") @db.Text
  album         String?   @db.Text
  sortOrder     Int       @default(0) @map("sort_order")
  published     Boolean   @default(false)
  takenAt       DateTime? @map("taken_at") @db.Timestamptz
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz

  @@index([album])
  @@index([published, sortOrder])
  @@map("photos")
}

model Series {
  id           String   @id @default(uuid()) @db.Text
  slug         String   @unique @db.Text
  titleVi      String   @map("title_vi") @db.Text
  titleEn      String?  @map("title_en") @db.Text
  descriptionVi String? @map("description_vi") @db.Text
  descriptionEn String? @map("description_en") @db.Text
  postIds      String[] @default([]) @map("post_ids")
  coverImage   String?  @map("cover_image") @db.Text
  featured     Boolean  @default(false)
  published    Boolean  @default(false)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @default(now()) @map("updated_at") @db.Timestamptz

  @@index([slug])
  @@index([featured], where: { featured: true })
  @@map("series")
}

model About {
  id           String   @id @default(uuid()) @db.Text
  bioVi        String   @map("bio_vi") @db.Text
  bioEn        String?  @map("bio_en") @db.Text
  principlesVi String?  @map("principles_vi") @db.Text
  principlesEn String?  @map("principles_en") @db.Text
  socialLinks  Json     @map("social_links")
  updatedAt    DateTime @default(now()) @map("updated_at") @db.Timestamptz

  @@map("about")
}

model ResumeSection {
  id        String            @id @default(uuid()) @db.Text
  type      ResumeSectionType
  titleVi   String            @map("title_vi") @db.Text
  titleEn   String?           @map("title_en") @db.Text
  content   Json              @db.JSONB
  sortOrder Int               @default(0) @map("sort_order")
  createdAt DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime          @default(now()) @map("updated_at") @db.Timestamptz

  @@index([type])
  @@index([sortOrder])
  @@map("resume_sections")
}

model Admin {
  userId    String   @id @map("user_id") @db.Text
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("admins")
}
```

## Query Translation Guide

### Select All

```typescript
// Supabase
const { data } = await supabase.from("posts").select("*");

// Prisma
const posts = await prisma.post.findMany();
```

### Filter

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .select("*")
  .eq("published", true)
  .eq("featured", true);

// Prisma
const posts = await prisma.post.findMany({
  where: {
    published: true,
    featured: true,
  },
});
```

### Relations

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .select("*, goal:taxonomy!posts_goal_id_fkey(*)")
  .eq("published", true);

// Prisma
const posts = await prisma.post.findMany({
  where: { published: true },
  include: { goal: true },
});
```

### Order By

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .select("*")
  .order("published_at", { ascending: false });

// Prisma
const posts = await prisma.post.findMany({
  orderBy: { publishedAt: "desc" },
});
```

### Pagination

```typescript
// Supabase
const { data } = await supabase
  .from("insights")
  .select("*")
  .range(0, 9);

// Prisma
const insights = await prisma.insight.findMany({
  skip: 0,
  take: 10,
});
```

### Single Record

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .select("*")
  .eq("slug", "my-post")
  .single();

// Prisma
const post = await prisma.post.findFirst({
  where: { slug: "my-post" },
});
```

### Create

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .insert({
    title_vi: "New Post",
    content_vi: "Content",
    slug: "new-post",
  });

// Prisma
const post = await prisma.post.create({
  data: {
    titleVi: "New Post",
    contentVi: "Content",
    slug: "new-post",
  },
});
```

### Update

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .update({ title_vi: "Updated Title" })
  .eq("id", postId);

// Prisma
const post = await prisma.post.update({
  where: { id: postId },
  data: { titleVi: "Updated Title" },
});
```

### Delete

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .delete()
  .eq("id", postId);

// Prisma
const post = await prisma.post.delete({
  where: { id: postId },
});
```

### Search

```typescript
// Supabase
const { data } = await supabase
  .from("posts")
  .select("*")
  .or("title_vi.ilike.%query%,content_vi.ilike.%query%");

// Prisma
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { titleVi: { contains: "query", mode: "insensitive" } },
      { contentVi: { contains: "query", mode: "insensitive" } },
    ],
  },
});
```

## Field Naming Conventions

### Supabase → Prisma

| Supabase | Prisma | Notes |
|----------|--------|-------|
| `created_at` | `createdAt` | camelCase |
| `published_at` | `publishedAt` | camelCase |
| `name_vi` | `nameVi` | camelCase |
| `sort_order` | `sortOrder` | camelCase |
| `goal_id` | `goalId` | camelCase |
| `post_ids` | `postIds` | camelCase (array) |

### Type Mappings

| SQL Type | Prisma Type | Notes |
|----------|-------------|-------|
| `TEXT` | `String` | Use `@db.Text` annotation |
| `INTEGER` | `Int` | - |
| `BOOLEAN` | `Boolean` | - |
| `TIMESTAMPTZ` | `DateTime` | Use `@db.Timestamptz` |
| `TEXT[]` | `String[]` | Array of strings |
| `JSONB` | `Json` | Use `Json` type |
| `UUID` | `String` | Use `@default(uuid())` |

---

Last updated: 2026-01-13
