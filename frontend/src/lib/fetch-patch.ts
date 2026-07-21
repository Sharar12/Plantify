/**
 * Global fetch patcher — patches Response.prototype.json to safely handle
 * non-JSON responses (e.g. HTML error pages) instead of throwing
 * "Unexpected token '<', ... is not valid JSON".
 *
 * Import this file at the top of your layout.tsx to apply globally.
 */

let patched = false;

export function applyFetchPatch(): void {
  if (patched || typeof Response === 'undefined') return;
  patched = true;

  const originalJson = Response.prototype.json;

  Response.prototype.json = async function <T>(): Promise<T> {
    try {
      // Clone to avoid consuming the body
      const clone = this.clone();
      const text = await clone.text();

      // If response starts with '<', it's likely HTML — throw a descriptive error
      if (text.trim().startsWith('<')) {
        throw new SyntaxError(
          `Unexpected token '<': Server returned HTML instead of JSON (HTTP ${this.status}). ` +
          `This usually means the API endpoint is unavailable, returned an error page, ` +
          `or the backend server is not running at ${process.env.NEXT_PUBLIC_BACKEND_URL}.`
        );
      }

      return JSON.parse(text) as T;
    } catch (e) {
      if (e instanceof SyntaxError) throw e;
      // If cloning fails, fall back to original behavior
      return originalJson.call(this) as Promise<T>;
    }
  };
}