class MemoryStore {
  private cache = new Map<string, string>();
  get(k: string): string | null { return this.cache.get(k) || null; }
  set(k: string, v: string): void { this.cache.set(k, v); }
  remove(k: string): void { this.cache.delete(k); }
}

const memory = new MemoryStore();

function isAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "__plantify_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const plantStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const ok = isAvailable();
      const raw = ok ? window.localStorage.getItem(key) : memory.get(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const val = JSON.stringify(value);
      if (isAvailable()) {
        window.localStorage.setItem(key, val);
      } else {
        memory.set(key, val);
      }
    } catch (e) {
      console.warn(`[plantStorage] Error writing ${key}:`, e);
    }
  },

  remove(key: string): void {
    try {
      if (isAvailable()) {
        window.localStorage.removeItem(key);
      } else {
        memory.remove(key);
      }
    } catch (e) {
      console.warn(`[plantStorage] Error removing ${key}:`, e);
    }
  },
};
