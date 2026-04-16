# Resolved Bugs and Fixes

- **Bug:** Next.js QueryClient cache leak and hydration bypass.
  **Fix:** Wrapped new QueryClient in `useState` inside the `ClientLayoutWrapper` provider and removed the `mounted` check to enable SSR.
