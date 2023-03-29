import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { MyRoom } from '../MyRoom';
import AWS from 'aws-sdk';

export class OnLoadCommand extends Command<
  MyRoom,
  {
    client: Client;
    consented: boolean;
  }
> {
  execute() {
    if (process.env.NODE_ENV === 'production') {
      // Use the IAM role attached to the EC2 instance in production
      AWS.config.credentials = new AWS.EC2MetadataCredentials();
    }

    const S3 = new AWS.S3();

    S3.getObject({ Bucket: 'colyseus', Key: 'words.json' }, (err, data) => {
      if (err) {
        console.log(`Error loading S3 object ${err}'`);
      } else {
        this.room.questions = JSON.parse(data.Body.toString()).questions;
      }
    });
  }
}
