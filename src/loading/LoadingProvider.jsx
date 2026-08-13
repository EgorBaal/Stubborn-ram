import { useMemo, useState } from "react";

import { LoadingContext } from "./LoadingContext";

export default function LoadingProvider({ children }) {
  const [activeLoads, setActiveLoads] = useState(0);

  const isLoading = activeLoads > 0;

  const show = () => {
    setActiveLoads((previous) => previous + 1);
  };

  const hide = () => {
    setActiveLoads((previous) => (previous > 0 ? previous - 1 : 0));
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
