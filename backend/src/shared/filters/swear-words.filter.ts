import leoProfanity from 'leo-profanity';

leoProfanity.loadDictionary();

export function hasSwearWords(text: string): boolean {
  return leoProfanity.check(text);
}
