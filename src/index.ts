import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import { MyRoom } from './rooms/MyRoom';
const port = Number(process.env.port) || 5000;

const app = express();
app.use(express.json());

app.get('/healthcheck', (_, res) => {
  res.status(200).send('OK');
});

const gameServer = new Server({
  server: createServer(app),
});

gameServer.define('room', MyRoom);

gameServer.listen(port);
