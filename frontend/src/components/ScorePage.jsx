import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchTopScores } from '../api/scores';
import { apiErrorMessage } from '../i18n/apiError';
import { formatDate, formatNumber } from '../score/format';
import { GAME_TITLE } from '../meta';

/** Pagina classifica: solo visualizzazione della top 10 (GET /api/scores.php). */
export default function ScorePage() {
  const intl = useIntl();
  // state: { status: 'loading' | 'ready' | 'error', rows, error } (error: l'errore ricevuto)
  const [state, setState] = useState({ status: 'loading', rows: [], error: null });

  const load = useCallback(() => {
    let active = true;
    setState({ status: 'loading', rows: [], error: null });
    fetchTopScores()
      .then((rows) => active && setState({ status: 'ready', rows, error: null }))
      .catch((err) => active && setState({ status: 'error', rows: [], error: err }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(load, [load]);

  return (
    <div className="page">
      <header className="topbar">
        <h1 className="topbar__title">
          <FormattedMessage id="score.title" values={{ title: GAME_TITLE }} />
        </h1>
        <a className="topbar__link" href="/">
          <FormattedMessage id="nav.backToGame" />
        </a>
      </header>

      <main className="board-page">
        <section className="leaderboard">
          {state.status === 'loading' && <p className="leaderboard__msg">
              <FormattedMessage id="score.loading" />
            </p>}

          {state.status === 'error' && (
            <div className="leaderboard__msg" role="alert">
              <p>
                <FormattedMessage id="score.loadError" values={{ error: apiErrorMessage(intl, state.error) }} />
              </p>
              <button type="button" className="btn" onClick={load}>
                <FormattedMessage id="score.retry" />
              </button>
            </div>
          )}

          {state.status === 'ready' && state.rows.length === 0 && (
            <div className="leaderboard__msg">
              <p>
                <FormattedMessage id="score.empty" />
              </p>
              <a className="btn btn--primary" href="/">
                <FormattedMessage id="score.playFirst" />
              </a>
            </div>
          )}

          {state.status === 'ready' && state.rows.length > 0 && (
            <table className="leaderboard__table">
              <caption className="leaderboard__caption">
                <FormattedMessage id="score.caption" />
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="col-rank">
                    #
                  </th>
                  <th scope="col">
                    <FormattedMessage id="score.col.player" />
                  </th>
                  <th scope="col" className="col-num">
                    <FormattedMessage id="score.col.points" />
                  </th>
                  <th scope="col" className="col-num col-extra">
                    <FormattedMessage id="score.col.lines" />
                  </th>
                  <th scope="col" className="col-num col-extra">
                    <FormattedMessage id="score.col.level" />
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
