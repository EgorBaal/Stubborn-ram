import { useState } from "react";

import "./LandingPage.css";

import Hero from "@/components/landing/Hero";
import HomeContent from "@/components/landing/HomeContent";
import AuthModal from "@/components/auth/AuthModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

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
          onOpenResetPassword={() => {
            setIsAuthOpen(false);
            setIsResetPasswordOpen(true);
          }}
        />
      )}

      {isRegisterOpen && (
        <RegisterModal onClose={() => setIsRegisterOpen(false)} />
      )}

      {isResetPasswordOpen && (
        <ResetPasswordModal onClose={() => setIsResetPasswordOpen(false)} />
      )}
    </>
  );
}
