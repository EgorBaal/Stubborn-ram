import { useState } from "react";

import Hero from "@/components/landing/Hero";
import HomeContent from "@/components/landing/HomeContent";
import AuthModal from "@/components/auth/AuthModal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <Hero onOpenAuth={() => setIsAuthOpen(true)} />

      <HomeContent />

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}
