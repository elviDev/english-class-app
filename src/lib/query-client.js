import { QueryClient } from "@tanstack/react-query";

/**
 * Query defaults tuned for a small, mostly-realtime app: data is cached
 * client-side and reused across tab switches (no refetch-on-focus churn),
 * while realtime subscriptions (see src/hooks) keep it fresh in the
 * background instead of relying on polling.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
