/**
 * Database Seed Script
 *
 * Populates Supabase with fake data for MVP testing
 *
 * Usage:
 *   bun run scripts/seed.ts
 *
 * Environment:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.log("\nSet environment variables:");
  console.log("  VITE_SUPABASE_URL=your-url");
  console.log("  VITE_SUPABASE_ANON_KEY=your-key");
  console.log("\nOr create a .env.local file with these values.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Seed data
const seedData = {
  // Taxonomy (Goals & Outcomes)
  taxonomy: [
    // Goals
    { id: "goal-001", type: "goal", slug: "decide", name_vi: "Quyết định", name_en: "Decide", description_vi: "Chọn hướng đi cho sản phẩm", description_en: "Choose direction for products", icon: "compass", color: "#3b82f6", sort_order: 1 },
    { id: "goal-002", type: "goal", slug: "spec", name_vi: "Đặc tả", name_en: "Spec", description_vi: "Định nghĩa yêu cầu", description_en: "Define requirements", icon: "file-text", color: "#a855f7", sort_order: 2 },
    { id: "goal-003", type: "goal", slug: "build", name_vi: "Xây dựng", name_en: "Build", description_vi: "Tạo giải pháp", description_en: "Create solutions", icon: "hammer", color: "#f97316", sort_order: 3 },
    { id: "goal-004", type: "goal", slug: "ship", name_vi: "Phát hành", name_en: "Ship", description_vi: "Triển khai và phát hành", description_en: "Deploy & release", icon: "rocket", color: "#22c55e", sort_order: 4 },
    { id: "goal-005", type: "goal", slug: "measure", name_vi: "Đo lường", name_en: "Measure", description_vi: "Phân tích kết quả", description_en: "Analyze results", icon: "bar-chart", color: "#06b6d4", sort_order: 5 },
    { id: "goal-006", type: "goal", slug: "operate", name_vi: "Vận hành", name_en: "Operate", description_vi: "Chạy và bảo trì", description_en: "Run & maintain", icon: "settings", color: "#6b7280", sort_order: 6 },
    // Outcomes
    { id: "out-001", type: "outcome", slug: "launched", name_vi: "Ra mắt", name_en: "Launched", description_vi: "Sản phẩm đã ra mắt", description_en: "Product launched", icon: "rocket", color: "#22c55e", sort_order: 1 },
    { id: "out-002", type: "outcome", slug: "learned", name_vi: "Học hỏi", name_en: "Learned", description_vi: "Kiến thức mới", description_en: "New knowledge", icon: "lightbulb", color: "#eab308", sort_order: 2 },
    { id: "out-003", type: "outcome", slug: "failed", name_vi: "Thất bại", name_en: "Failed", description_vi: "Bài học từ thất bại", description_en: "Lessons from failure", icon: "x-circle", color: "#ef4444", sort_order: 3 },
    { id: "out-004", type: "outcome", slug: "optimized", name_vi: "Tối ưu", name_en: "Optimized", description_vi: "Cải tiến hiệu suất", description_en: "Performance improved", icon: "zap", color: "#a855f7", sort_order: 4 },
  ],

  // Posts
  posts: [
    {
      id: "post-001",
      slug: "how-to-choose-tech-stack",
      title_vi: "Chọn Tech Stack cho Startup: Cái nhìn thực tế",
      title_en: "Choosing Tech Stack for Startups: A Practical Guide",
      excerpt_vi: "Khi bắt đầu dự án mới, việc chọn tech stack có thể gây đau đầu.",
      excerpt_en: "Choosing a tech stack for a new project can be overwhelming.",
      content_vi: "# Chọn Tech Stack cho Startup\n\n## Tại sao quan trọng?\n\nTech stack quyết định tốc độ phát triển, khả năng scalability, và chi phí vận hành.",
      content_en: "# Choosing Tech Stack for Startups\n\n## Why it matters?\n\nTech stack determines development speed, scalability, and operational costs.",
      goal_id: "goal-001",
      outcome_id: "out-002",
      level: "builder",
      read_time: 8,
      featured: true,
      published: true,
      published_at: new Date("2024-01-10T10:00:00").toISOString(),
      updated_at: new Date("2024-01-10T10:00:00").toISOString(),
    },
    {
      id: "post-002",
      slug: "building-rest-api-with-nodejs",
      title_vi: "Xây dựng REST API với Node.js: Từ A-Z",
      title_en: "Building REST API with Node.js: From Zero to Hero",
      excerpt_vi: "Hướng dẫn chi tiết xây dựng REST API production-ready.",
      excerpt_en: "A comprehensive guide to building production-ready REST APIs.",
      content_vi: "# Xây dựng REST API\n\n## Setup project\n```bash\nnpm init -y\nnpm install express typescript\n```",
      content_en: "# Building REST API\n\n## Setup project\n```bash\nnpm init -y\nnpm install express typescript\n```",
      goal_id: "goal-003",
      outcome_id: "out-001",
      level: "advanced",
      read_time: 12,
      featured: true,
      published: true,
      published_at: new Date("2024-01-08T14:30:00").toISOString(),
      updated_at: new Date("2024-01-08T14:30:00").toISOString(),
    },
    {
      id: "post-003",
      slug: "writing-technical-specifications",
      title_vi: "Viết Technical Specification hiệu quả",
      title_en: "Writing Effective Technical Specifications",
      excerpt_vi: "Kinh nghiệm viết tech spec rõ ràng.",
      excerpt_en: "How to write clear technical specifications.",
      content_vi: "# Technical Specification\n\n## Components\n1. Problem statement\n2. Requirements\n3. Architecture",
      content_en: "# Technical Specification\n\n## Components\n1. Problem statement\n2. Requirements\n3. Architecture",
      goal_id: "goal-002",
      outcome_id: "out-002",
      level: "starter",
      read_time: 6,
      featured: false,
      published: true,
      published_at: new Date("2024-01-05T09:00:00").toISOString(),
      updated_at: new Date("2024-01-05T09:00:00").toISOString(),
    },
    {
      id: "post-004",
      slug: "deployment-checklist",
      title_vi: "Checklist Deploy sản phẩm ra Production",
      title_en: "Production Deployment Checklist",
      excerpt_vi: "Những thứ cần kiểm tra trước khi deploy.",
      excerpt_en: "Things to check before deploying.",
      content_vi: "# Deployment Checklist\n\n## Pre-deploy\n- [ ] Tests passing\n- [ ] Environment vars set",
      content_en: "# Deployment Checklist\n\n## Pre-deploy\n- [ ] Tests passing\n- [ ] Environment vars set",
      goal_id: "goal-004",
      outcome_id: "out-001",
      level: "builder",
      read_time: 5,
      featured: false,
      published: true,
      published_at: new Date("2024-01-03T16:00:00").toISOString(),
      updated_at: new Date("2024-01-03T16:00:00").toISOString(),
    },
    {
      id: "post-005",
      slug: "analytics-for-developers",
      title_vi: "Analytics cho Developers: Measure what matters",
      title_en: "Analytics for Developers: Measure What Matters",
      excerpt_vi: "Đừng measure tất cả. Measure những gì quan trọng.",
      excerpt_en: "Don't measure everything. Measure what drives decisions.",
      content_vi: "# Developer Analytics\n\n## What to track\n- DAU/MAU\n- Retention",
      content_en: "# Developer Analytics\n\n## What to track\n- DAU/MAU\n- Retention",
      goal_id: "goal-005",
      outcome_id: "out-004",
      level: "advanced",
      read_time: 7,
      featured: false,
      published: true,
      published_at: new Date("2024-01-01T11:00:00").toISOString(),
      updated_at: new Date("2024-01-01T11:00:00").toISOString(),
    },
    {
      id: "post-006",
      slug: "incident-response-playbook",
      title_vi: "Incident Response: Khi mọi thứ gặp sự cố",
      title_en: "Incident Response: When Everything Breaks",
      excerpt_vi: "Playbook xử lý sự cố production.",
      excerpt_en: "Production incident handling playbook.",
      content_vi: "# Incident Response\n\n## Phases\n1. Detection\n2. Response\n3. Recovery",
      content_en: "# Incident Response\n\n## Phases\n1. Detection\n2. Response\n3. Recovery",
      goal_id: "goal-006",
      outcome_id: "out-003",
      level: "advanced",
      read_time: 10,
      featured: false,
      published: true,
      published_at: new Date("2023-12-28T10:00:00").toISOString(),
      updated_at: new Date("2023-12-28T10:00:00").toISOString(),
    },
  ],

  // Insights
  insights: [
    { id: "ins-001", content_vi: "TypeScript 5.4 vừa release với NoInfer. Game changer!", content_en: "TypeScript 5.4 just released with NoInfer. Game changer!", tags: ["typescript", "release"], published: true },
    { id: "ins-002", content_vi: "Best practice: Luôn luôn implement error boundaries cho React apps.", content_en: "Best practice: Always implement error boundaries in React apps.", tags: ["react", "best-practice"], published: true },
    { id: "ins-003", content_vi: "Reading: The Pragmatic Programmer changed how I think about code.", content_en: "Reading: The Pragmatic Programmer changed how I think about code.", tags: ["book", "learning"], published: true },
    { id: "ins-004", content_vi: "Zod + TypeScript = match made in heaven for runtime validation.", content_en: "Zod + TypeScript = match made in heaven for runtime validation.", tags: ["typescript", "zod"], published: true },
    { id: "ins-005", content_vi: "Done is better than perfect. Ship it, then iterate.", content_en: "Done is better than perfect. Ship it, then iterate.", tags: ["mindset", "shipping"], published: true },
    { id: "ins-006", content_vi: "CSS tip: gap property works with flexbox, not just grid!", content_en: "CSS tip: gap property works with flexbox, not just grid!", tags: ["css", "tip"], published: true },
    { id: "ins-007", content_vi: "Debugging production logs is like detective work.", content_en: "Debugging production logs is like detective work.", tags: ["debugging", "production"], published: true },
    { id: "ins-008", content_vi: "Microservices aren't the answer to everything. Sometimes monolith is better.", content_en: "Microservices aren't the answer to everything. Sometimes monolith is better.", tags: ["architecture", "microservices"], published: true },
  ],

  // Photos
  photos: [
    { id: "photo-001", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200", thumbnail_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400", caption_vi: "Workspace setup 2024", caption_en: "Workspace setup 2024", album: "Workspace", sort_order: 1, published: true },
    { id: "photo-002", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200", thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400", caption_vi: "Late night coding", caption_en: "Late night coding", album: "Workspace", sort_order: 2, published: true },
    { id: "photo-003", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200", thumbnail_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400", caption_vi: "React Conference 2024", caption_en: "React Conference 2024", album: "Events", sort_order: 1, published: true },
    { id: "photo-004", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200", thumbnail_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400", caption_vi: "My development setup", caption_en: "My development setup", album: "Workspace", sort_order: 3, published: true },
    { id: "photo-005", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200", thumbnail_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400", caption_vi: "Team dinner", caption_en: "Team dinner", album: "Life", sort_order: 1, published: true },
    { id: "photo-006", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200", thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400", caption_vi: "Coffee shop coding", caption_en: "Coffee shop coding", album: "Life", sort_order: 2, published: true },
  ],

  // About
  about: [{
    id: "about-001",
    bio_vi: "Xin chào! Mình là một lập trình viên full-stack đến từ Việt Nam. Mình đam mê xây dựng sản phẩm đẹp, functional và mang lại giá trị cho người dùng.",
    bio_en: "Hi! I'm a full-stack developer from Vietnam. I love building beautiful, functional products that deliver value to users.",
    principles_vi: "• Đơn giản hơn là phức tạp hơn\n• Hành động tốt hơn là hoàn hảo\n• Chia sẻ kiến thức tự do do",
    principles_en: "• Simpler is better than complex\n• Done is better than perfect\n• Share knowledge freely",
    social_links: { github: "https://github.com/dynamite", twitter: "https://twitter.com/dynamite", linkedin: "https://linkedin.com/in/dynamite" },
    updated_at: new Date().toISOString(),
  }],

  // Resume Sections
  resumeSections: [
    {
      id: "res-001",
      type: "highlight",
      title_vi: "Điểm nổi bật",
      title_en: "Highlights",
      content: { items: ["5+ years coding experience", "Built 10+ products", "Technical blog author", "Open source contributor"] },
      sort_order: 1,
      updated_at: new Date().toISOString(),
    },
    {
      id: "res-002",
      type: "experience",
      title_vi: "Kinh nghiệm làm việc",
      title_en: "Work Experience",
      content: {
        experiences: [
          { title: "Senior Developer", company: "Tech Startup", period: "2022 - Present", description: "Lead development" },
          { title: "Frontend Developer", company: "Agency", period: "2020 - 2022", description: "Built web apps" },
        ]
      },
      sort_order: 2,
      updated_at: new Date().toISOString(),
    },
    {
      id: "res-003",
      type: "project",
      title_vi: "Dự án nổi bật",
      title_en: "Featured Projects",
      content: {
        projects: [
          { name: "Dynamite Notes", description: "Personal blog & portfolio", tech: ["React", "TypeScript"], url: "https://dynamite.notes" },
          { name: "DevTools Pro", description: "Browser extension", tech: ["JavaScript"], url: "https://github.com/dynamite/devtools" },
        ]
      },
      sort_order: 3,
      updated_at: new Date().toISOString(),
    },
  ],

  // Series
  series: [
    {
      id: "series-001",
      slug: "nodejs-crash-course",
      title_vi: "Node.js Crash Course",
      title_en: "Node.js Crash Course",
      description_vi: "Chuỗi bài viết về Node.js.",
      description_en: "A series about Node.js.",
      post_ids: ["post-002"],
      cover_image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200",
      featured: true,
      updated_at: new Date().toISOString(),
    },
    {
      id: "series-002",
      slug: "startup-lessons",
      title_vi: "Bài học từ Startup",
      title_en: "Startup Lessons",
      description_vi: "Thực trải từ startup.",
      description_en: "Lessons from building a startup.",
      post_ids: ["post-001", "post-003"],
      cover_image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200",
      featured: false,
      updated_at: new Date().toISOString(),
    },
  ],
};

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const results = {
    taxonomy: { inserted: 0, error: null },
    posts: { inserted: 0, error: null },
    insights: { inserted: 0, error: null },
    photos: { inserted: 0, error: null },
    about: { inserted: 0, error: null },
    resumeSections: { inserted: 0, error: null },
    series: { inserted: 0, error: null },
  };

  // Seed Taxonomy
  console.log("📚 Seeding taxonomy (goals & outcomes)...");
  try {
    for (const item of seedData.taxonomy) {
      const { error } = await supabase.from("taxonomy").upsert(item);
      if (error) throw error;
      results.taxonomy.inserted++;
    }
    console.log(`   ✅ Inserted ${results.taxonomy.inserted} taxonomy items\n`);
  } catch (error: any) {
    results.taxonomy.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Seed About
  console.log("👤 Seeding about page...");
  try {
    for (const item of seedData.about) {
      const { error } = await supabase.from("about").upsert(item);
      if (error) throw error;
      results.about.inserted++;
    }
    console.log(`   ✅ Inserted about page\n`);
  } catch (error: any) {
    results.about.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Seed Resume Sections
  console.log("📄 Seeding resume sections...");
  try {
    for (const item of seedData.resumeSections) {
      const { error } = await supabase.from("resume_sections").upsert(item);
      if (error) throw error;
      results.resumeSections.inserted++;
    }
    console.log(`   ✅ Inserted ${results.resumeSections.inserted} resume sections\n`);
  } catch (error: any) {
    results.resumeSections.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Seed Posts
  console.log("📝 Seeding posts...");
  try {
    for (const item of seedData.posts) {
      const { error } = await supabase.from("posts").upsert(item);
      if (error) throw error;
      results.posts.inserted++;
    }
    console.log(`   ✅ Inserted ${results.posts.inserted} posts\n`);
  } catch (error: any) {
    results.posts.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Seed Insights
  console.log("💡 Seeding insights...");
  try {
    for (const item of seedData.insights) {
      const { error } = await supabase.from("insights").upsert({
        ...item,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      results.insights.inserted++;
    }
    console.log(`   ✅ Inserted ${results.insights.inserted} insights\n`);
  } catch (error: any) {
    results.insights.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Seed Photos
  console.log("📸 Seeding photos...");
  try {
    for (const item of seedData.photos) {
      const { error } = await supabase.from("photos").upsert({
        ...item,
        taken_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      results.photos.inserted++;
    }
    console.log(`   ✅ Inserted ${results.photos.inserted} photos\n`);
  } catch (error: any) {
    results.photos.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Seed Series
  console.log("📚 Seeding series...");
  try {
    for (const item of seedData.series) {
      const { error } = await supabase.from("series").upsert({
        ...item,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      results.series.inserted++;
    }
    console.log(`   ✅ Inserted ${results.series.inserted} series\n`);
  } catch (error: any) {
    results.series.error = error.message;
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 SEED SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Taxonomy:     ${results.taxonomy.inserted} inserted ${results.taxonomy.error ? "❌" : "✅"}`);
  console.log(`Posts:        ${results.posts.inserted} inserted ${results.posts.error ? "❌" : "✅"}`);
  console.log(`Insights:     ${results.insights.inserted} inserted ${results.insights.error ? "❌" : "✅"}`);
  console.log(`Photos:       ${results.photos.inserted} inserted ${results.photos.error ? "❌" : "✅"}`);
  console.log(`About:        ${results.about.inserted} inserted ${results.about.error ? "❌" : "✅"}`);
  console.log(`Resume:       ${results.resumeSections.inserted} inserted ${results.resumeSections.error ? "❌" : "✅"}`);
  console.log(`Series:       ${results.series.inserted} inserted ${results.series.error ? "❌" : "✅"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const totalInserted = Object.values(results).reduce((sum, r) => sum + r.inserted, 0);
  const hasErrors = Object.values(results).some(r => r.error);

  if (hasErrors) {
    console.log("⚠️  Seed completed with errors. Check details above.\n");
    process.exit(1);
  } else {
    console.log(`✅ Seed complete! ${totalInserted} records inserted.\n`);
    console.log("🌐 View at: http://localhost:8080");
  }
}

seed().catch(console.error);
