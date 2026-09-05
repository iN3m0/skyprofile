import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The main process already caches resource/profile data; the renderer
      // just needs to avoid redundant IPC round-trips within a session.
      staleTime: 30_000,
      retry: 1
    }
  }
})
