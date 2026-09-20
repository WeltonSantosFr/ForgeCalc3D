import { useLanguageStore } from '../store/useLanguageStore';
import type { Language } from '../types';

function getLocale(language?: Language): string {
  const lang = language ?? useLanguageStore.getState().language;
  return lang === 'en' ? 'en-US' : 'pt-BR';
}

/**
 * Formata um número para a moeda correspondente ao idioma (BRL para pt, USD para en)
 */
export function formatCurrency(value: number, language?: Language): string {
  const lang = language ?? useLanguageStore.getState().language;
  if (isNaN(value)) {
    return lang === 'en' ? '$ 0.00' : 'R$ 0,00';
  }

  return new Intl.NumberFormat(getLocale(lang), {
    style: 'currency',
    currency: lang === 'en' ? 'USD' : 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um número de gramas
 */
export function formatGrams(grams: number, language?: Language): string {
  if (isNaN(grams)) return '0 g';
  return `${grams.toLocaleString(getLocale(language), { maximumFractionDigits: 1 })} g`;
}

/**
 * Formata horas e minutos para visualização legível
 */
export function formatTime(hours: number, minutes: number): string {
  const h = Math.max(0, hours || 0);
  const m = Math.max(0, minutes || 0);
  if (h === 0 && m === 0) return '0 min';
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formata porcentagem
 */
export function formatPercent(value: number, language?: Language): string {
  if (isNaN(value)) return '0%';
  return `${value.toLocaleString(getLocale(language), { maximumFractionDigits: 1 })}%`;
}

/**
 * Formata número com casas decimais de acordo com o idioma
 */
export function formatNumber(value: number, decimals: number = 2, language?: Language): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString(getLocale(language), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
