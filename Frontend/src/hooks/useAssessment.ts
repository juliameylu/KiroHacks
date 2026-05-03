import { useState, useEffect, useCallback } from "react";
import type { AssessmentResponse } from "../types/assessment";

const API_BASE = ""; // Vite proxy forwards /api/* to localhost:3001

/**
 * useAssessment — fetches the cached stress assessment from the backend.
 *
 * Auto-refresh logic:
 *   1. On mount (and on every refetch() call), GET /api/assessment is called.
 *   2. If the backend responds with 503, it means the cache is empty (no
 *      pipeline has run yet). In that case the hook automatically calls
 *      POST /api/refresh to trigger the pipeline, then retries the GET.
 *   3. If the retry also fails (or any other non-OK status is returned),
 *      the error message from the response body is surfaced to the caller.
 *
 * The returned `refetch` function lets the UI (e.g. an ErrorState Retry
 * button) manually re-trigger the same fetch-with-auto-refresh flow.
 */
export function useAssessment(): {
  data: AssessmentResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Try to fetch the cached assessment.
      let response = await fetch(`${API_BASE}/api/assessment`);

      // Step 2: If the cache is empty (503), trigger the pipeline and retry.
      if (response.status === 503) {
        // Kick off the pipeline — this may take several seconds.
        const refreshResponse = await fetch(`${API_BASE}/api/refresh`, {
          method: "POST",
        });

        if (!refreshResponse.ok) {
          // Pipeline itself failed; surface the error from the refresh route.
          const body = await refreshResponse.json().catch(() => ({}));
          throw new Error(
            body.error ?? `Refresh failed with status ${refreshResponse.status}`
          );
        }

        // Retry the GET now that the cache should be warm.
        response = await fetch(`${API_BASE}/api/assessment`);
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.error ?? `Unexpected response status ${response.status}`
        );
      }

      const json: AssessmentResponse = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAssessment();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchAssessment]);

  return { data, loading, error, refetch: fetchAssessment };
}
