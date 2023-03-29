import { Schema, type, ArraySchema } from '@colyseus/schema';

export class Options extends Schema {
  @type('string') A: string;
  @type('string') B: string;
  @type('string') C: string;
  @type('string') D: string;
}

export class Question extends Schema {
  @type('string') category: string;
  @type('string') description: string;
  @type(Options) options: Options;
}
