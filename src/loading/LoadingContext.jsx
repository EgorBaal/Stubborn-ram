import { createContext } from "react";

/**
 * Internal context for global loading state.
 * Consume this state through useLoading.
 */
export const LoadingContext = createContext(null);
