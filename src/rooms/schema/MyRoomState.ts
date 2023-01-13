import { Schema, ArraySchema, type, filter } from '@colyseus/schema';
import { Guess } from './Guess';
import { Player } from './Player';
import { Word } from './Word';

export class MyRoomState extends Schema {
  @type('boolean') isGameRunning: boolean;
  @type('string') password: string;

  @filter(function (client, value, root) {
    // client is:
    //
    // the current client that's going to receive this data. you may use its
    // client.sessionId, or other information to decide whether this value is
    // going to be synched or not.

    // value is:
    // the value of the field @filter() is being applied to

    // root is:
    // the root instance of your room state. you may use it to access other
    // structures in the process of decision whether this value is going to be
    // synched or not.
    return client.id === value;
  })
  @type('string')
  hostId: string;

  @type([Player]) players = new ArraySchema<Player>();
  @type([Guess]) guesses = new ArraySchema<Guess>();
  @type(Word) word: Word;
}
