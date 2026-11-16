import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '../test/intl';
import App from './App';
import { DROP_INTERVAL_MS } from '../game/config';

// Math.random → 0.999: il sacchetto resta nell'ordine I, O, T, ... (primo pezzo: I orizzontale)
const filledIndexes = () =>
  within(screen.getByRole('grid', { name: /campo di gioco/i }))
    .getAllByRole('gridcell')
    .map((c, i) => (c.dataset.filled === 'true' ? i : -1))
    .filter((i) => i >= 0);
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const press = (key) => fireEvent.keyDown(window, { key });

/** Avvia e lascia scendere la I finché è tutta visibile: riga 1, colonne 3..6. */
function startWithVisibleI() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
  advance(DROP_INTERVAL_MS * 3);
  expect(filledIndexes()).toEqual([13, 14, 15, 16]);
}

describe('App - comandi da tastiera (fase 1.2.2)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('← e → spostano il pezzo di una colonna', () => {
    startWithVisibleI();
    press('ArrowLeft');
    expect(filledIndexes()).toEqual([12, 13, 14, 15]);
    press('ArrowRight');
    press('ArrowRight');
    expect(filledIndexes()).toEqual([14, 15, 16, 17]);
  });

  it('il pezzo non esce dai bordi', () => {
    startWithVisibleI();
    for (let i = 0; i < 10; i++) press('ArrowLeft');
    expect(filledIndexes()).toEqual([10, 11, 12, 13]);
    for (let i = 0; i < 10; i++) press('ArrowRight');
    expect(filledIndexes()).toEqual([16, 17, 18, 19]);
  });

  it('↑ e X ruotano in senso orario', () => {
    startWithVisibleI();
    press('ArrowUp');
    expect(filledIndexes()).toEqual([5, 15, 25, 35]);
    press('x');
    expect(filledIndexes()).toEqual([23, 24, 25, 26]); // I ruotata di 180°: orizzontale una riga più in basso
  });

  it('Z ruota in senso antiorario', () => {
    startWithVisibleI();
    press('z');
    expect(filledIndexes()).toEqual([4, 14, 24, 34]);
  });

  it('↓ fa scendere il pezzo subito di una riga', () => {
    startWithVisibleI();
    press('ArrowDown');
    expect(filledIndexes()).toEqual([23, 24, 25, 26]);
  });

  it('Spazio fa cadere il pezzo fino in fondo e lo fissa', () => {
    startWithVisibleI();
    press(' ');
    // la I è sull'ultima riga; il pezzo successivo (O) è ancora nella zona nascosta
    expect(filledIndexes()).toEqual([193, 194, 195, 196]);
    advance(DROP_INTERVAL_MS * 3);
    expect(filledIndexes()).toHaveLength(8);
  });

  it('P ed Esc mettono in pausa e riprendono; in pausa i comandi sono ignorati', () => {
    startWithVisibleI();
    press('p');
    expect(screen.getByText(/in pausa/i)).toBeInTheDocument();
    press('ArrowLeft');
    press(' ');
    expect(filledIndexes()).toEqual([13, 14, 15, 16]);

    press('P');
    expect(screen.queryByText(/in pausa/i)).not.toBeInTheDocument();
    press('Escape');
    expect(screen.getByText(/in pausa/i)).toBeInTheDocument();
    press('Escape');
    expect(screen.queryByText(/in pausa/i)).not.toBeInTheDocument();
  });

  it('prima di Avvia i tasti non hanno effetto', () => {
    render(<App />);
    ['ArrowLeft', 'ArrowDown', ' ', 'p'].forEach(press);
    expect(filledIndexes()).toEqual([]);
    expect(screen.queryByText(/in pausa/i)).not.toBeInTheDocument();
  });

  it('durante la partita frecce e Spazio non fanno scorrere la pagina', () => {
    startWithVisibleI();
    ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].forEach((key) => {
      expect(fireEvent.keyDown(window, { key })).toBe(false); // preventDefault chiamato
    });
  });
});
