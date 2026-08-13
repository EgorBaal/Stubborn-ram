import { useMemo, useState } from "react";

import { LoadingContext } from "./LoadingContext";

const defaultMeta = null;

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState(defaultMeta);

  const startLoading = (nextMeta = defaultMeta) => {
    setMeta(nextMeta);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setMeta(defaultMeta);
  };

  const setLoading = (nextValue, nextMeta = defaultMeta) => {
    setIsLoading(Boolean(nextValue));
    setMeta(nextValue ? nextMeta : defaultMeta);
  };

  const value = useMemo(
    () => ({
      isLoading,
      meta,
      startLoading,
      stopLoading,
      setLoading,
    }),
    [isLoading, meta],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}
