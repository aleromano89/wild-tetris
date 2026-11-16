import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../api/scores';

vi.mock('../api/scores', async (importOriginal) => ({ ...(await importOriginal()), fetchTopScores: vi.fn() }));
const { fetchTopScores } = await import('../api/scores');
const { default: ScorePage } = await import('./ScorePage');

const rows = Array.from({ length: 10 }, (_, i) => ({
  player_name: `Giocatore ${i + 1}`,
  score: (10 - i) * 1000 + 500,
  lines_cleared: 40 - i,
  level: 5 - Math.floor(i / 3),
  created_at: '2026-11-04 18:24:08',
}));

describe('ScorePage - classifica top 10', () => {
  beforeEach(() => fetchTopScores.mockReset());

  it('titolo e link per tornare al gioco', async () => {
    fetchTopScores.mockResolvedValue([]);
    render(<ScorePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/classifica/i);
    expect(screen.getByRole('link', { name: /torna al gioco/i })).toHaveAttribute('href', '/');
    await screen.findByText(/nessun punteggio/i);
  });

  it('durante il caricamento mostra un messaggio', async () => {
    let resolve;
    fetchTopScores.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<ScorePage />);
    expect(screen.getByText(/caricamento/i)).toBeInTheDocument();

    // la promise va risolta: se resta pendente il test successivo si blocca
    resolve([]);
    expect(await screen.findByText(/nessun punteggio/i)).toBeInTheDocument();
    expect(screen.queryByText(/caricamento/i)).not.toBeInTheDocument();
  });

  it('mostra 10 righe con posizione, nome, punteggio, righe, livello e data', async () => {
    fetchTopScores.mockResolvedValue(rows);
    render(<ScorePage />);

    const table = await screen.findByRole('table', { name: /top 10/i });
    const bodyRows = within(table).getAllByRole('row').slice(1); // la prima è l'intestazione
    expect(bodyRows).toHaveLength(10);

    const first = within(bodyRows[0]);
    expect(first.getByText('1')).toBeInTheDocument();
    expect(first.getByText('Giocatore 1')).toBeInTheDocument();
    expect(first.getByText('10.500')).toBeInTheDocument();
    expect(first.getByText('40')).toBeInTheDocument();
    expect(first.getByText('5')).toBeInTheDocument();
    expect(first.getByText('04/11/2026')).toBeInTheDocument();
    expect(within(bodyRows[9]).getByText('Giocatore 10')).toBeInTheDocument();
  });

  it('i primi tre hanno uno stile da podio', async () => {
    fetchTopScores.mockResolvedValue(rows);
    render(<ScorePage />);
    const bodyRows = within(await screen.findByRole('table')).getAllByRole('row').slice(1);
    expect(bodyRows.map((r) => r.dataset.podium ?? null)).toEqual(['1', '2', '3', ...Array(7).fill(null)]);
  });

  it('classifica vuota: invito a giocare', async () => {
    fetchTopScores.mockResolvedValue([]);
    render(<ScorePage />);
    expect(await screen.findByText(/nessun punteggio/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gioca/i })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('errore: messaggio e pulsante «Riprova» che ricarica', async () => {
    fetchTopScores.mockRejectedValueOnce(new ApiError('Server non raggiungibile', 0)).mockResolvedValueOnce(rows);
    render(<ScorePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/server non raggiungibile/i);
    await userEvent.click(screen.getByRole('button', { name: /riprova/i }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(fetchTopScores).toHaveBeenCalledTimes(2);
  });
});
