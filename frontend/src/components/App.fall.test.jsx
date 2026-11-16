import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { DROP_INTERVAL_MS } from '../game/config';

const boardCells = () =>
  within(screen.getByRole('grid', { name: /campo di gioco/i })).getAllByRole('gridcell');
const filled = (cells) => cells.filter((c) => c.dataset.filled === 'true');
const snapshot = () => boardCells().map((c) => c.className).join('|');
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const start = () => fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));

describe('App - discesa automatica dei pezzi (fase 1.2.1)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('prima di Avvia non cade nulla', () => {
    render(<App />);
    advance(DROP_INTERVAL_MS * 10);
    expect(filled(boardCells())).toHaveLength(0);
  });

  it("dopo Avvia l'anteprima mostra il prossimo pezzo", () => {
    render(<App />);
    start();
    const preview = screen.getByRole('grid', { name: /prossimo pezzo/i });
    expect(filled(within(preview).getAllByRole('gridcell'))).toHaveLength(4);
  });

  it('dopo Avvia il pezzo compare e scende a ogni intervallo', () => {
    render(<App />);
    start();
    advance(DROP_INTERVAL_MS * 3);
    expect(filled(boardCells())).toHaveLength(4);

    const before = snapshot();
    advance(DROP_INTERVAL_MS);
    expect(snapshot()).not.toBe(before);
  });

  it('i pezzi arrivati sul fondo restano fissati', () => {
    render(<App />);
    start();
    advance(DROP_INTERVAL_MS * 30);
    const cells = boardCells();
    const lastRow = cells.slice(190);
    expect(filled(lastRow).length).toBeGreaterThan(0);
    expect(filled(cells).length).toBeGreaterThan(4);
  });

  it('in pausa i pezzi non si muovono, con Riprendi ripartono', () => {
    render(<App />);
    start();
    advance(DROP_INTERVAL_MS * 3);
    fireEvent.click(screen.getByRole('button', { name: 'Pausa' }));

    const paused = snapshot();
    advance(DROP_INTERVAL_MS * 5);
    expect(snapshot()).toBe(paused);

    fireEvent.click(screen.getByRole('button', { name: 'Riprendi' }));
    advance(DROP_INTERVAL_MS);
    expect(snapshot()).not.toBe(paused);
  });

  it('a griglia piena la partita termina e si può ricominciare', () => {
    render(<App />);
    start();
    advance(DROP_INTERVAL_MS * 2000);
    expect(screen.getByText(/partita terminata/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeDisabled();

    const ended = snapshot();
    advance(DROP_INTERVAL_MS * 5);
    expect(snapshot()).toBe(ended);

    start();
    expect(screen.queryByText(/partita terminata/i)).not.toBeInTheDocument();
    expect(filled(boardCells()).length).toBeLessThanOrEqual(4);
  });
});
