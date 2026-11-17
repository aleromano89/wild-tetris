import { FormattedMessage } from 'react-intl';
import { formatElapsed } from '../game/timer';

/**
 * Punteggio, righe, livello e tempo di gioco (elapsed in ms).
 * variant "panel": card del pannello laterale (desktop), test id "stat-*".
 * variant "bar": barra compatta su una riga sopra la griglia (mobile), test id "bar-*".
 */
export default function StatsPanel({ score, lines, level, elapsed = 0, variant = 'panel' }) {
  const stats = [
    { key: 'punteggio', label: 'stats.score', value: score.toLocaleString('it-IT') },
    { key: 'righe', label: 'stats.lines', value: lines.toLocaleString('it-IT') },
    { key: 'livello', label: 'stats.level', value: level.toLocaleString('it-IT') },
    { key: 'tempo', label: 'stats.time', value: formatElapsed(elapsed) },
  ];
  const isBar = variant === 'bar';

  return (
    <dl className={isBar ? 'stats stats--bar' : 'stats'}>
      {stats.map(({ key, label, value }) => (
        <div className="stats__item" key={key}>
          <dt className="stats__label">
            <FormattedMessage id={label} />
          </dt>
          <dd className="stats__value" data-testid={`${isBar ? 'bar' : 'stat'}-${key}`}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
