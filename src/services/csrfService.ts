import { useState, useEffect } from 'react';

// In-memory token cache
let cachedCsrfToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

/**
 * Retrieves the current valid CSRF token, fetching one from the server if not already present.
 * Uses promise-memoization to avoid concurrent duplicate requests.
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  tokenFetchPromise = (async () => {
    try {
      const res = await fetch('/api/csrf-token', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.csrfToken) {
          cachedCsrfToken = data.csrfToken;
          return data.csrfToken;
        }
      }

      // Check header fallback
      const headerToken = res.headers?.get ? res.headers.get('X-CSRF-Token') : null;
      if (headerToken) {
        cachedCsrfToken = headerToken;
        return headerToken;
      }
    } catch (err) {
      console.warn('[csrfService] Failed to retrieve CSRF token from server:', err);
    } finally {
      tokenFetchPromise = null;
    }

    return cachedCsrfToken || '';
  })();

  return tokenFetchPromise;
}

/**
 * Manually update the cached CSRF token (e.g. from response headers)
 */
export function setCachedCsrfToken(token: string): void {
  if (token && typeof token === 'string') {
    cachedCsrfToken = token;
  }
}

/**
 * Force-refreshes the CSRF token from the server
 */
export async function refreshCsrfToken(): Promise<string> {
  cachedCsrfToken = null;
  return getCsrfToken();
}

/**
 * Centralized fetch wrapper that automatically applies CSRF protection tokens
 * to all state-changing HTTP requests (POST, PUT, PATCH, DELETE).
 * Includes automatic retry with a fresh token if an expired token error (EBADCSRFTOKEN) occurs.
 */
export async function fetchWithCsrf(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const headers = new Headers(init?.headers || {});

  if (isStateChanging) {
    const token = await getCsrfToken();
    if (token) {
      headers.set('X-CSRF-Token', token);
    }
  }

  const modifiedInit: RequestInit = {
    ...init,
    headers,
  };

  try {
    const response = await fetch(input, modifiedInit);

    // If server returned a fresh CSRF token in headers, update cache
    const serverCsrfHeader = response.headers?.get ? response.headers.get('X-CSRF-Token') : null;
    if (serverCsrfHeader) {
      setCachedCsrfToken(serverCsrfHeader);
    }

    // If request failed specifically with CSRF rejection, attempt single retry with fresh token
    if (response.status === 403 && isStateChanging) {
      const cloned = response.clone();
      try {
        const errorJson = await cloned.json();
        if (errorJson.code === 'EBADCSRFTOKEN' || errorJson.requiresCsrfToken) {
          console.warn('[csrfService] CSRF token rejected by server. Refreshing token and retrying...');
          const freshToken = await refreshCsrfToken();
          if (freshToken) {
            headers.set('X-CSRF-Token', freshToken);
            return await fetch(input, {
              ...init,
              headers,
            });
          }
        }
      } catch {
        // Not a JSON response, proceed returning original response
      }
    }

    return response;
  } catch (error: any) {
    console.warn(`[csrfService] Network request failed for ${typeof input === 'string' ? input : 'URL'}:`, error?.message || error);
    // Возвращаем синтетический безопасный Response, чтобы не вызывать Uncaught Failed to fetch в браузере
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Сетевой сбой при обращении к серверу',
        networkError: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'X-Network-Fallback': 'true',
        },
      }
    );
  }
}

/**
 * React Hook for forms and components that need the active CSRF token (e.g., hidden inputs)
 */
export function useCsrfToken(): { csrfToken: string; refreshToken: () => Promise<string> } {
  const [token, setToken] = useState<string>(cachedCsrfToken || '');

  useEffect(() => {
    let isMounted = true;
    getCsrfToken().then((t) => {
      if (isMounted && t) {
        setToken(t);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshToken = async () => {
    const fresh = await refreshCsrfToken();
    setToken(fresh);
    return fresh;
  };

  return { csrfToken: token, refreshToken };
}
