import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { MyRoom } from '../MyRoom';
import { Player } from '../schema/Player';

type Params = {
  client: Client;
  options: any;
};

export class OnJoinCommand extends Command<
  MyRoom,
  {
    client: Client;
    options: any;
  }
> {
  execute({ client, options }: Params) {
    console.log(client.sessionId, `joined! ${JSON.stringify(options)}`);
    const player = new Player();
    player.id = client.id;
    player.name = options.playerName;
    this.state.players.push(player);

    if (this.state.players.length === 1) {
      this.state.hostId = client.id;
    }
  }
}
