/**
 * Supabase Database Types
 * These types mirror the database schema defined in the plan.
 * Replace with generated types from `bunx supabase gen types --linked` when Supabase is linked.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      taxonomy: {
        Row: {
          id: string;
          type: "goal" | "outcome";
          slug: string;
          name_vi: string;
          name_en: string;
          description_vi: string | null;
          description_en: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "goal" | "outcome";
          slug: string;
          name_vi: string;
          name_en: string;
          description_vi?: string | null;
          description_en?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: "goal" | "outcome";
          slug?: string;
          name_vi?: string;
          name_en?: string;
          description_vi?: string | null;
          description_en?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          slug: string;
          title_vi: string;
          title_en: string | null;
          content_vi: string;
          content_en: string | null;
          excerpt_vi: string | null;
          excerpt_en: string | null;
          goal_id: string | null;
          outcome_id: string | null;
          level: "starter" | "builder" | "advanced" | null;
          read_time: number | null;
          featured: boolean;
          published: boolean;
          published_at: string | null;
                    cover_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_vi: string;
          title_en?: string | null;
          content_vi: string;
          content_en?: string | null;
          excerpt_vi?: string | null;
          excerpt_en?: string | null;
          goal_id?: string | null;
          outcome_id?: string | null;
          level?: "starter" | "builder" | "advanced" | null;
          read_time?: number | null;
          featured?: boolean;
          published?: boolean;
          published_at?: string | null;
          scheduled_for?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_vi?: string;
          title_en?: string | null;
          content_vi?: string;
          content_en?: string | null;
          excerpt_vi?: string | null;
          excerpt_en?: string | null;
          goal_id?: string | null;
          outcome_id?: string | null;
          level?: "starter" | "builder" | "advanced" | null;
          read_time?: number | null;
          featured?: boolean;
          published?: boolean;
          published_at?: string | null;
          scheduled_for?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          name_vi: string;
          name_en: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_vi: string;
          name_en?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_vi?: string;
          name_en?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      post_versions: {
        Row: {
          id: string;
          post_id: string;
          title_vi: string;
          title_en: string | null;
          content_vi: string;
          content_en: string | null;
          excerpt_vi: string | null;
          excerpt_en: string | null;
          cover_image: string | null;
          change_reason: string | null;
          version: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          title_vi: string;
          title_en?: string | null;
          content_vi: string;
          content_en?: string | null;
          excerpt_vi?: string | null;
          excerpt_en?: string | null;
          cover_image?: string | null;
          change_reason?: string | null;
          version?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          title_vi?: string;
          title_en?: string | null;
          content_vi?: string;
          content_en?: string | null;
          excerpt_vi?: string | null;
          excerpt_en?: string | null;
          cover_image?: string | null;
          change_reason?: string | null;
          version?: number;
          created_by?: string | null;
          created_at?: string;
        };
      };
      insights: {
        Row: {
          id: string;
          content_vi: string;
          content_en: string | null;
          tags: string[];
          related_post_id: string | null;
          pinned: boolean;
          published: boolean;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_vi: string;
          content_en?: string | null;
          tags?: string[];
          related_post_id?: string | null;
          pinned?: boolean;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_vi?: string;
          content_en?: string | null;
          tags?: string[];
          related_post_id?: string | null;
          pinned?: boolean;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
        };
      };
      series: {
        Row: {
          id: string;
          slug: string;
          title_vi: string;
          title_en: string | null;
          description_vi: string | null;
          description_en: string | null;
          post_ids: string[];
          cover_image: string | null;
          featured: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_vi: string;
          title_en?: string | null;
          description_vi?: string | null;
          description_en?: string | null;
          post_ids?: string[];
          cover_image?: string | null;
          featured?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title_vi?: string;
          title_en?: string | null;
          description_vi?: string | null;
          description_en?: string | null;
          post_ids?: string[];
          cover_image?: string | null;
          featured?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          url: string;
          thumbnail_url: string | null;
          caption_vi: string | null;
          caption_en: string | null;
          album: string | null;
          sort_order: number;
          published: boolean;
          taken_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          thumbnail_url?: string | null;
          caption_vi?: string | null;
          caption_en?: string | null;
          album?: string | null;
          sort_order?: number;
          published?: boolean;
          taken_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          thumbnail_url?: string | null;
          caption_vi?: string | null;
          caption_en?: string | null;
          album?: string | null;
          sort_order?: number;
          published?: boolean;
          taken_at?: string | null;
          created_at?: string;
        };
      };
      resume_sections: {
        Row: {
          id: string;
          type: "highlight" | "experience" | "project" | "writing" | "speaking";
          title_vi: string;
          title_en: string | null;
          content: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "highlight" | "experience" | "project" | "writing" | "speaking";
          title_vi: string;
          title_en?: string | null;
          content: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: "highlight" | "experience" | "project" | "writing" | "speaking";
          title_vi?: string;
          title_en?: string | null;
          content?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      about: {
        Row: {
          id: string;
          bio_vi: string;
          bio_en: string | null;
          principles_vi: string | null;
          principles_en: string | null;
          social_links: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bio_vi: string;
          bio_en?: string | null;
          principles_vi?: string | null;
          principles_en?: string | null;
          social_links?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bio_vi?: string;
          bio_en?: string | null;
          principles_vi?: string | null;
          principles_en?: string | null;
          social_links?: Json;
          updated_at?: string;
        };
      };
      admins: {
        Row: {
          profile_id: string;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Helper types for easier access
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenient type aliases
export type Post = Tables<"posts">;
export type Insight = Tables<"insights">;
export type Series = Tables<"series">;
export type Photo = Tables<"photos">;
export type Taxonomy = Tables<"taxonomy">;
export type ResumeSection = Tables<"resume_sections">;
export type About = Tables<"about">;
export type Admin = Tables<"admins">;
export type Tag = Tables<"tags">;
export type PostTag = Tables<"post_tags">;
export type PostVersion = Tables<"post_versions">;
export type Profile = Tables<"profiles">;
