import { Schema, type } from '@colyseus/schema';

export class Word extends Schema {
  @type('string') text: string;
  @type('string') description: string;
}
