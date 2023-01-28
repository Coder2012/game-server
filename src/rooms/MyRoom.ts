import { Room, Client } from 'colyseus';
import { MyRoomState } from './schema/MyRoomState';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from './commands/onJoinCommand';
import { OnLeaveCommand } from './commands/onLeaveCommand';
import { words } from './data/words';
import { Word } from './schema/Word';
import { Guess } from './schema/Guess';
import { Player } from './schema/Player';
import { Winner } from './schema/Winner';
import { ArraySchema } from '@colyseus/schema';

const WINNING_SCORE = 5;
let word: { text: string; description: string };

export class MyRoom extends Room<MyRoomState> {
  dispatcher = new Dispatcher(this);

  colours = ['FF69B4', 'FFA07A', 'FF8C00', 'FFA500', 'FFD700', '98FB98', '00FF7F', '20B2AA'];

  onCreate(options: any) {
    this.clock.start();

    this.setState(new MyRoomState());
    this.state.isGameOver = true;
    this.state.isGameRunning = false;
    this.state.password = options.password;

    this.onMessage('startGame', (client, id) => {
      this.state.isGameOver = false;

      if (this.state.hostId === id) {
        this.nextWord();
      }
    });

    this.onMessage('removePlayer', (client, id) => {
      const clientToRemove = this.clients.find((client) => client.id === id);
      console.log(`client to remove = ${JSON.stringify(clientToRemove)}`);
      clientToRemove.leave();
    });

    this.onMessage('playerGuess', (client, value: string) => {
      const playerId = client.id;
      const guess = new Guess();
      guess.playerId = playerId;
      guess.playerName = this.getPlayerById(playerId).name;
      guess.colour = this.getPlayerById(playerId).colour;
      guess.word = value.toLocaleLowerCase();

      if (!this.state.guesses.find((guess) => guess.word === value)) {
        console.log(`guess by: ${guess.playerName} = ${value}`);
        this.state.guesses.push(guess);

        if (this.isGuessCorrect(guess.word)) {
          const player = this.getPlayerById(playerId);
          this.correctGuess(player);

          if (this.isGameOver(player)) {
            this.gameOver(player);
          }
        }
      }
    });
  }

  onAuth(client: Client, options: any, request: any) {
    if (this.state.isGameRunning) {
      return false;
    }
    if (this.state.password) {
      return options.password === this.state.password;
    }
    return true;
  }

  onJoin(client: Client, options: any) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      client,
      options,
      colours: this.colours,
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

  getPlayerById(id: string) {
    return this.state.players.find((player) => player.id === id);
  }

  isGuessCorrect(guess: string) {
    return guess === word.text.toLowerCase();
  }

  isGameOver(player: Player) {
    return player.score == WINNING_SCORE;
  }

  correctGuess(player: Player) {
    player.score++;

    const winner = new Winner();
    winner.player = player;
    winner.word = word.text;

    this.state.winner = winner;
    this.state.isGameRunning = false;

    this.clock.setTimeout(() => {
      this.nextWord();
    }, 3000);
  }

  nextWord() {
    this.state.guesses = new ArraySchema<Guess>();
    this.state.winner = null;

    word = words[Math.floor(Math.random() * words.length)];
    const { text, description } = word;
    this.state.word = new Word({ text: text.replace(/[a-zA-Z]/g, '_'), description });
    this.state.isGameRunning = true;
  }

  gameOver(player: Player) {
    this.state.isGameOver = true;
  }
}
