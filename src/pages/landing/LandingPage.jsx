import { useState } from "react";

import Hero from "@/components/landing/Hero";
import HomeContent from "@/components/landing/HomeContent";
import AuthModal from "@/components/auth/AuthModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <>
      <Hero
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <HomeContent />

      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onOpenRegister={() => {
            setIsAuthOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      )}

      {isRegisterOpen && (
        <RegisterModal onClose={() => setIsRegisterOpen(false)} />
      )}
    </>
  );
}
