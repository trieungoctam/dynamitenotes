import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface InsightsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function InsightsSearch({
  value,
  onChange,
  placeholder = "Search insights...",
}: InsightsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}
