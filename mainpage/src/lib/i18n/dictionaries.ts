import 'server-only';
import type { Locale } from './config';

const dictionaries: Record<Locale, () => Promise<Record<string, unknown>>> = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
  pt: () => import('./dictionaries/pt.json').then((m) => m.default),
  fr: () => import('./dictionaries/fr.json').then((m) => m.default),
  it: () => import('./dictionaries/it.json').then((m) => m.default),
  de: () => import('./dictionaries/de.json').then((m) => m.default),
  hi: () => import('./dictionaries/hi.json').then((m) => m.default),
  fil: () => import('./dictionaries/fil.json').then((m) => m.default),
  vi: () => import('./dictionaries/vi.json').then((m) => m.default),
  sw: () => import('./dictionaries/sw.json').then((m) => m.default),
  ne: () => import('./dictionaries/ne.json').then((m) => m.default),
  am: () => import('./dictionaries/am.json').then((m) => m.default),
  ar: () => import('./dictionaries/ar.json').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
