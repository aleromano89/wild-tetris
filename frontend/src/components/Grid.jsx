/**
 * Griglia generica (campo di gioco o anteprima).
 * Le righe usano display: contents, così le celle restano figlie dirette della CSS grid.
 */
export default function Grid({ cells, label, className = '' }) {
  const cols = cells[0]?.length ?? 0;

  return (
    <div
      role="grid"
      aria-label={label}
      className={`grid ${className}`}
      style={{ '--cols': cols }}
    >
      {cells.map((row, r) => (
        <div role="row" className="grid__row" key={r}>
          {row.map((cell, c) => (
            <div
              role="gridcell"
              key={c}
              className={`grid__cell${cell ? ` grid__cell--${cell}` : ''}`}
              data-filled={cell ? 'true' : 'false'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
