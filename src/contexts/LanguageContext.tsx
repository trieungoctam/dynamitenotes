/**
 * LanguageContext
 * Lightweight i18n support with Vietnamese (vi) and English (en) languages.
 * Replaced i18next with a simple custom implementation for better bundle size.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Translation resources
const translations = {
  vi: {
    // Navigation
    "nav.start": "Bắt đầu",
    "nav.posts": "Bài viết",
    "nav.insights": "Insights",
    "nav.series": "Series",
    "nav.photos": "Ảnh",
    "nav.resume": "Resume",
    "nav.about": "Giới thiệu",
    // Common
    "common.search": "Tìm kiếm...",
    "common.searchPlaceholder": "Tìm bài viết, góc nhìn...",
    "common.loading": "Đang tải...",
    "common.readMore": "Đọc thêm",
    "common.readTime": "phút đọc",
    "common.published": "Đã xuất bản",
    "common.draft": "Bản nháp",
    // Goals
    "goal.decide": "Chọn hướng",
    "goal.spec": "Định nghĩa",
    "goal.build": "Xây dựng",
    "goal.ship": "Vận chuyển",
    "goal.measure": "Đo lường",
    "goal.operate": "Vận hành",
    // Levels
    "level.starter": "Starter",
    "level.builder": "Builder",
    "level.advanced": "Advanced",
    // Admin
    "admin.login": "Đăng nhập",
    "admin.logout": "Đăng xuất",
    "admin.dashboard": "Dashboard",
  },
  en: {
    // Navigation
    "nav.start": "Start",
    "nav.posts": "Posts",
    "nav.insights": "Insights",
    "nav.series": "Series",
    "nav.photos": "Photos",
    "nav.resume": "Resume",
    "nav.about": "About",
    // Common
    "common.search": "Search...",
    "common.searchPlaceholder": "Search posts, insights...",
    "common.loading": "Loading...",
    "common.readMore": "Read more",
    "common.readTime": "min read",
    "common.published": "Published",
    "common.draft": "Draft",
    // Goals
    "goal.decide": "Decide",
    "goal.spec": "Spec",
    "goal.build": "Build",
    "goal.ship": "Ship",
    "goal.measure": "Measure",
    "goal.operate": "Operate",
    // Levels
    "level.starter": "Starter",
    "level.builder": "Builder",
    "level.advanced": "Advanced",
    // Admin
    "admin.login": "Login",
    "admin.logout": "Logout",
    "admin.dashboard": "Dashboard",
  },
} as const;

type Language = "vi" | "en";
type TranslationKey = keyof typeof translations.vi;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  // Helper to get localized field from bilingual content
  getLocalizedField: <T extends Record<string, unknown>>(
    obj: T,
    field: string
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(
    () => (localStorage.getItem("i18nextLng") as Language) || "vi"
  );

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("i18nextLng", newLang);
  }, []);

  // Translation function
  const t = useCallback(
    (key: string): string => {
      const currentTranslations = translations[lang];
      const value = currentTranslations[key as TranslationKey];
      if (value) return value;

      // Fallback to Vietnamese
      const fallback = translations.vi[key as TranslationKey];
      if (fallback) return fallback;

      // Return key if no translation found
      return key;
    },
    [lang]
  );

  // Get localized field from bilingual content (e.g., title_vi / title_en)
  // Falls back to Vietnamese if English is not available
  const getLocalizedField = useCallback(
    <T extends Record<string, unknown>>(obj: T, field: string): string => {
      const localizedField = `${field}_${lang}`;
      const fallbackField = `${field}_vi`;

      const value = obj[localizedField];
      if (value && typeof value === "string") {
        return value;
      }

      // Fallback to Vietnamese
      const fallback = obj[fallbackField];
      if (fallback && typeof fallback === "string") {
        return fallback;
      }

      return "";
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
