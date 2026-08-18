import { useState } from "react";

import AuthModal from "@/components/auth/AuthModal";

export default function TestAuthPage() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <AuthModal
      onClose={() => setOpen(false)}
      onOpenRegister={() => {}}
      onOpenResetPassword={() => {}}
    />
  );
}
