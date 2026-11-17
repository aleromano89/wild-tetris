import { FormattedMessage, useIntl } from 'react-intl';
import { BRICK_STYLES, brickClass } from '../theme/brickStyles';
import Grid from './Grid';

/** Mattoni d'esempio mostrati in ogni opzione (una cella per colore). */
const SWATCH = [
  ['I', 'O', 'T', 'S'],
  ['Z', 'J', 'L', 'I'],
];

/** Etichetta di ogni stile (id scritti per intero: li controlla i18n/messages.test.js). */
const LABELS = {
  classic: 'bricks.classic',
  ice: 'bricks.ice',
  wood: 'bricks.wood',
  lava: 'bricks.lava',
};

/** Scelta dello stile dei mattoni: un'opzione per stile, con anteprima. */
export default function BrickStylePicker({ value, onChange, disabled = false }) {
  const intl = useIntl();

  return (
    <fieldset className="brick-picker" disabled={disabled}>
      <legend className="card__title">
        <FormattedMessage id="bricks.title" />
      </legend>
      <div role="radiogroup" aria-label={intl.formatMessage({ id: 'bricks.title' })} className="brick-picker__options">
        {BRICK_STYLES.map((style) => (
          <label key={style} className="brick-picker__option">
            <input
              type="radio"
              name="brick-style"
              value={style}
              checked={value === style}
              onChange={() => onChange(style)}
              className="brick-picker__input"
            />
            <span className="brick-picker__swatch" aria-hidden="true">
              <Grid cells={SWATCH} className={`grid--swatch ${brickClass(style)}`} />
            </span>
            <span className="brick-picker__name">
              <FormattedMessage id={LABELS[style]} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
