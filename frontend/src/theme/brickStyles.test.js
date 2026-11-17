import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BRICK_STYLES,
  BRICK_STYLE_STORAGE_KEY,
  DEFAULT_BRICK_STYLE,
  brickClass,
  isBrickStyle,
  loadBrickStyle,
  saveBrickStyle,
} from './brickStyles';

describe('stili dei mattoni', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stili disponibili: classico (predefinito), cubi di ghiaccio, legno, lava', () => {
    expect(BRICK_STYLES).toEqual(['classic', 'ice', 'wood', 'lava']);
    expect(DEFAULT_BRICK_STYLE).toBe('classic');
    expect(BRICK_STYLE_STORAGE_KEY).toBe('blocchi.brickStyle');
  });

  it('riconosce solo gli stili disponibili', () => {
    expect(isBrickStyle('classic')).toBe(true);
    expect(isBrickStyle('ice')).toBe(true);
    expect(isBrickStyle('wood')).toBe(true);
    expect(isBrickStyle('lava')).toBe(true);
    expect(isBrickStyle('stone')).toBe(false);
    expect(isBrickStyle(null)).toBe(false);
  });

  it('classe CSS dello stile', () => {
    expect(brickClass('classic')).toBe('bricks--classic');
    expect(brickClass('ice')).toBe('bricks--ice');
    expect(brickClass('wood')).toBe('bricks--wood');
    expect(brickClass('lava')).toBe('bricks--lava');
  });

  it('carica lo stile salvato; senza valore o con valore non valido usa il predefinito', () => {
    expect(loadBrickStyle()).toBe('classic');
    localStorage.setItem(BRICK_STYLE_STORAGE_KEY, 'wood');
    expect(loadBrickStyle()).toBe('wood');
    localStorage.setItem(BRICK_STYLE_STORAGE_KEY, 'marmo');
    expect(loadBrickStyle()).toBe('classic');
  });

  it('salva solo stili validi', () => {
    saveBrickStyle('wood');
    expect(localStorage.getItem(BRICK_STYLE_STORAGE_KEY)).toBe('wood');
    saveBrickStyle('marmo');
    expect(localStorage.getItem(BRICK_STYLE_STORAGE_KEY)).toBe('wood');
  });

  it('localStorage non disponibile: nessun errore, stile predefinito', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloccato');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloccato');
    });
    expect(loadBrickStyle()).toBe('classic');
    expect(() => saveBrickStyle('wood')).not.toThrow();
  });
});
