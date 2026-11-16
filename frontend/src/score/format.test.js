import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber } from './format';

describe('formattazione classifica', () => {
  it('formatDate: data MariaDB "AAAA-MM-GG hh:mm:ss" → "GG/MM/AAAA"', () => {
    expect(formatDate('2026-11-04 18:24:08')).toBe('04/11/2026');
  });

  it('formatDate: valore non riconosciuto → stringa vuota', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('ieri')).toBe('');
  });

  it('formatNumber: separatore delle migliaia italiano', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(0)).toBe('0');
  });
});
