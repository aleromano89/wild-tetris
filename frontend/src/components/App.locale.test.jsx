import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '../test/intl';
import App from './App';
import ScorePage from './ScorePage';
import { LOCALE_STORAGE_KEY } from '../i18n/I18nProvider';

// Pulsante per cambiare lingua nella barra in alto (it ↔ es), scelta ricordata nel browser.
const switcher = () => within(screen.getByRole('banner')).getByRole('button', { name: /passa a|cambiar a/i });

describe('Switch lingua', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    vi.restoreAllMocks();
  });

  it('di default italiano, con il pulsante per passare allo spagnolo', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Avvia' })).toBeInTheDocument();
    expect(switcher()).toHaveAccessibleName('Passa a Español');
    expect(switcher()).toHaveTextContent('ES');
    expect(document.documentElement.lang).toBe('it');
  });

  it('cliccando passa allo spagnolo, aggiorna lang e ricorda la scelta; cliccando di nuovo torna all\'italiano', () => {
    render(<App />);
    fireEvent.click(switcher());
    expect(screen.getByRole('button', { name: 'Vamos' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Avvia' })).toBeNull();
    expect(switcher()).toHaveAccessibleName('Cambiar a Italiano');
    expect(switcher()).toHaveTextContent('IT');
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es');

    fireEvent.click(switcher());
    expect(screen.getByRole('button', { name: 'Avvia' })).toBeInTheDocument();
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('it');
  });

  it('all\'apertura usa la lingua salvata; ignora valori non validi', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es');
    const { unmount } = render(<App />);
    expect(screen.getByRole('button', { name: 'Vamos' })).toBeInTheDocument();
    unmount();

    localStorage.setItem(LOCALE_STORAGE_KEY, 'xx');
    render(<App />);
    expect(screen.getByRole('button', { name: 'Avvia' })).toBeInTheDocument();
  });

  it('il cambio lingua non interrompe la partita in corso', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));
    fireEvent.click(switcher());
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeEnabled();
    vi.useRealTimers();
  });

  it('anche la pagina classifica ha il pulsante', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    render(<ScorePage />);
    fireEvent.click(switcher());
    expect(screen.getByRole('link', { name: 'Volver al juego' })).toBeInTheDocument();
  });
});
