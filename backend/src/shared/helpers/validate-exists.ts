import { NotFoundException } from '@nestjs/common';

export function validateExists<T>(entity: T | null, error: string): T {
  if (!entity) throw new NotFoundException(error);
  return entity;
}
