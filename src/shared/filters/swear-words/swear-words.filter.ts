import leoProfanity from 'leo-profanity';

leoProfanity.loadDictionary();

export function hasSwearWords(text: string): boolean {
  return leoProfanity.check(text);
}

export function hasSwearWordsInDto<T extends object>(dto: T): boolean {
  return Object.values(dto).some(
    (v) => typeof v === 'string' && hasSwearWords(v),
  );
}
