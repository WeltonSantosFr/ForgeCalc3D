/**
 * Sanitiza uma string numérica removendo caracteres proibidos como 'e', '*', '~', etc.
 * Remove também zeros à esquerda desnecessários (ex: "0120" -> "120"),
 * mantendo o zero isolado ("0") e números decimais iniciados por zero ("0.5").
 */
export function sanitizeNumericString(
  value: string,
  allowDecimals: boolean = true,
  allowNegative: boolean = false
): string {
  if (!value) return '';

  // Substitui vírgula por ponto
  let sanitized = value.replace(/,/g, '.');

  // Remove caracteres que não sejam dígitos, ponto (se permitido) ou sinal de menos (se permitido)
  if (allowDecimals && allowNegative) {
    sanitized = sanitized.replace(/[^0-9.-]/g, '');
  } else if (allowDecimals) {
    sanitized = sanitized.replace(/[^0-9.]/g, '');
  } else if (allowNegative) {
    sanitized = sanitized.replace(/[^0-9-]/g, '');
  } else {
    sanitized = sanitized.replace(/[^0-9]/g, '');
  }

  // Garante apenas um sinal de menos e apenas no início
  if (allowNegative) {
    const isNegative = sanitized.startsWith('-');
    sanitized = sanitized.replace(/-/g, '');
    if (isNegative) {
      sanitized = '-' + sanitized;
    }
  }

  // Garante apenas um ponto decimal
  if (allowDecimals && sanitized.includes('.')) {
    const parts = sanitized.split('.');
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Remove zeros redundantes à esquerda seguidos de outro dígito (ex: "0120" -> "120", "-0120" -> "-120")
  // Não afeta "0" nem "0.5"
  sanitized = sanitized.replace(/^(-?)0+(?=\d)/, '$1');

  return sanitized;
}

/**
 * Converte valor de input para number ou '' (string vazia).
 * Permite que o usuário zere (0) ou esvazie ('') o campo sem que o valor seja forçado para fallback.
 */
export function parseNumericInput(value: string | number | undefined | null): number | '' {
  if (value === '' || value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'number') {
    return isNaN(value) ? '' : value;
  }

  const sanitized = sanitizeNumericString(value, true, true);
  if (sanitized === '' || sanitized === '-' || sanitized === '.') {
    return '';
  }

  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? '' : parsed;
}

/**
 * Converte valor de input para inteiro ou '' (string vazia).
 */
export function parseIntegerInput(value: string | number | undefined | null): number | '' {
  if (value === '' || value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'number') {
    return isNaN(value) ? '' : Math.trunc(value);
  }

  const sanitized = sanitizeNumericString(value, false, true);
  if (sanitized === '' || sanitized === '-') {
    return '';
  }

  const parsed = parseInt(sanitized, 10);
  return isNaN(parsed) ? '' : parsed;
}
