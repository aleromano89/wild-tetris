import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '../test/intl';
import App from './App';

// Versione mobile: Avvia dentro l'overlay della griglia, Pausa come icona nella barra in alto.
const board = () => screen.getByRole('grid', { name: /campo di gioco/i }).parentElement;
const topbar = () => screen.getByRole('banner');
const overlayStart = () => within(board()).queryByRole('button', { name: 'Inizia partita' });
const topPause = () => within(topbar()).queryByRole('button', { name: /metti in pausa|riprendi la partita/i });

describe('App - Avvia e Pausa sempre raggiungibili (mobile)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("in stato iniziale l'overlay della griglia contiene il pulsante che avvia la partita", () => {
    render(<App />);
    expect(overlayStart()).toBeEnabled();
    fireEvent.click(overlayStart());
    expect(overlayStart()).toBeNull();
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeEnabled();
  });

  it('la pausa nella barra in alto compare solo a partita avviata e alterna pausa / ripresa', () => {
    render(<App />);
    expect(topPause()).toBeNull();

    fireEvent.click(overlayStart());
    expect(topPause()).toHaveAccessibleName('Metti in pausa');

    fireEvent.click(topPause());
    expect(screen.getByText(/in pausa/i)).toBeInTheDocument();
    expect(topPause()).toHaveAccessibleName('Riprendi la partita');

    fireEvent.click(topPause());
    expect(screen.queryByText(/in pausa/i)).toBeNull();
    expect(topPause()).toHaveAccessibleName('Metti in pausa');
  });

  it('a fine partita la pausa nella barra in alto sparisce', () => {
    render(<App />);
    fireEvent.click(overlayStart());
    for (let i = 0; i < 40 && !screen.queryByText(/partita terminata/i); i++) {
      fireEvent.keyDown(window, { key: ' ' });
      act(() => vi.advanceTimersByTime(0));
    }
    expect(screen.getByText(/partita terminata/i)).toBeInTheDocument();
    expect(topPause()).toBeNull();
  });
});
