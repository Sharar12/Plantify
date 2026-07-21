/**
 * Safe API fetch utility that handles non-JSON (e.g. HTML) responses gracefully.
 * Instead of crashing with "Unexpected token '<' ... is not valid JSON",
 * it returns an error object with a clear message.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Safely parse a response as JSON.
 * If the response body starts with '<' (i.e. is HTML), it returns an error
 * instead of throwing a JSON parse error.
 */
export async function safeParseJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();

  // Check if the response is HTML (e.g. error pages, redirects)
  if (text.trim().startsWith('<')) {
    throw new ApiError(
      `Server returned HTML instead of JSON (status ${res.status}). The backend may be unavailable or returned an error page.`,
      res.status,
      { htmlSnippet: text.substring(0, 200) }
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    throw new ApiError(
      `Failed to parse response as JSON (status ${res.status}): ${(e as Error).message}`,
      res.status,
      { rawBody: text.substring(0, 200) }
    );
  }
}

/**
 * Fetch wrapper that provides safe JSON parsing and standard headers.
 */
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  // Handle 204 No Content
  if (res.status === 204) {
    return { ok: true, status: 204, data: null as unknown as T };
  }

  const data = await safeParseJson<T>(res);

  return { ok: res.ok, status: res.status, data };
}

/**
 * Legacy fetch helper for GET requests — returns parsed data or throws.
 */
export async function apiGet<T = any>(url: string): Promise<T> {
  const { data } = await apiFetch<T>(url);
  return data;
}

/**
 * Legacy fetch helper for POST requests.
 */
export async function apiPost<T = any>(url: string, body?: any): Promise<T> {
  const { data } = await apiFetch<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  return data;
}

/**
 * Legacy fetch helper for PUT requests.
 */
export async function apiPut<T = any>(url: string, body?: any): Promise<T> {
  const { data } = await apiFetch<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
  return data;
}

/**
 * Legacy fetch helper for DELETE requests.
 */
export async function apiDelete<T = any>(url: string): Promise<T> {
  const { data } = await apiFetch<T>(url, { method: 'DELETE' });
  return data;
}