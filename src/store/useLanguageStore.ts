import { create } from 'zustand';
import type { Language, LanguageMode } from '../types';
import { db } from '../db/db';

interface LanguageState {
  languageMode: LanguageMode;
  language: Language;
  setLanguageMode: (mode: LanguageMode) => void;
  initLanguage: () => void;
}

const STORAGE_KEY = 'forgecalc3d_language';

/**
 * Detecta o idioma padrão do dispositivo (Android / Web).
 * Se o idioma do dispositivo começar com 'pt' (ex: 'pt-BR', 'pt-PT', 'pt'), retorna 'pt'.
 * Caso contrário, retorna 'en'.
 */
export function detectDeviceLanguage(): Language {
  if (typeof window === 'undefined' || !navigator) {
    return 'pt';
  }

  const candidateLanguages: string[] = [];

  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    candidateLanguages.push(...navigator.languages);
  }

  if (navigator.language) {
    candidateLanguages.push(navigator.language);
  }

  for (const lang of candidateLanguages) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    if (lower.startsWith('pt')) return 'pt';
    if (lower.startsWith('en')) return 'en';
  }

  // Fallback padrão se não for nem pt nem en: inglês
  const primary = (navigator.language || '').toLowerCase();
  return primary.startsWith('pt') ? 'pt' : 'en';
}

function resolveLanguage(mode: LanguageMode): Language {
  if (mode === 'system') {
    return detectDeviceLanguage();
  }
  return mode;
}

function applyLanguageToDom(lang: Language): void {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  languageMode: 'system',
  language: 'pt',

  setLanguageMode: (mode: LanguageMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignora erro se localStorage não estiver disponível
    }

    const resolved = resolveLanguage(mode);
    applyLanguageToDom(resolved);
    set({ languageMode: mode, language: resolved });

    // Sincroniza assincronamente com o IndexedDB Dexie
    db.settings.update(1, {
      language: mode,
      updatedAt: new Date().toISOString(),
    }).catch(() => {
      // Falha silenciosa se tabela de settings ainda não estiver pronta
    });
  },

  initLanguage: () => {
    let savedMode: LanguageMode = 'system';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageMode | null;
      if (stored === 'system' || stored === 'pt' || stored === 'en') {
        savedMode = stored;
      }
    } catch {
      savedMode = 'system';
    }

    const resolved = resolveLanguage(savedMode);
    applyLanguageToDom(resolved);
    set({ languageMode: savedMode, language: resolved });

    // Escuta alterações de idioma no dispositivo quando em modo 'system'
    if (typeof window !== 'undefined') {
      const handleLanguageChange = () => {
        if (get().languageMode === 'system') {
          const newResolved = detectDeviceLanguage();
          applyLanguageToDom(newResolved);
          set({ language: newResolved });
        }
      };

      window.removeEventListener('languagechange', handleLanguageChange);
      window.addEventListener('languagechange', handleLanguageChange);
    }

    // Carrega do Dexie caso o localStorage esteja vazio
    db.settings.get(1).then((settings) => {
      if (settings?.language && !localStorage.getItem(STORAGE_KEY)) {
        get().setLanguageMode(settings.language);
      }
    }).catch(() => {});
  },
}));
