import { Field, Model } from '.../../../src';

@Model()
export default class Photo {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  views: number;
}
