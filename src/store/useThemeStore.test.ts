import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Setup mock window, document and localStorage for Node environment
const mockStorage: Record<string, string> = {};
const classList = new Set<string>();
const documentStyle: Record<string, string> = {};

const mockMetaTheme = {
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
};

const mockDocumentElement = {
  classList: {
    add: (cls: string) => classList.add(cls),
    remove: (cls: string) => classList.delete(cls),
    contains: (cls: string) => classList.has(cls),
  },
  style: documentStyle,
};

const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

// Configura globais
vi.stubGlobal('localStorage', mockLocalStorage);
vi.stubGlobal('document', {
  documentElement: mockDocumentElement,
  querySelector: (sel: string) => (sel.includes('theme-color') ? mockMetaTheme : null),
});
vi.stubGlobal('window', {
  matchMedia: vi.fn().mockReturnValue({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
});
vi.mock('../db/db', () => ({
  db: {
    settings: {
      update: vi.fn().mockResolvedValue(1),
      get: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    classList.clear();
    Object.keys(documentStyle).forEach((k) => delete documentStyle[k]);
    useThemeStore.setState({ themeMode: 'light', resolvedTheme: 'light' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve ter modo claro como padrão inicial', () => {
    const state = useThemeStore.getState();
    expect(state.themeMode).toBe('light');
    expect(state.resolvedTheme).toBe('light');
  });

  it('deve alternar para modo escuro e aplicar classe .dark e color-scheme', () => {
    useThemeStore.getState().setTheme('dark');

    const state = useThemeStore.getState();
    expect(state.themeMode).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
    expect(mockDocumentElement.classList.contains('dark')).toBe(true);
    expect(documentStyle.colorScheme).toBe('dark');
    expect(mockLocalStorage.getItem('forgecalc3d_theme')).toBe('dark');
    expect(mockMetaTheme.setAttribute).toHaveBeenCalledWith('content', '#090D16');
  });

  it('deve alternar para modo claro e remover classe .dark', () => {
    useThemeStore.getState().setTheme('dark');
    expect(mockDocumentElement.classList.contains('dark')).toBe(true);

    useThemeStore.getState().setTheme('light');
    const state = useThemeStore.getState();
    expect(state.themeMode).toBe('light');
    expect(state.resolvedTheme).toBe('light');
    expect(mockDocumentElement.classList.contains('dark')).toBe(false);
    expect(documentStyle.colorScheme).toBe('light');
    expect(mockLocalStorage.getItem('forgecalc3d_theme')).toBe('light');
    expect(mockMetaTheme.setAttribute).toHaveBeenCalledWith('content', '#FFFFFF');
  });

  it('deve resolver modo system baseado no matchMedia prefers-color-scheme: dark', () => {
    (window.matchMedia as unknown as ReturnType<typeof vi.fn>).mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    useThemeStore.getState().setTheme('system');
    const state = useThemeStore.getState();
    expect(state.themeMode).toBe('system');
    expect(state.resolvedTheme).toBe('dark');
    expect(mockDocumentElement.classList.contains('dark')).toBe(true);
  });
});
