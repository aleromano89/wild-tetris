import { describe, expect, it } from 'vitest';
import { LOCALE, MESSAGES } from './index';

// Coerenza dei file di traduzione con il codice.
const it_ = MESSAGES.it;
const namespaces = new Set(Object.keys(it_).map((k) => k.split('.')[0]));

// sorgenti dell'app (test esclusi) come testo
const sources = Object.entries(
  import.meta.glob(['../**/*.{js,jsx}', '!../**/*.test.{js,jsx}', '!../test/**'], {
    query: '?raw',
    import: 'default',
    eager: true,
  })
);

/** Stringhe letterali con forma di id ("area.elemento") e namespace noto. */
function usedIds() {
  const ids = new Set();
  for (const [, code] of sources) {
    for (const [, id] of code.matchAll(/['"]([a-z][a-zA-Z]*(?:\.[a-zA-Z0-9]+)+)['"]/g)) {
      if (namespaces.has(id.split('.')[0])) ids.add(id);
    }
  }
  return ids;
}

describe('traduzioni (react-intl)', () => {
  it('la lingua dell\'app è l\'italiano (CLAUDE.md)', () => {
    expect(LOCALE).toBe('it');
  });

  it('tutte le lingue hanno le stesse chiavi dell\'italiano', () => {
    for (const [locale, messages] of Object.entries(MESSAGES)) {
      expect(Object.keys(messages).sort(), locale).toEqual(Object.keys(it_).sort());
    }
  });

  it('nessun testo vuoto', () => {
    for (const [locale, messages] of Object.entries(MESSAGES)) {
      for (const [id, text] of Object.entries(messages)) {
        expect(text.trim(), `${locale} ${id}`).not.toBe('');
      }
    }
  });

  it('ogni id usato nel codice esiste e ogni chiave è usata', () => {
    expect(sources.length).toBeGreaterThan(5);
    const used = usedIds();
    const missing = [...used].filter((id) => !(id in it_));
    const unused = Object.keys(it_).filter((id) => !used.has(id));
    expect(missing, 'id usati ma non tradotti').toEqual([]);
    expect(unused, 'chiavi non usate').toEqual([]);
  });
});
