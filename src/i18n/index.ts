import { useLanguageStore } from '../store/useLanguageStore';
import { pt } from './translations/pt';
import { en } from './translations/en';
import type { TranslationKey, Language, LanguageMode } from './types';

export const translations = { pt, en };

export type { TranslationKey, Language, LanguageMode };

/**
 * Função utilitária para tradução com suporte a interpolação de parâmetros ({key})
 */
export function getTranslation(
  key: TranslationKey,
  params?: Record<string, string | number>,
  lang: Language = useLanguageStore.getState().language
): string {
  const dict = translations[lang] || translations.pt;
  let text = dict[key] ?? translations.pt[key] ?? key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
  }

  return text;
}

/**
 * Hook do React para acesso às traduções no componente
 */
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const languageMode = useLanguageStore((state) => state.languageMode);
  const setLanguageMode = useLanguageStore((state) => state.setLanguageMode);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return getTranslation(key, params, language);
  };

  return {
    t,
    language,
    languageMode,
    setLanguageMode,
  };
}
