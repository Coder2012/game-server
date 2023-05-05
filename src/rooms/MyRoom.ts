const TRIVIA = require('./data/trivia.json');

import { Room, Client } from 'colyseus';
import { MyRoomState } from './schema/MyRoomState';
import { Dispatcher } from '@colyseus/command';

import { OnJoinCommand } from './commands/onJoinCommand';
import { OnLeaveCommand } from './commands/onLeaveCommand';
import { Question, Options } from './schema/Question';
import { Guess } from './schema/Guess';
import { Player } from './schema/Player';
import { ArraySchema } from '@colyseus/schema';
import { OnLoadCommand } from './commands/onLoadCommand';

const WINNING_SCORE = 5;
let question: {
  category: string;
  description: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
};

export class MyRoom extends Room<MyRoomState> {
  dispatcher = new Dispatcher(this);

  questions: any = [];
  colours = ['FF69B4', 'FFA07A', 'FF8C00', 'FFA500', 'FFD700', '98FB98', '00FF7F', '20B2AA'];

  constructor() {
    super();
  }

  onCreate(options: any) {
    // this.dispatcher.dispatch(new OnLoadCommand());
    this.questions = TRIVIA.questions;
    this.clock.start();

    this.setState(new MyRoomState());
    this.state.isGameOver = true;
    this.state.isGameRunning = false;
    this.state.password = options.password;

    this.onMessage('startGame', (client, id) => {
      this.state.isGameOver = false;

      if (this.state.hostId === id) {
        this.broadcast('navigation', 'game');
        this.nextQuestion();
        this.startAnswerTimer();
      }
    });

    this.onMessage('removePlayer', (client, id) => {
      const clientToRemove = this.clients.find((client) => client.id === id);
      console.log(`client to remove = ${JSON.stringify(clientToRemove)}`);
      clientToRemove.leave();
    });

    this.onMessage('playerGuess', (client, value: string) => {
      const player = this.getPlayerById(client.id);
      player.lastAnswer = value;
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
    return guess === this.questions.text.toLowerCase();
  }

  isGameOver(player: Player) {
    return player.score == WINNING_SCORE;
  }

  nextQuestion() {
    this.state.guesses = new ArraySchema<Guess>();

    question = this.questions[Math.floor(Math.random() * this.questions.length)];
    const { category, description, options } = question;

    const opts = new Options(options);
    this.state.question = new Question({ category, description, options: opts });
    console.log(JSON.stringify(this.state.question));
    this.state.isGameRunning = true;
  }

  // startAnswerTimer() {
  //   this.clock.setTimeout(() => {
  //     this.state.answer = question.answer;
  //     this.checkScores();
  //   }, 8000);
  //   this.broadcast('timer', 8000);
  // }

  startAnswerTimer() {
    const timerDuration = 8000;
    const updateTime = 1000; // Send updates every 1000 ms (1 second)

    let timeElapsed = 0;

    const interval = this.clock.setInterval(() => {
      timeElapsed += updateTime;
      const remainingTime = timerDuration - timeElapsed;

      console.log(remainingTime);

      this.broadcast('timer', Math.max(remainingTime, 0));

      if (remainingTime <= 0) {
        this.state.answer = question.answer;
        this.checkScores();
        interval.clear(); // Clear the interval using the clear() method
      }
    }, updateTime);
  }

  startNextQuestionTimer() {
    this.clock.setTimeout(() => {
      this.state.answer = null;
      this.clearLastAnswers();
      this.nextQuestion();
      this.startAnswerTimer();
    }, 8000);
  }

  checkScores() {
    this.state.players.forEach((player) => {
      if (player.lastAnswer === question.answer) {
        player.score++;
      }
    });

    const playersFinished = this.state.players.filter((player) => player.score === 5);

    if (playersFinished.length === 0) {
      this.startNextQuestionTimer();
    } else {
      this.gameOver();
    }
  }

  clearLastAnswers() {
    this.state.players.forEach((player) => (player.lastAnswer = null));
  }

  gameOver() {
    this.state.isGameOver = true;
    this.broadcast('navigation', 'finish');
  }
}
