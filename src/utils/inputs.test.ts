import { describe, it, expect } from 'vitest';
import { sanitizeNumericString, parseNumericInput, parseIntegerInput } from './inputs';

describe('Utilitários de Inputs Numéricos', () => {
  describe('sanitizeNumericString', () => {
    it('deve remover caracteres proibidos como e, E, *, ~, /', () => {
      expect(sanitizeNumericString('120e5')).toBe('1205');
      expect(sanitizeNumericString('85*')).toBe('85');
      expect(sanitizeNumericString('~100')).toBe('100');
      expect(sanitizeNumericString('12/4')).toBe('124');
      expect(sanitizeNumericString('abc123xyz')).toBe('123');
    });

    it('deve remover zeros redundantes à esquerda seguidos de dígitos (ex: 0120 -> 120)', () => {
      expect(sanitizeNumericString('0120')).toBe('120');
      expect(sanitizeNumericString('007')).toBe('7');
      expect(sanitizeNumericString('000')).toBe('0');
    });

    it('deve preservar o zero isolado e decimais válidos', () => {
      expect(sanitizeNumericString('0')).toBe('0');
      expect(sanitizeNumericString('0.5')).toBe('0.5');
      expect(sanitizeNumericString('0,85')).toBe('0.85');
      expect(sanitizeNumericString('0.00')).toBe('0.00');
    });

    it('deve converter vírgula para ponto e permitir apenas um ponto decimal', () => {
      expect(sanitizeNumericString('12,5')).toBe('12.5');
      expect(sanitizeNumericString('12.5.4')).toBe('12.54');
    });

    it('deve bloquear números negativos quando allowNegative for falso', () => {
      expect(sanitizeNumericString('-50', true, false)).toBe('50');
    });

    it('deve bloquear decimais quando allowDecimals for falso', () => {
      expect(sanitizeNumericString('12.5', false, false)).toBe('125');
    });
  });

  describe('parseNumericInput', () => {
    it('deve retornar string vazia para entradas vazias', () => {
      expect(parseNumericInput('')).toBe('');
      expect(parseNumericInput(undefined)).toBe('');
      expect(parseNumericInput(null)).toBe('');
      expect(parseNumericInput('-')).toBe('');
      expect(parseNumericInput('.')).toBe('');
    });

    it('deve permitir e preservar o número zero (0)', () => {
      expect(parseNumericInput('0')).toBe(0);
      expect(parseNumericInput(0)).toBe(0);
      expect(parseNumericInput('00')).toBe(0);
    });

    it('deve converter corretamente strings decimais e com vírgula', () => {
      expect(parseNumericInput('120')).toBe(120);
      expect(parseNumericInput('0120')).toBe(120);
      expect(parseNumericInput('12.5')).toBe(12.5);
      expect(parseNumericInput('12,5')).toBe(12.5);
      expect(parseNumericInput('0.85')).toBe(0.85);
    });

    it('deve ignorar caracteres especiais inválidos na conversão', () => {
      expect(parseNumericInput('120e')).toBe(120);
      expect(parseNumericInput('85*')).toBe(85);
      expect(parseNumericInput('~50')).toBe(50);
    });
  });

  describe('parseIntegerInput', () => {
    it('deve retornar string vazia para entradas vazias', () => {
      expect(parseIntegerInput('')).toBe('');
    });

    it('deve permitir e preservar o zero', () => {
      expect(parseIntegerInput('0')).toBe(0);
      expect(parseIntegerInput(0)).toBe(0);
    });

    it('deve truncar ou ignorar casas decimais para inteiros', () => {
      expect(parseIntegerInput('45')).toBe(45);
      expect(parseIntegerInput('0120')).toBe(120);
      expect(parseIntegerInput(15.9)).toBe(15);
    });
  });
});
