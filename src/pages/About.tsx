/**
 * About Page
 * Personal bio, principles, and social links.
 * Enhanced with Dark Mode (OLED) styling.
 */

import { useAbout } from "@/hooks/use-about";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Rss,
  ExternalLink,
  User,
  Sparkles,
} from "lucide-react";

// Social icon mapping
const socialIcons: Record<string, React.ElementType> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
};

// Loading skeleton
function AboutSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <Skeleton className="w-28 h-28 rounded-full border-2 border-border/30" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
      </div>
    </div>
  );
}

export default function About() {
  const { data: about, isLoading } = useAbout();
  const { lang } = useLanguage();

  // Get localized content
  const bio = about?.[`bio_${lang}`] || about?.bio_vi || "";
  const principles = about?.[`principles_${lang}`] || about?.principles_vi || "";

  // Text labels
  const title = lang === "vi" ? "Giới thiệu" : "About";
  const subtitle = lang === "vi" ? "Dev × PM × Builder" : "Dev × PM × Builder";
  const bioTitle = lang === "vi" ? "Giới thiệu" : "Bio";
  const principlesTitle = lang === "vi" ? "Nguyên tắc" : "Principles";
  const connectTitle = lang === "vi" ? "Kết nối" : "Connect";
  const emptyBio =
    lang === "vi"
      ? "Xin chào! Tôi là Dynamite. Tôi thích xây dựng sản phẩm và chia sẻ kiến thức."
      : "Hi! I'm Dynamite. I love building products and sharing knowledge.";
  const defaultPrinciples =
    lang === "vi"
      ? "- Chất lượng hơn số lượng\n- Đơn giản hơn phức tạp\n- Hành động hơn kế hoạch"
      : "- Quality over quantity\n- Simple over complex\n- Action over planning";

  return (
    <main className="min-h-screen">
      {/* Header with gradient background */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />
        <div className="container px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container px-4 md:px-6 lg:px-8 py-12 max-w-3xl">
        {isLoading ? (
          <AboutSkeleton />
        ) : (
          <>
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
                <Avatar className="w-28 h-28 relative border-4 border-background">
                  <AvatarImage src="/profile.jpg" alt={title} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <User className="w-14 h-14 text-blue-400" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Dynamite</h2>
                <p className="text-lg text-blue-400 font-medium">{subtitle}</p>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">{bioTitle}</h3>
              </div>
              {bio ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <MarkdownRenderer content={bio} />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed text-lg">{emptyBio}</p>
              )}
            </div>

            {/* Principles Section */}
            {principles && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold">{principlesTitle}</h3>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                  <MarkdownRenderer content={principles} />
                </div>
              </div>
            )}

            {/* Default principles if none in DB */}
            {!principles && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold">{principlesTitle}</h3>
                </div>
                <div className="text-muted-foreground whitespace-pre-line text-lg leading-relaxed">
                  {defaultPrinciples}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <ExternalLink className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold">{connectTitle}</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {about?.social_links &&
                  Object.entries(about.social_links).map(([platform, url]) => {
                    const Icon = socialIcons[platform];
                    if (!Icon) return null;

                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/30 text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="capitalize font-medium">{platform}</span>
                        <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </a>
                    );
                  })}

                {/* Default social links if none in DB */}
                {!about?.social_links && (
                  <>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/30 text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
                    >
                      <Github className="w-5 h-5" />
                      <span className="font-medium">GitHub</span>
                      <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/30 text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
                    >
                      <Twitter className="w-5 h-5" />
                      <span className="font-medium">Twitter</span>
                      <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </a>
                    <a
                      href="/rss.xml"
                      className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/30 text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
                    >
                      <Rss className="w-5 h-5" />
                      <span className="font-medium">RSS</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Newsletter CTA (Optional - can be added later) */}
            {/* <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-center">
              <h3 className="text-xl font-bold mb-3">
                {lang === "vi" ? "Đăng ký nhận bản tin" : "Subscribe to newsletter"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {lang === "vi"
                  ? "Nhận bài viết mới nhất qua email"
                  : "Get the latest posts delivered to your inbox"}
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                {lang === "vi" ? "Đăng ký" : "Subscribe"}
              </Button>
            </div> */}
          </>
        )}
      </section>
    </main>
  );
}
