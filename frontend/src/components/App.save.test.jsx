import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '../test/intl';
import { DROP_INTERVAL_MS } from '../game/config';

// Fase 1.3: a fine partita compare il modulo per salvare il punteggio.
vi.mock('../api/scores', async (importOriginal) => ({ ...(await importOriginal()), submitScore: vi.fn() }));
const { default: App } = await import('./App');

const toGameOver = () => act(() => vi.advanceTimersByTime(DROP_INTERVAL_MS * 2000));
const nameInput = () => screen.queryByRole('textbox', { name: /nome/i });

describe('App - salvataggio punteggio (fase 1.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(<App />);
  });
  afterEach(() => vi.useRealTimers());

  it('il modulo non c\'è prima e durante la partita', () => {
    expect(nameInput()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
    expect(nameInput()).not.toBeInTheDocument();
  });

  it('a fine partita compare il modulo; una nuova partita lo nasconde', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
    toGameOver();
    expect(screen.getByText(/partita terminata/i)).toBeInTheDocument();
    expect(nameInput()).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
    expect(nameInput()).not.toBeInTheDocument();
  });
});
