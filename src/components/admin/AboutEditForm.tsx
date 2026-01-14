/**
 * AboutEditForm - Form for editing about page content
 */

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownEditor } from "./MarkdownEditor";
import { Github, Twitter, Linkedin, Mail, Plus, Trash2, X } from "lucide-react";
import type { AboutData } from "@/hooks/use-admin-about";
import { useLanguage } from "@/contexts/LanguageContext";

interface AboutEditFormProps {
  data: AboutData | null;
  onSubmit: (data: Partial<AboutData>) => void;
  isLoading: boolean;
}

const PLATFORMS = [
  { key: "github", label: "GitHub", icon: Github },
  { key: "twitter", label: "Twitter", icon: Twitter },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "email", label: "Email", icon: Mail },
];

interface SocialLink {
  platform: string;
  url: string;
}

interface ResumeHeaderData {
  name: string;
  email: string;
  location: string;
  github_url: string;
  website_url: string;
  linkedin_url: string;
}

export function AboutEditForm({ data, onSubmit, isLoading }: AboutEditFormProps) {
  const { lang } = useLanguage();

  const [bioVi, setBioVi] = useState(data?.bio_vi || "");
  const [bioEn, setBioEn] = useState(data?.bio_en || "");
  const [principlesVi, setPrinciplesVi] = useState(data?.principles_vi || "");
  const [principlesEn, setPrinciplesEn] = useState(data?.principles_en || "");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    Object.entries(data?.social_links || {}).map(([platform, url]) => ({
      platform,
      url,
    }))
  );
  const [resumeHeader, setResumeHeader] = useState<ResumeHeaderData>(
    data?.resume_header || {
      name: "",
      email: "",
      location: "",
      github_url: "",
      website_url: "",
      linkedin_url: "",
    }
  );

  useEffect(() => {
    if (data) {
      setBioVi(data.bio_vi || "");
      setBioEn(data.bio_en || "");
      setPrinciplesVi(data.principles_vi || "");
      setPrinciplesEn(data.principles_en || "");
      setSocialLinks(
        Object.entries(data.social_links || {}).map(([platform, url]) => ({
          platform,
          url,
        }))
      );
      setResumeHeader(
        data.resume_header || {
          name: "",
          email: "",
          location: "",
          github_url: "",
          website_url: "",
          linkedin_url: "",
        }
      );
    }
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Convert social links array back to record
    const socialLinksRecord: Record<string, string> = {};
    socialLinks.forEach((link) => {
      if (link.platform && link.url) {
        socialLinksRecord[link.platform] = link.url;
      }
    });

    onSubmit({
      bio_vi: bioVi,
      bio_en: bioEn || null,
      principles_vi: principlesVi,
      principles_en: principlesEn || null,
      social_links: socialLinksRecord,
      resume_header: resumeHeader,
    });
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const getPlatformIcon = (platform: string) => {
    const found = PLATFORMS.find((p) => p.key === platform);
    return found ? found.icon : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bio Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bio</h3>
        <Tabs defaultValue="vi">
          <TabsList>
            <TabsTrigger value="vi">Vietnamese</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="vi" className="mt-4">
            <MarkdownEditor
              value={bioVi}
              onChange={setBioVi}
              placeholder="Write your biography in Vietnamese..."
              height={300}
            />
          </TabsContent>
          <TabsContent value="en" className="mt-4">
            <MarkdownEditor
              value={bioEn}
              onChange={setBioEn}
              placeholder="Write your biography in English..."
              height={300}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Principles Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Principles</h3>
        <Tabs defaultValue="vi">
          <TabsList>
            <TabsTrigger value="vi">Vietnamese</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="vi" className="mt-4">
            <MarkdownEditor
              value={principlesVi}
              onChange={setPrinciplesVi}
              placeholder="Write your principles in Vietnamese..."
              height={300}
            />
          </TabsContent>
          <TabsContent value="en" className="mt-4">
            <MarkdownEditor
              value={principlesEn}
              onChange={setPrinciplesEn}
              placeholder="Write your principles in English..."
              height={300}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Social Links</h3>
          <Button type="button" onClick={addSocialLink} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label>Platform</Label>
                  <Input
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                    placeholder="github, twitter, linkedin, email"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={() => removeSocialLink(index)}
                variant="ghost"
                size="sm"
                className="mt-6"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Supported platforms: github, twitter, linkedin, email. Icons will be displayed automatically.
        </p>
      </div>

      {/* Resume Header */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resume Header</h3>
        <p className="text-sm text-muted-foreground">
          Information displayed at the top of the resume page
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={resumeHeader.name}
              onChange={(e) => setResumeHeader({ ...resumeHeader, name: e.target.value })}
              placeholder="Your Name"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={resumeHeader.email}
              onChange={(e) => setResumeHeader({ ...resumeHeader, email: e.target.value })}
              placeholder="hello@example.com"
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={resumeHeader.location}
              onChange={(e) => setResumeHeader({ ...resumeHeader, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>

          <div>
            <Label>GitHub URL</Label>
            <Input
              type="url"
              value={resumeHeader.github_url}
              onChange={(e) => setResumeHeader({ ...resumeHeader, github_url: e.target.value })}
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <Label>Website URL</Label>
            <Input
              type="url"
              value={resumeHeader.website_url}
              onChange={(e) => setResumeHeader({ ...resumeHeader, website_url: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <Label>LinkedIn URL</Label>
            <Input
              type="url"
              value={resumeHeader.linkedin_url}
              onChange={(e) => setResumeHeader({ ...resumeHeader, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.open(`/${lang === "vi" ? "" : "en"}about`, "_blank")}>
          Preview Page
        </Button>
      </div>
    </form>
  );
}
