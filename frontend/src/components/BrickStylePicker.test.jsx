import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '../test/intl';
import BrickStylePicker from './BrickStylePicker';

describe('BrickStylePicker', () => {
  it('gruppo «Stile mattoni» con le quattro opzioni; selezionata quella corrente', () => {
    render(<BrickStylePicker value="classic" onChange={() => {}} />);
    const group = screen.getByRole('radiogroup', { name: 'Stile mattoni' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('value'))).toEqual(['classic', 'ice', 'wood', 'lava']);
    expect(screen.getByRole('radio', { name: 'Classico' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Cubi di ghiaccio' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Legno' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Lava incandescente' })).not.toBeChecked();
  });

  it('scegliendo un\'opzione chiama onChange con lo stile', () => {
    const onChange = vi.fn();
    render(<BrickStylePicker value="classic" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Legno' }));
    expect(onChange).toHaveBeenCalledWith('wood');
  });

  it('ogni opzione mostra un\'anteprima dei mattoni nel proprio stile, nascosta ai lettori di schermo', () => {
    const { container } = render(<BrickStylePicker value="classic" onChange={() => {}} />);
    const swatches = container.querySelectorAll('.brick-picker__swatch');
    expect(swatches).toHaveLength(4);
    ['classic', 'ice', 'wood', 'lava'].forEach((style, i) => {
      expect(swatches[i].querySelector('.grid')).toHaveClass(`bricks--${style}`);
    });
    swatches.forEach((s) => {
      expect(s).toHaveAttribute('aria-hidden', 'true');
      expect(s.querySelectorAll('[data-filled="true"]').length).toBeGreaterThan(0);
    });
    expect(screen.queryAllByRole('grid')).toHaveLength(0);
  });

  it('disabilitato: opzioni non selezionabili', () => {
    render(<BrickStylePicker value="classic" onChange={() => {}} disabled />);
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });

  it('in spagnolo', () => {
    render(<BrickStylePicker value="wood" onChange={() => {}} />, { locale: 'es' });
    expect(screen.getByRole('radiogroup', { name: 'Estilo de los bloques' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Madera' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Clásico' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Cubitos de hielo' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Lava incandescente' })).toBeInTheDocument();
  });
});
