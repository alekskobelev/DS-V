import '@testing-library/jest-dom/vitest';
import '@testing-library/jest-dom';
class IntersectionObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserver });
Object.defineProperty(global, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserver });
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
window.scrollTo = () => {};
global.fetch = () => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(""),
  headers: new Headers(),
  ok: true
} as any);
