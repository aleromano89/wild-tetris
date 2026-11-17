import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '../test/intl';
import App from './App';

// Contatore del tempo di gioco: avanza solo a partita in corso.
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const time = () => screen.getByTestId('stat-tempo');
const barTime = () => screen.getByTestId('bar-tempo');
const start = () => fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
const togglePause = () => fireEvent.keyDown(window, { key: 'p' });

describe('App - contatore tempo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('prima della partita è a 0:00, con etichetta «Tempo» nel pannello e nella barra', () => {
    render(<App />);
    expect(time()).toHaveTextContent('0:00');
    expect(barTime()).toHaveTextContent('0:00');
    expect(screen.getAllByText('Tempo')).toHaveLength(2);
    advance(5000);
    expect(time()).toHaveTextContent('0:00');
  });

  it('avanza durante la partita', () => {
    render(<App />);
    start();
    advance(5000);
    expect(time()).toHaveTextContent('0:05');
    expect(barTime()).toHaveTextContent('0:05');
  });

  it('in pausa si ferma e alla ripresa continua da dove era', () => {
    render(<App />);
    start();
    advance(3000);
    togglePause();
    advance(10_000);
    expect(time()).toHaveTextContent('0:03');
    togglePause();
    advance(2000);
    expect(time()).toHaveTextContent('0:05');
  });

  it('a fine partita si ferma; una nuova partita riparte da 0:00', () => {
    render(<App />);
    start();
    advance(2000);
    for (let i = 0; i < 40 && !screen.queryByText(/partita terminata/i); i++) {
      fireEvent.keyDown(window, { key: ' ' });
    }
    expect(screen.getByText(/partita terminata/i)).toBeInTheDocument();
    const final = time().textContent;
    expect(final).toBe('0:02');
    advance(10_000);
    expect(time()).toHaveTextContent(final);

    start();
    expect(time()).toHaveTextContent('0:00');
  });
});
