import { useMemo, useState } from "react";

import { LoadingContext } from "./LoadingContext";

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const show = () => {
    setIsLoading(true);
  };

  const hide = () => {
    setIsLoading(false);
  };

  const run = async (operation) => {
    show();

    try {
      return await operation();
    } finally {
      hide();
    }
  };

  const value = useMemo(
    () => ({
      // Internal state can be consumed by infrastructure UI on integration stage.
      isLoading,
      // Public contract for all modules.
      show,
      hide,
      run,
    }),
    [isLoading],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}
