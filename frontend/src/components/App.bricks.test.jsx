import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '../test/intl';
import App from './App';
import { BRICK_STYLE_STORAGE_KEY } from '../theme/brickStyles';

// Scelta dello stile dei mattoni nella sezione configurazione del pannello di gioco.
const board = () => screen.getByRole('grid', { name: /campo di gioco/i });
const preview = () => screen.getByRole('grid', { name: /prossimo pezzo/i });
const picker = () =>
  within(screen.getByRole('complementary', { name: /pannello di gioco/i })).getByRole('radiogroup', {
    name: 'Stile mattoni',
  });

describe('Stile dei mattoni', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('di default stile classico su campo e anteprima', () => {
    render(<App />);
    expect(within(picker()).getByRole('radio', { name: 'Classico' })).toBeChecked();
    expect(board()).toHaveClass('bricks--classic');
    expect(preview()).toHaveClass('bricks--classic');
  });

  it('scegliendo uno stile cambia la grafica dei mattoni e la scelta viene ricordata', () => {
    render(<App />);
    fireEvent.click(within(picker()).getByRole('radio', { name: 'Legno' }));
    expect(board()).toHaveClass('bricks--wood');
    expect(board()).not.toHaveClass('bricks--classic');
    expect(preview()).toHaveClass('bricks--wood');
    expect(localStorage.getItem(BRICK_STYLE_STORAGE_KEY)).toBe('wood');

    fireEvent.click(within(picker()).getByRole('radio', { name: 'Cubi di ghiaccio' }));
    expect(board()).toHaveClass('bricks--ice');
    expect(localStorage.getItem(BRICK_STYLE_STORAGE_KEY)).toBe('ice');

    fireEvent.click(within(picker()).getByRole('radio', { name: 'Lava incandescente' }));
    expect(board()).toHaveClass('bricks--lava');
    expect(preview()).toHaveClass('bricks--lava');
    expect(localStorage.getItem(BRICK_STYLE_STORAGE_KEY)).toBe('lava');
  });

  it('all\'apertura usa lo stile salvato', () => {
    localStorage.setItem(BRICK_STYLE_STORAGE_KEY, 'ice');
    render(<App />);
    expect(board()).toHaveClass('bricks--ice');
    expect(within(picker()).getByRole('radio', { name: 'Cubi di ghiaccio' })).toBeChecked();
  });

  it('durante la partita la scelta è bloccata; in pausa si può cambiare', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
    within(picker()).getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());

    fireEvent.click(screen.getByRole('button', { name: 'Pausa' }));
    const wood = within(picker()).getByRole('radio', { name: 'Legno' });
    expect(wood).toBeEnabled();
    fireEvent.click(wood);
    expect(board()).toHaveClass('bricks--wood');
  });
});
