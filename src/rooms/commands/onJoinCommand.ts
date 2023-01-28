import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { MyRoom } from '../MyRoom';
import { Player } from '../schema/Player';

type Params = {
  client: Client;
  options: any;
  colours: string[];
};

export class OnJoinCommand extends Command<
  MyRoom,
  {
    client: Client;
    options: any;
    colours: string[];
  }
> {
  execute({ client, options, colours }: Params) {
    console.log(client.sessionId, `joined! ${JSON.stringify(options)}`);
    const player = new Player();
    player.id = client.id;
    player.name = options.playerName;
    player.colour = colours[this.state.players.length];
    player.score = 0;
    this.state.players.push(player);

    if (this.state.players.length === 1) {
      this.state.hostId = client.id;
    }
  }
}
