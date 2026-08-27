import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { ServiceGrid } from "@/components/home/ServiceGrid";
import { StatsBand } from "@/components/home/StatsBand";
import { AnnouncementsSection } from "@/components/home/AnnouncementsSection";
import { GuideTeaser } from "@/components/home/GuideTeaser";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ServiceGrid />
        <StatsBand />
        <AnnouncementsSection />
        <GuideTeaser />
      </main>
      <SiteFooter />
    </div>
  );
}
