import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Setup mock window, document and localStorage for Node environment
const mockStorage: Record<string, string> = {};
const mockHtmlAttributes: Record<string, string> = {};

const mockDocumentElement = {
  setAttribute: (key: string, val: string) => {
    mockHtmlAttributes[key] = val;
  },
  getAttribute: (key: string) => mockHtmlAttributes[key] ?? null,
  lang: 'pt-BR',
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
});

vi.stubGlobal('window', {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

vi.mock('../db/db', () => ({
  db: {
    settings: {
      update: vi.fn().mockResolvedValue(1),
      get: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { useLanguageStore, detectDeviceLanguage } from './useLanguageStore';
import { getTranslation, translations } from '../i18n';

describe('useLanguageStore e i18n', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockDocumentElement.lang = 'pt-BR';
    useLanguageStore.setState({ languageMode: 'system', language: 'pt' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve ter modo system como padrão inicial e resolver idioma', () => {
    const state = useLanguageStore.getState();
    expect(state.languageMode).toBe('system');
  });

  it('deve detectar corretamente idioma pt quando dispositivo está em português', () => {
    vi.stubGlobal('navigator', {
      language: 'pt-BR',
      languages: ['pt-BR', 'pt'],
    });

    expect(detectDeviceLanguage()).toBe('pt');
  });

  it('deve detectar corretamente idioma en quando dispositivo está em inglês ou outro idioma', () => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['en-US', 'en'],
    });

    expect(detectDeviceLanguage()).toBe('en');

    vi.stubGlobal('navigator', {
      language: 'es-ES',
      languages: ['es-ES', 'es'],
    });

    expect(detectDeviceLanguage()).toBe('en');
  });

  it('deve alternar para inglês e persistir no localStorage', () => {
    useLanguageStore.getState().setLanguageMode('en');

    const state = useLanguageStore.getState();
    expect(state.languageMode).toBe('en');
    expect(state.language).toBe('en');
    expect(mockLocalStorage.getItem('forgecalc3d_language')).toBe('en');
    expect(mockDocumentElement.lang).toBe('en');
  });

  it('deve alternar para português e persistir no localStorage', () => {
    useLanguageStore.getState().setLanguageMode('en');
    useLanguageStore.getState().setLanguageMode('pt');

    const state = useLanguageStore.getState();
    expect(state.languageMode).toBe('pt');
    expect(state.language).toBe('pt');
    expect(mockLocalStorage.getItem('forgecalc3d_language')).toBe('pt');
    expect(mockDocumentElement.lang).toBe('pt-BR');
  });

  it('deve interpolar parâmetros na função getTranslation', () => {
    const textPt = getTranslation('filaments.deleteConfirmDesc', { name: 'PLA Silk' }, 'pt');
    expect(textPt).toContain('PLA Silk');

    const textEn = getTranslation('filaments.deleteConfirmDesc', { name: 'PLA Silk' }, 'en');
    expect(textEn).toContain('PLA Silk');
    expect(textEn).toContain('Are you sure');
  });

  it('deve ter 100% de paridade entre as chaves em português e inglês', () => {
    const ptKeys = Object.keys(translations.pt).sort();
    const enKeys = Object.keys(translations.en).sort();

    expect(ptKeys).toEqual(enKeys);
    expect(ptKeys.length).toBeGreaterThan(50);
  });
});
