/**
 * Punteggio, righe e livello.
 * variant "panel": card del pannello laterale (desktop), test id "stat-*".
 * variant "bar": barra compatta su una riga sopra la griglia (mobile), test id "bar-*".
 */
export default function StatsPanel({ score, lines, level, variant = 'panel' }) {
  const stats = [
    { key: 'punteggio', label: 'Punteggio', value: score },
    { key: 'righe', label: 'Righe', value: lines },
    { key: 'livello', label: 'Livello', value: level },
  ];
  const isBar = variant === 'bar';

  return (
    <dl className={isBar ? 'stats stats--bar' : 'stats'}>
      {stats.map(({ key, label, value }) => (
        <div className="stats__item" key={key}>
          <dt className="stats__label">{label}</dt>
          <dd className="stats__value" data-testid={`${isBar ? 'bar' : 'stat'}-${key}`}>
            {value.toLocaleString('it-IT')}
          </dd>
        </div>
      ))}
    </dl>
  );
}
