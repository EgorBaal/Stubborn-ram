import { useState } from "react";

import AuthModalV2 from "@/components/auth/AuthModalV2";

export default function AuthTestPage() {
  const [isOpen] = useState(true);

  return (
    <>
      {isOpen && (
        <AuthModalV2
          onClose={() => {}}
          onOpenRegister={() => {}}
          onOpenResetPassword={() => {}}
        />
      )}
    </>
  );
}
