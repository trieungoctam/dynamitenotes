-- ============================================
-- DYNAMITE NOTES - DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor to create tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TAXONOMY TABLE (Goals & Outcomes)
-- ============================================
CREATE TABLE IF NOT EXISTS taxonomy (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('goal', 'outcome')),
  slug TEXT NOT NULL UNIQUE,
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_vi TEXT,
  description_en TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_taxonomy_type ON taxonomy(type);
CREATE INDEX IF NOT EXISTS idx_taxonomy_slug ON taxonomy(slug);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  content_vi TEXT NOT NULL,
  content_en TEXT,
  excerpt_vi TEXT,
  excerpt_en TEXT,
  goal_id TEXT REFERENCES taxonomy(id) ON DELETE SET NULL,
  outcome_id TEXT REFERENCES taxonomy(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('starter', 'builder', 'advanced')),
  read_time INTEGER,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_goal_id ON posts(goal_id);
CREATE INDEX IF NOT EXISTS idx_posts_outcome_id ON posts(outcome_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured = true;

-- ============================================
-- INSIGHTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  content_vi TEXT NOT NULL,
  content_en TEXT,
  tags TEXT[] DEFAULT '{}',
  related_post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insights_published ON insights(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_pinned ON insights(pinned) WHERE pinned = true;

-- ============================================
-- PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption_vi TEXT,
  caption_en TEXT,
  album TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album);
CREATE INDEX IF NOT EXISTS idx_photos_published ON photos(published, sort_order);

-- ============================================
-- SERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  description_vi TEXT,
  description_en TEXT,
  post_ids TEXT[] DEFAULT '{}',
  cover_image TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(featured) WHERE featured = true;

-- ============================================
-- ABOUT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS about (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_vi TEXT NOT NULL,
  bio_en TEXT,
  principles_vi TEXT,
  principles_en TEXT,
  social_links JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESUME SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resume_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('highlight', 'experience', 'project', 'writing', 'speaking', 'education', 'skill', 'certification')),
  title_vi TEXT NOT NULL,
  title_en TEXT,
  content JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_sections_type ON resume_sections(type);
CREATE INDEX IF NOT EXISTS idx_resume_sections_sort ON resume_sections(sort_order);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  user_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for taxonomy" ON taxonomy FOR SELECT USING (true);
CREATE POLICY "Public read access for posts" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Public read access for insights" ON insights FOR SELECT USING (published = true);
CREATE POLICY "Public read access for photos" ON photos FOR SELECT USING (published = true);
CREATE POLICY "Public read access for series" ON series FOR SELECT USING (published = true);
CREATE POLICY "Public read access for about" ON about FOR SELECT USING (true);
CREATE POLICY "Public read access for resume_sections" ON resume_sections FOR SELECT USING (true);

-- Service role full access (for admin operations)
CREATE POLICY "Service role full access taxonomy" ON taxonomy FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access posts" ON posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access insights" ON insights FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access photos" ON photos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access series" ON series FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access about" ON about FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access resume_sections" ON resume_sections FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access admins" ON admins FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Apply trigger to series
CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Apply trigger to resume_sections
CREATE TRIGGER update_resume_sections_updated_at
  BEFORE UPDATE ON resume_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- END OF SCHEMA
-- ============================================
