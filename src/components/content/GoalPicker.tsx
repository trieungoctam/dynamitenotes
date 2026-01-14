/**
 * GoalPicker
 * Dynamic goal buttons for filtering content by product development stage.
 * Goals are fetched from the database based on actual post content.
 */

import { cn } from "@/lib/utils";
import { useActiveGoals } from "@/hooks/use-goals";
import {
  Compass,
  FileText,
  Hammer,
  Rocket,
  BarChart3,
  Settings,
  Lightbulb,
  Code,
  Cpu,
  Database,
  Globe,
  Zap,
  Box,
  Package,
  Wrench,
  Target,
  TrendingUp,
  Layers,
  GitBranch,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

// Icon mapping based on goal slug/name
const iconMap: Record<string, LucideIcon> = {
  decide: Compass,
  spec: FileText,
  build: Hammer,
  ship: Rocket,
  measure: BarChart3,
  operate: Settings,
  design: Layers,
  develop: Code,
  deploy: Rocket,
  analyze: BarChart3,
  optimize: Zap,
  research: Lightbulb,
  planning: Target,
  backend: Database,
  frontend: Globe,
  infrastructure: Cpu,
  testing: CheckCircle2,
  workflow: GitBranch,
  performance: TrendingUp,
};

// Color mapping for goals with dark mode support
const colorMap: Record<string, string> = {
  decide: "text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/20",
  spec: "text-purple-500 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/20",
  build: "text-orange-500 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/20",
  ship: "text-green-500 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 border-green-500/30 hover:bg-green-500/20",
  measure: "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/20",
  operate: "text-gray-400 dark:text-gray-300 bg-gray-500/10 dark:bg-gray-500/20 border-gray-500/30 hover:bg-gray-500/20",
};

// Fallback colors for unknown goals with dark mode support
const fallbackColors = [
  "text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/20",
  "text-purple-500 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/20",
  "text-orange-500 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/20",
  "text-green-500 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 border-green-500/30 hover:bg-green-500/20",
  "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/20",
  "text-pink-500 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/20",
  "text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/20",
  "text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 border-red-500/30 hover:bg-red-500/20",
];

interface GoalPickerProps {
  selectedGoal?: string | null;
  onSelectGoal: (goalSlug: string | null) => void;
  compact?: boolean;
}

export function GoalPicker({
  selectedGoal,
  onSelectGoal,
  compact = false,
}: GoalPickerProps) {
  const { data: goals, isLoading, error } = useActiveGoals();

  const handleClick = (slug: string) => {
    if (selectedGoal === slug) {
      onSelectGoal(null);
    } else {
      onSelectGoal(slug);
    }
  };

  // Get icon for goal
  const getIcon = (goal: { slug: string; name: string }) => {
    const Icon = iconMap[goal.slug] || iconMap[goal.name.toLowerCase()] || Box;
    return <Icon className="w-5 h-5" />;
  };

  // Get color for goal
  const getColor = (goal: { slug: string; name: string; id: string }) => {
    return colorMap[goal.slug] || colorMap[goal.name.toLowerCase()] ||
           fallbackColors[Number(goal.id) % fallbackColors.length];
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-lg bg-muted/30 animate-pulse border border-border/30"
          />
        ))}
      </div>
    );
  }

  if (error || !goals || goals.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No goals available
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleClick(goal.slug)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
              getColor(goal),
              selectedGoal === goal.slug && "ring-2 ring-offset-2 ring-offset-background"
            )}
            title={goal.description || goal.name}
          >
            {getIcon(goal)}
            <span className="text-sm font-medium">{goal.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => handleClick(goal.slug)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            getColor(goal),
            selectedGoal === goal.slug &&
              "ring-2 ring-offset-2 ring-offset-background"
          )}
          title={goal.description || goal.name}
        >
          {getIcon(goal)}
          <span className="font-medium">{goal.name}</span>
          {goal.description && (
            <span className="text-xs opacity-70">{goal.description}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Export the type for use in other components
export type { GoalPickerProps };
