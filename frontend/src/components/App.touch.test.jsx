import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { DROP_INTERVAL_MS } from '../game/config';

// Versione mobile: pulsantiera di gioco e barra statistiche compatta.
// Math.random → 0.999: il primo pezzo è la I orizzontale (come in App.keys.test.jsx).
const filledIndexes = () =>
  within(screen.getByRole('grid', { name: /campo di gioco/i }))
    .getAllByRole('gridcell')
    .map((c, i) => (c.dataset.filled === 'true' ? i : -1))
    .filter((i) => i >= 0);
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const pad = () => screen.getByRole('group', { name: 'Comandi di gioco' });
const padButton = (name) => within(pad()).getByRole('button', { name });
/** Tocco su un pulsante: l'azione parte al pointerdown, il click successivo (detail ≥ 1) è ignorato. */
const tap = (name) => {
  const btn = padButton(name);
  fireEvent.pointerDown(btn);
  fireEvent.click(btn, { detail: 1 });
};

const PAD_BUTTONS = ['Sposta a sinistra', 'Scendi', 'Sposta a destra', 'Ruota', 'Caduta istantanea'];

function startWithVisibleI() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
  advance(DROP_INTERVAL_MS * 3);
  expect(filledIndexes()).toEqual([13, 14, 15, 16]);
}

describe('App - pulsantiera di gioco (mobile)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ha i 5 pulsanti, disattivati prima dell\'avvio', () => {
    render(<App />);
    const buttons = within(pad()).getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(PAD_BUTTONS);
    buttons.forEach((b) => expect(b).toBeDisabled());
  });

  it('i pulsanti sono attivi durante la partita e disattivati in pausa', () => {
    startWithVisibleI();
    PAD_BUTTONS.forEach((name) => expect(padButton(name)).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: 'Pausa' }));
    PAD_BUTTONS.forEach((name) => expect(padButton(name)).toBeDisabled());
  });

  it('sinistra e destra spostano il pezzo di una colonna', () => {
    startWithVisibleI();
    tap('Sposta a sinistra');
    expect(filledIndexes()).toEqual([12, 13, 14, 15]);
    tap('Sposta a destra');
    tap('Sposta a destra');
    expect(filledIndexes()).toEqual([14, 15, 16, 17]);
  });

  it('Ruota gira il pezzo in senso orario', () => {
    startWithVisibleI();
    tap('Ruota');
    expect(filledIndexes()).toEqual([5, 15, 25, 35]);
  });

  it('Scendi fa scendere il pezzo di una riga (+1 punto)', () => {
    startWithVisibleI();
    tap('Scendi');
    expect(filledIndexes()).toEqual([23, 24, 25, 26]);
    expect(screen.getByTestId('bar-punteggio')).toHaveTextContent('1');
  });

  it('Caduta istantanea porta il pezzo in fondo', () => {
    startWithVisibleI();
    tap('Caduta istantanea');
    expect(filledIndexes()).toEqual([193, 194, 195, 196]);
  });

  it('attivazione da tastiera (Invio/Spazio sul pulsante: click senza pointerdown) esegue l\'azione una volta', () => {
    startWithVisibleI();
    fireEvent.click(padButton('Sposta a sinistra'), { detail: 0 });
    expect(filledIndexes()).toEqual([12, 13, 14, 15]);
  });

  it('un tocco esegue l\'azione una sola volta anche se il click che segue ha detail 0', () => {
    startWithVisibleI();
    const btn = padButton('Sposta a sinistra');
    fireEvent.pointerDown(btn);
    fireEvent.click(btn, { detail: 0 });
    expect(filledIndexes()).toEqual([12, 13, 14, 15]);
    // il tocco successivo funziona di nuovo
    fireEvent.pointerDown(btn);
    fireEvent.click(btn, { detail: 0 });
    expect(filledIndexes()).toEqual([11, 12, 13, 14]);
  });
});

describe('App - barra statistiche compatta (mobile)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('mostra punteggio, righe e livello iniziali', () => {
    render(<App />);
    const bar = screen.getByRole('region', { name: 'Statistiche partita' });
    expect(within(bar).getByTestId('bar-punteggio')).toHaveTextContent('0');
    expect(within(bar).getByTestId('bar-righe')).toHaveTextContent('0');
    expect(within(bar).getByTestId('bar-livello')).toHaveTextContent('1');
  });

  it('si aggiorna insieme al pannello laterale', () => {
    startWithVisibleI();
    tap('Caduta istantanea'); // 17 righe di caduta → 34 punti
    expect(screen.getByTestId('bar-punteggio')).toHaveTextContent(
      screen.getByTestId('stat-punteggio').textContent
    );
    expect(screen.getByTestId('bar-punteggio')).not.toHaveTextContent(/^0$/);
  });
});
