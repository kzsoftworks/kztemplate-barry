import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}))

// Mock next/headers since it's server-side only
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}))

// Mock FormData for tests
global.FormData = class FormData {
  private data: Record<string, string> = {}
  append(key: string, value: string) {
    this.data[key] = value
  }
  get(key: string) {
    return this.data[key]
  }
}

// Suppress console errors during tests
global.console.error = jest.fn()
