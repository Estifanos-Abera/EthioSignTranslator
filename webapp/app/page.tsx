import Hero from "@/components/landing/Hero";
import WhySection from "@/components/landing/WhySection";
import HowItWorks from "@/components/landing/HowItWorks";
import ForCommunity from "@/components/landing/ForCommunity";
import EngineeringCallout from "@/components/landing/EngineeringCallout";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhySection />
      <HowItWorks />
      <ForCommunity />
      <EngineeringCallout />
    </>
  );
}