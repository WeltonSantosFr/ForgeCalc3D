/**
 * Formata um número para Real Brasileiro (BRL)
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um número de gramas
 */
export function formatGrams(grams: number): string {
  if (isNaN(grams)) return '0 g';
  return `${grams.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} g`;
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
export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

/**
 * Formata número com 2 casas decimais
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
