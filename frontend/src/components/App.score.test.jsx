import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '../test/intl';
import { DROP_INTERVAL_MS } from '../game/config';
import { dropInterval } from '../game/levels';

// Partita preparata: ultima riga piena tranne le colonne 3..6, primo pezzo I orizzontale.
vi.mock('../game/engine', async (importOriginal) => {
  const engine = await importOriginal();
  return {
    ...engine,
    createGame: () => {
      const game = engine.createGame(() => 0.999); // sacchetto I, O, T, ...
      const board = game.board.map((row) => [...row]);
      board[board.length - 1] = board[0].map((_, c) => (c >= 3 && c <= 6 ? null : 'Z'));
      // 9 righe già fatte: completando la riga in fondo si passa al livello 2
      return { ...game, board, lines: globalThis.__initialLines ?? 0 };
    },
  };
});

const { default: App } = await import('./App');

const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const press = (key) => fireEvent.keyDown(window, { key });
const stat = (name) => screen.getByTestId(`stat-${name}`);

describe('App - punteggio e righe (fase 1.2.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
  });
  afterEach(() => vi.useRealTimers());

  it('la caduta veloce assegna 1 punto per riga scesa', () => {
    press('ArrowDown');
    press('ArrowDown');
    expect(stat('punteggio')).toHaveTextContent('2');
    expect(stat('righe')).toHaveTextContent('0');
  });

  it('la gravità non assegna punti', () => {
    advance(DROP_INTERVAL_MS * 3);
    expect(stat('punteggio')).toHaveTextContent('0');
  });

  it('completando la riga in fondo: riga eliminata, +100 punti più quelli di caduta', () => {
    // la I parte dalla riga 0 della griglia completa (nascosta) e arriva alla 21: 21 celle × 2
    press(' ');
    expect(stat('righe')).toHaveTextContent('1');
    expect(stat('punteggio')).toHaveTextContent('142');
    expect(stat('livello')).toHaveTextContent('1');

    const board = screen.getByRole('grid', { name: /campo di gioco/i });
    expect(board.querySelectorAll('[data-filled="true"]')).toHaveLength(0);
  });

  it('una nuova partita riparte da zero', () => {
    press(' ');
    advance(DROP_INTERVAL_MS * 2000); // fino al game over
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
    expect(stat('punteggio')).toHaveTextContent('0');
    expect(stat('righe')).toHaveTextContent('0');
  });
});

describe('App - livelli e fine partita (fase 1.2.4)', () => {
  const filledCount = () =>
    screen.getByRole('grid', { name: /campo di gioco/i }).querySelectorAll('[data-filled="true"]').length;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.__initialLines = 9;
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
  });
  afterEach(() => {
    delete globalThis.__initialLines;
    vi.useRealTimers();
  });

  it('alla decima riga il livello passa a 2', () => {
    press(' ');
    expect(stat('righe')).toHaveTextContent('10');
    expect(stat('livello')).toHaveTextContent('2');
  });

  it('al livello 2 i pezzi cadono più velocemente', () => {
    press(' ');
    expect(filledCount()).toBe(0); // riga eliminata, la O è ancora nella zona nascosta
    const faster = dropInterval(2);
    expect(faster).toBeLessThan(DROP_INTERVAL_MS);

    advance(faster); // con la velocità del livello 1 non sarebbe ancora scesa
    expect(filledCount()).toBe(2); // la O è scesa di una riga: metà visibile
  });

  it('a fine partita mostra il punteggio finale e i tasti non hanno più effetto', () => {
    press(' '); // 142 punti
    advance(DROP_INTERVAL_MS * 2000);
    const overlay = screen.getByText(/partita terminata/i);
    expect(overlay).toHaveTextContent('142');
    expect(stat('punteggio')).toHaveTextContent('142');

    const board = screen.getByRole('grid', { name: /campo di gioco/i }).innerHTML;
    ['ArrowLeft', ' ', 'ArrowUp', 'p'].forEach(press);
    expect(screen.getByRole('grid', { name: /campo di gioco/i }).innerHTML).toBe(board);
    expect(screen.queryByText(/in pausa/i)).not.toBeInTheDocument();
  });
});
