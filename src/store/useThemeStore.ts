import { create } from 'zustand';
import type { ThemeMode } from '../types';
import { db } from '../db/db';

interface ThemeState {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'forgecalc3d_theme';

function applyThemeToDom(mode: ThemeMode): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  let isDark = false;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // Atualiza meta theme-color para navegadores e Capacitor
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#090D16' : '#FFFFFF');
  }

  return isDark ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'light',
  resolvedTheme: 'light',

  setTheme: (mode: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignora erro de localStorage caso indisponível
    }

    const resolved = applyThemeToDom(mode);
    set({ themeMode: mode, resolvedTheme: resolved });

    // Sincroniza assincronamente com o banco Dexie
    db.settings.update(1, {
      theme: mode,
      updatedAt: new Date().toISOString(),
    }).catch(() => {
      // Falha silenciosa se o banco ainda não estiver pronto
    });
  },

  initTheme: () => {
    let savedMode: ThemeMode = 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        savedMode = stored;
      }
    } catch {
      savedMode = 'light';
    }

    const resolved = applyThemeToDom(savedMode);
    set({ themeMode: savedMode, resolvedTheme: resolved });

    // Escuta mudanças de tema no sistema operacional quando em modo 'system'
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (get().themeMode === 'system') {
          const newResolved = applyThemeToDom('system');
          set({ resolvedTheme: newResolved });
        }
      };

      mediaQuery.removeEventListener('change', listener);
      mediaQuery.addEventListener('change', listener);
    }

    // Carrega do Dexie caso o localStorage esteja vazio
    db.settings.get(1).then((settings) => {
      if (settings?.theme && !localStorage.getItem(STORAGE_KEY)) {
        get().setTheme(settings.theme);
      }
    }).catch(() => {});
  },
}));
