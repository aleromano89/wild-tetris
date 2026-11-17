import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '../test/intl';
import App from './App';
import ScorePage from './ScorePage';
import SaveScoreForm from './SaveScoreForm';
import { GAME_TITLE } from '../meta';

// Tutte le etichette passano da react-intl: renderizzando in spagnolo non resta testo italiano.
describe('etichette tradotte (react-intl)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('pagina di gioco in spagnolo', () => {
    render(<App />, { locale: 'es' });

    expect(screen.getByRole('button', { name: 'Empezar partida' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'Campo de juego' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'Siguiente pieza' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clasificación' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Panel de juego' })).toBeInTheDocument();

    const bar = screen.getByRole('region', { name: 'Estadísticas de la partida' });
    expect(within(bar).getByText('Puntuación')).toBeInTheDocument();
    expect(within(bar).getByText('Líneas')).toBeInTheDocument();
    expect(within(bar).getByText('Nivel')).toBeInTheDocument();

    const pad = screen.getByRole('group', { name: 'Controles de juego' });
    expect(within(pad).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Mover a la izquierda',
      'Bajar',
      'Mover a la derecha',
      'Girar',
      'Caída instantánea',
    ]);

    expect(screen.getByText('caída rápida')).toBeInTheDocument();
    expect(screen.getByText('Espacio')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Vamos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pausa' }));
    expect(screen.getByText('En pausa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reanudar' })).toBeInTheDocument();
  });

  it('nessun testo italiano residuo nella pagina di gioco in spagnolo', () => {
    const { container } = render(<App />, { locale: 'es' });
    const text = container.textContent;
    const labels = [...container.querySelectorAll('[aria-label]')].map((el) => el.getAttribute('aria-label'));
    for (const word of ['Avvia', 'Prossimo', 'Punteggio', 'Righe', 'Livello', 'Comandi', 'sposta', 'Spazio', 'Classifica']) {
      expect(text, word).not.toContain(word);
    }
    for (const word of ['Campo di gioco', 'Sposta', 'Ruota', 'Statistiche', 'Pannello']) {
      labels.forEach((l) => expect(l, word).not.toContain(word));
    }
  });

  it('fine partita e salvataggio in spagnolo', () => {
    render(<SaveScoreForm score={10} lines={0} level={1} />, { locale: 'es' });
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('pagina classifica in spagnolo', async () => {
    vi.useRealTimers();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    render(<ScorePage />, { locale: 'es' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(`${GAME_TITLE} · Clasificación`);
    expect(screen.getByRole('link', { name: 'Volver al juego' })).toBeInTheDocument();
    expect(await screen.findByText('Todavía no hay puntuaciones registradas.')).toBeInTheDocument();
    await act(async () => {});
  });

  it('server non raggiungibile: messaggio tradotto', async () => {
    vi.useRealTimers();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ScorePage />, { locale: 'es' });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cargar la clasificación: Servidor no disponible'
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
