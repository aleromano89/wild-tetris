import { describe, expect, it } from 'vitest';
import { PIECE_TYPES, PIECES, createBag } from './pieces';

describe('PIECES', () => {
  it('definisce 7 forme', () => {
    expect(PIECE_TYPES).toHaveLength(7);
    expect(Object.keys(PIECES).sort()).toEqual([...PIECE_TYPES].sort());
  });

  it('ogni forma è composta da esattamente 4 blocchi in una matrice quadrata', () => {
    PIECE_TYPES.forEach((type) => {
      const shape = PIECES[type];
      shape.forEach((row) => expect(row).toHaveLength(shape.length));
      expect(shape.flat().filter(Boolean)).toHaveLength(4);
    });
  });
});

describe('createBag', () => {
  it('contiene le 7 forme, ciascuna una sola volta', () => {
    const bag = createBag();
    expect(bag).toHaveLength(7);
    expect([...bag].sort()).toEqual([...PIECE_TYPES].sort());
  });

  it("usa il generatore casuale fornito (ordine deterministico con la stessa sequenza)", () => {
    const rng = () => 0;
    expect(createBag(rng)).toEqual(createBag(rng));
  });

  it('con generatori diversi produce ordini diversi', () => {
    expect(createBag(() => 0)).not.toEqual(createBag(() => 0.999));
  });
});
