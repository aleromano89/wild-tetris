export default function StatsPanel({ score, lines, level }) {
  const stats = [
    { key: 'punteggio', label: 'Punteggio', value: score },
    { key: 'righe', label: 'Righe', value: lines },
    { key: 'livello', label: 'Livello', value: level },
  ];

  return (
    <dl className="stats">
      {stats.map(({ key, label, value }) => (
        <div className="stats__item" key={key}>
          <dt className="stats__label">{label}</dt>
          <dd className="stats__value" data-testid={`stat-${key}`}>
            {value.toLocaleString('it-IT')}
          </dd>
        </div>
      ))}
    </dl>
  );
}
