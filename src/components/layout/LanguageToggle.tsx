/**
 * LanguageToggle
 * A toggle button to switch between Vietnamese and English.
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "vi" ? "en" : "vi")}
      className={cn(
        "px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors",
        "border border-border hover:bg-muted/50"
      )}
      title={lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      {lang.toUpperCase()}
    </button>
  );
}
