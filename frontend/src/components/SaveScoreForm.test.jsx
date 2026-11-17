import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../test/intl';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../api/scores';

vi.mock('../api/scores', async (importOriginal) => ({ ...(await importOriginal()), submitScore: vi.fn() }));
const { submitScore } = await import('../api/scores');
const { default: SaveScoreForm, NAME_STORAGE_KEY } = await import('./SaveScoreForm');

const result = { score: 1420, lines: 12, level: 2 };
const setup = () => {
  const user = userEvent.setup();
  render(<SaveScoreForm {...result} />);
  return {
    user,
    input: screen.getByRole('textbox', { name: /nome/i }),
    button: screen.getByRole('button', { name: /salva/i }),
  };
};

describe('SaveScoreForm - salvataggio punteggio a fine partita', () => {
  beforeEach(() => {
    submitScore.mockReset();
    localStorage.clear();
  });
  afterEach(() => localStorage.clear());

  it('campo nome con massimo 20 caratteri e focus automatico', () => {
    const { input } = setup();
    expect(input).toHaveAttribute('maxLength', '20');
    expect(input).toHaveFocus();
  });

  it('pulsante disattivato con nome vuoto o solo spazi', async () => {
    const { user, input, button } = setup();
    expect(button).toBeDisabled();
    await user.type(input, '   ');
    expect(button).toBeDisabled();
    await user.type(input, 'Ada');
    expect(button).toBeEnabled();
  });

  it('invia nome (trim), punteggio, righe e livello; poi conferma con link alla classifica', async () => {
    let resolve;
    submitScore.mockReturnValue(new Promise((r) => (resolve = r)));
    const { user, input, button } = setup();

    await user.type(input, '  Ada  {Enter}');
    expect(submitScore).toHaveBeenCalledWith({ player_name: 'Ada', score: 1420, lines_cleared: 12, level: 2 });
    // durante l'invio non si può reinviare
    expect(button).toBeDisabled();
    expect(input).toBeDisabled();

    resolve({ player_name: 'Ada', score: 1420, lines_cleared: 12, level: 2, created_at: '2026-11-14 10:00:00' });
    expect(await screen.findByText(/punteggio salvato/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vedi classifica/i })).toHaveAttribute('href', '/score.html');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(submitScore).toHaveBeenCalledTimes(1);
  });

  it('ricorda l\'ultimo nome usato', async () => {
    submitScore.mockResolvedValue({});
    const first = setup();
    await first.user.type(first.input, 'Ada{Enter}');
    await screen.findByText(/punteggio salvato/i);
    expect(localStorage.getItem(NAME_STORAGE_KEY)).toBe('Ada');

    document.body.innerHTML = '';
    render(<SaveScoreForm {...result} />);
    expect(screen.getByRole('textbox', { name: /nome/i })).toHaveValue('Ada');
  });

  it('errore di validazione dal server: mostra il messaggio del campo e permette di riprovare', async () => {
    submitScore.mockRejectedValueOnce(new ApiError('Dati non validi', 422, { player_name: 'Il nome contiene caratteri non validi' }));
    const { user, input, button } = setup();

    await user.type(input, 'Ada{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Il nome contiene caratteri non validi');
    expect(input).toBeEnabled();

    submitScore.mockResolvedValueOnce({});
    await user.click(button);
    expect(await screen.findByText(/punteggio salvato/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('server non raggiungibile: messaggio di errore', async () => {
    submitScore.mockRejectedValueOnce(new ApiError('Server non raggiungibile', 0));
    const { user, input } = setup();

    await user.type(input, 'Ada{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(/server non raggiungibile/i);
  });
});

describe('SaveScoreForm - tastiera virtuale (mobile)', () => {
  // la tastiera riduce il visual viewport: il modulo deve restare visibile sopra la tastiera
  let viewport;
  beforeEach(() => {
    submitScore.mockReset();
    localStorage.clear();
    viewport = Object.assign(new EventTarget(), { height: 553, offsetTop: 0 });
    window.visualViewport = viewport;
    vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  });
  afterEach(() => {
    delete window.visualViewport;
    vi.restoreAllMocks();
  });

  const placeForm = (top, bottom) => {
    const form = screen.getByRole('textbox', { name: /nome/i }).closest('form');
    vi.spyOn(form, 'getBoundingClientRect').mockReturnValue({ top, bottom, left: 0, right: 300, width: 300, height: bottom - top });
  };

  it('quando la tastiera copre il modulo scorre la pagina quanto basta a mostrarlo', () => {
    setup();
    placeForm(250, 380);
    viewport.height = 300; // tastiera aperta
    viewport.dispatchEvent(new Event('resize'));
    expect(window.scrollBy).toHaveBeenCalledWith(0, 380 + 12 - 300);
  });

  it('non scorre se il modulo è già visibile o se il campo non ha il focus', () => {
    const { input } = setup();
    placeForm(100, 230);
    viewport.height = 300;
    viewport.dispatchEvent(new Event('resize'));
    expect(window.scrollBy).not.toHaveBeenCalled();

    placeForm(250, 380);
    input.blur();
    viewport.dispatchEvent(new Event('resize'));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  it('smette di ascoltare il viewport quando il modulo viene rimosso', () => {
    const { unmount } = render(<SaveScoreForm {...result} />);
    const remove = vi.spyOn(viewport, 'removeEventListener');
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
