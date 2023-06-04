import { Command } from '@colyseus/command';
import { MyRoom } from '../MyRoom';
import AWS from 'aws-sdk';

type Params = {
  questions: any;
};

export class OnLoadCommand extends Command<
  MyRoom,
  {
    questions: any;
  }
> {
  execute({ questions }: Params) {
    if (process.env.NODE_ENV === 'production') {
      // Use the IAM role attached to the EC2 instance in production
      AWS.config.credentials = new AWS.EC2MetadataCredentials();
    } else {
      AWS.config.credentials = new AWS.EC2MetadataCredentials();
      // this.room.questions = questions;
    }

    const S3 = new AWS.S3();

    S3.getObject({ Bucket: 'colyseus', Key: 'trivia.json' }, (err, data) => {
      if (err) {
        console.log(`Error loading S3 object ${err}'`);
      } else {
        console.log(`Loaded questions from S3`);
        this.room.questions = JSON.parse(data.Body.toString()).questions;
      }
    });
  }
}
