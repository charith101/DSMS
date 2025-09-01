import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock console.warn for tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings during tests
  if (
    args[0]?.includes?.('ReactDOMTestUtils.act') ||
    args[0]?.includes?.('Warning: ')
  ) {
    return;
  }
  originalWarn(...args);
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Global test utilities
global.testUtils = {
  // Helper to create mock user contexts
  createMockUser: (role = 'student', overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role,
    ...overrides
  }),

  // Helper to create mock payment data
  createMockPayment: (overrides = {}) => ({
    id: 1,
    amount: 500,
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    packageType: 'basic',
    paymentMethod: 'credit_card',
    ...overrides
  }),

  // Helper to create mock API responses
  createMockApiResponse: (data, status = 200) => ({
    status,
    data,
    headers: {},
    config: {},
    statusText: 'OK'
  }),

  // Helper to wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to suppress console errors in tests
  suppressConsoleError: (fn) => {
    const originalError = console.error;
    console.error = jest.fn();
    try {
      fn();
    } finally {
      console.error = originalError;
    }
  }
};

// Set up default test environment
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.clear.mockClear();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  
  sessionStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockReset();
  sessionStorageMock.setItem.mockReset();
  sessionStorageMock.removeItem.mockReset();
});

// Clean up after each test
afterEach(() => {
  // Clean up any side effects
  document.body.innerHTML = '';
  
  // Reset window location
  delete window.location;
  window.location = { pathname: '/', search: '', hash: '' };
});