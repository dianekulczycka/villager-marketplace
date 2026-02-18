import { ForbiddenException, PipeTransform } from '@nestjs/common';
import { hasSwearWords } from '../shared/filters/swear-words.filter';

export class ModerationPipe<
  T extends Record<string, unknown>,
> implements PipeTransform<T, T> {
  constructor(private readonly fields: (keyof T)[]) {}

  transform(value: T): T {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    const texts: string[] = [];

    for (const field of this.fields) {
      const v = value[field];
      if (typeof v === 'string') texts.push(v);
    }

    const hasSwears = texts.some((t) => hasSwearWords(t));

    if (hasSwears) {
      throw new ForbiddenException('Bad language used');
    }

    return value;
  }
}
