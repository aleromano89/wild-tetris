import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App - interfaccia di gioco senza blocchi', () => {
  it('mostra la griglia di gioco vuota 10×20 (200 celle)', () => {
    render(<App />);
    const board = screen.getByRole('grid', { name: /campo di gioco/i });
    const cells = within(board).getAllByRole('gridcell');
    expect(cells).toHaveLength(200);
    cells.forEach((cell) => expect(cell).toHaveAttribute('data-filled', 'false'));
  });

  it('mostra punteggio 0, righe 0, livello 1', () => {
    render(<App />);
    expect(screen.getByTestId('stat-punteggio')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-righe')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-livello')).toHaveTextContent('1');
  });

  it("mostra l'anteprima del prossimo pezzo vuota (4×4)", () => {
    render(<App />);
    const preview = screen.getByRole('grid', { name: /prossimo pezzo/i });
    const cells = within(preview).getAllByRole('gridcell');
    expect(cells).toHaveLength(16);
    cells.forEach((cell) => expect(cell).toHaveAttribute('data-filled', 'false'));
  });

  it('allo stato iniziale "Avvia" è attivo e "Pausa" è disabilitato', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Avvia' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeDisabled();
  });

  it('cliccando Avvia si abilita Pausa, cliccando Pausa compare Riprendi', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Avvia' }));
    expect(screen.getByRole('button', { name: 'Avvia' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Pausa' }));
    expect(screen.getByRole('button', { name: 'Riprendi' })).toBeEnabled();
    expect(screen.getByText(/in pausa/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Riprendi' }));
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeEnabled();
  });

  it('ha un collegamento alla pagina classifica', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /classifica/i })).toHaveAttribute('href', '/score.html');
  });
});
