import FeatureGrid from "@/components/landing/FeatureGrid";
import Hero from "@/components/landing/Hero";
import LandingNavbar from "@/components/landing/LandingNavbar";

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <Hero />
        <FeatureGrid />
      </main>
      <footer className="border-t border-base-300 py-6 text-center text-xs text-base-content/50">
        DataScope - Enterprise Data Discovery &amp; Intelligence Platform
      </footer>
    </>
  );
}
