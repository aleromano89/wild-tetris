import { useCallback, useEffect, useState } from 'react';
import { fetchTopScores } from '../api/scores';
import { formatDate, formatNumber } from '../score/format';
import { GAME_TITLE } from '../meta';

/** Pagina classifica: solo visualizzazione della top 10 (GET /api/scores.php). */
export default function ScorePage() {
  // state: { status: 'loading' | 'ready' | 'error', rows, error }
  const [state, setState] = useState({ status: 'loading', rows: [], error: '' });

  const load = useCallback(() => {
    let active = true;
    setState({ status: 'loading', rows: [], error: '' });
    fetchTopScores()
      .then((rows) => active && setState({ status: 'ready', rows, error: '' }))
      .catch((err) => active && setState({ status: 'error', rows: [], error: err.message }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(load, [load]);

  return (
    <div className="page">
      <header className="topbar">
        <h1 className="topbar__title">{GAME_TITLE} · Classifica</h1>
        <a className="topbar__link" href="/">
          Torna al gioco
        </a>
      </header>

      <main className="board-page">
        <section className="leaderboard">
          {state.status === 'loading' && <p className="leaderboard__msg">Caricamento della classifica…</p>}

          {state.status === 'error' && (
            <div className="leaderboard__msg" role="alert">
              <p>Impossibile caricare la classifica: {state.error}</p>
              <button type="button" className="btn" onClick={load}>
                Riprova
              </button>
            </div>
          )}

          {state.status === 'ready' && state.rows.length === 0 && (
            <div className="leaderboard__msg">
              <p>Nessun punteggio ancora registrato.</p>
              <a className="btn btn--primary" href="/">
                Gioca la prima partita
              </a>
            </div>
          )}

          {state.status === 'ready' && state.rows.length > 0 && (
            <table className="leaderboard__table">
              <caption className="leaderboard__caption">Top 10</caption>
              <thead>
                <tr>
                  <th scope="col" className="col-rank">
                    #
                  </th>
                  <th scope="col">Giocatore</th>
                  <th scope="col" className="col-num">
                    Punti
                  </th>
                  <th scope="col" className="col-num col-extra">
                    Righe
                  </th>
                  <th scope="col" className="col-num col-extra">
                    Livello
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.rows.map((r, i) => (
                  <tr key={`${i}-${r.player_name}-${r.created_at}`} data-podium={i < 3 ? String(i + 1) : undefined}>
                    <td className="col-rank">
                      <span className="rank">{i + 1}</span>
                    </td>
                    <td>
                      <span className="player">{r.player_name}</span>
                      <span className="date">{formatDate(r.created_at)}</span>
                    </td>
                    <td className="col-num score">{formatNumber(r.score)}</td>
                    <td className="col-num col-extra">{formatNumber(r.lines_cleared)}</td>
                    <td className="col-num col-extra">{r.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
