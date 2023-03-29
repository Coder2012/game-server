import { Schema, type } from '@colyseus/schema';

export class Guess extends Schema {
  @type('string') playerId: string;
  @type('string') playerName: string;
  @type('string') colour: string;
  @type('string') option: string;
}
