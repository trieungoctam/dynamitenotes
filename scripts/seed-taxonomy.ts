/**
 * Seed Taxonomy Script
 * Populates the taxonomy table with goals and outcomes for content categorization.
 *
 * Usage:
 *   SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key bun run scripts/seed-taxonomy.ts
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Product development goals
const goals = [
  { type: "goal", slug: "decide", name_vi: "Chọn hướng", name_en: "Decide", icon: "compass", color: "blue" },
  { type: "goal", slug: "spec", name_vi: "Định nghĩa", name_en: "Spec", icon: "file-text", color: "purple" },
  { type: "goal", slug: "build", name_vi: "Xây dựng", name_en: "Build", icon: "hammer", color: "orange" },
  { type: "goal", slug: "ship", name_vi: "Vận chuyển", name_en: "Ship", icon: "rocket", color: "green" },
  { type: "goal", slug: "measure", name_vi: "Đo lường", name_en: "Measure", icon: "chart-bar", color: "cyan" },
  { type: "goal", slug: "operate", name_vi: "Vận hành", name_en: "Operate", icon: "settings", color: "gray" },
];

// Content outcomes
const outcomes = [
  { type: "outcome", slug: "prd", name_vi: "PRD", name_en: "PRD" },
  { type: "outcome", slug: "tech-spec", name_vi: "Tech Spec", name_en: "Tech Spec" },
  { type: "outcome", slug: "prompt", name_vi: "Prompt", name_en: "Prompt" },
  { type: "outcome", slug: "eval", name_vi: "Đánh giá", name_en: "Evaluation" },
  { type: "outcome", slug: "experiment", name_vi: "Thí nghiệm", name_en: "Experiment" },
  { type: "outcome", slug: "checklist", name_vi: "Checklist", name_en: "Checklist" },
  { type: "outcome", slug: "dashboard", name_vi: "Dashboard", name_en: "Dashboard" },
];

async function seed() {
  console.log("🌱 Seeding taxonomy data...\n");

  // Seed goals
  console.log("📋 Seeding goals...");
  const { error: goalsError } = await supabase
    .from("taxonomy")
    .upsert(goals.map((g, i) => ({ ...g, sort_order: i })), {
      onConflict: "slug",
    });

  if (goalsError) {
    console.error("❌ Error seeding goals:", goalsError);
    process.exit(1);
  }
  console.log(`✅ Seeded ${goals.length} goals`);

  // Seed outcomes
  console.log("📋 Seeding outcomes...");
  const { error: outcomesError } = await supabase
    .from("taxonomy")
    .upsert(outcomes.map((o, i) => ({ ...o, sort_order: i })), {
      onConflict: "slug",
    });

  if (outcomesError) {
    console.error("❌ Error seeding outcomes:", outcomesError);
    process.exit(1);
  }
  console.log(`✅ Seeded ${outcomes.length} outcomes`);

  console.log("\n✨ Taxonomy seeded successfully!");
}

seed().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
