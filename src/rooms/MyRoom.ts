import { Room, Client } from 'colyseus';
import { MyRoomState } from './schema/MyRoomState';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from './commands/onJoinCommand';
import { OnLeaveCommand } from './commands/onLeaveCommand';
import { words } from './data/words';
import { Word } from './schema/Word';

let rndIndex = 0;

export class MyRoom extends Room<MyRoomState> {
  dispatcher = new Dispatcher(this);

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.state.isGameRunning = false;
    this.state.password = options.password;

    this.onMessage('startGame', (client, id) => {
      if (this.state.hostId === id) {
        this.state.isGameRunning = true;
        const word = words[rndIndex];
        word.text = word.text.replace(/[a-zA-Z]/g, '_');
        this.state.word = new Word(word);
      }
    });

    this.onMessage('removePlayer', (client, id) => {
      const clientToRemove = this.clients.find((client) => client.id === id);
      console.log(`client to remove = ${JSON.stringify(clientToRemove)}`);
      clientToRemove.leave();
    });
  }

  onAuth(client: Client, options: any, request: any) {
    if (this.state.password) {
      return options.password === this.state.password;
    }
    return true;
  }

  onJoin(client: Client, options: any) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      client,
      options,
    });
  }

  onLeave(client: Client, consented: boolean) {
    this.dispatcher.dispatch(new OnLeaveCommand(), {
      client,
      consented,
    });
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }

  getPlayerById = (id: string) => this.state.players.find((player) => player.id === id);
}
