import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { MyRoom } from '../MyRoom';
import { Player } from '../schema/Player';

type Params = {
  client: Client;
  consented: boolean;
};

export class OnLeaveCommand extends Command<
  MyRoom,
  {
    client: Client;
    consented: boolean;
  }
> {
  execute({ client, consented }: Params) {
    const itemIndex = this.state.players.findIndex((player) => player.id === client.id);
    this.state.players.splice(itemIndex, 1);
    console.log(`client left and consented = `, consented);
  }
}
