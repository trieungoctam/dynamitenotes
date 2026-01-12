import { ReadmeHeader } from "@/components/home/ReadmeHeader";
import { ModeSelector } from "@/components/home/ModeSelector";
import { PopularPackages } from "@/components/home/PopularPackages";
import { RecentChangelog } from "@/components/home/RecentChangelog";

const Index = () => {
  return (
    <main className="container px-4 md:px-6 pb-20">
      <ReadmeHeader />
      <ModeSelector />
      <PopularPackages />
      <RecentChangelog />
    </main>
  );
};

export default Index;
