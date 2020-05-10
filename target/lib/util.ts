import uniqId from 'licia/uniqId';
import random from 'licia/random';

const prefix = random(1000, 9999) + '.';

export function createId() {
  return uniqId(prefix);
}
