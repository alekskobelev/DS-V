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
const defaultHeaders = new Headers({ 'content-type': 'application/json' });
global.fetch = () => Promise.resolve({
  json: () => Promise.resolve({ success: true, data: [] }),
  text: () => Promise.resolve('{"success":true,"data":[]}'),
  headers: defaultHeaders,
  ok: true
} as any);
