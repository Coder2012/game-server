import { Schema, type } from '@colyseus/schema';
import { Player } from './Player';

export class Winner extends Schema {
  @type(Player) player: Player;
  @type('string') word: string;
}
