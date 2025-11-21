// Polyfill for localStorage in Node.js environment (SSR)
if (typeof window === 'undefined') {
  // Create a mock localStorage for server-side rendering
  const storage: Record<string, string> = {};

  const mockStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    key: (index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    },
    length: 0,
  };

  Object.defineProperty(mockStorage, 'length', {
    get: () => Object.keys(storage).length,
  });

  (globalThis as any).localStorage = mockStorage;
  (globalThis as any).sessionStorage = mockStorage;
}
