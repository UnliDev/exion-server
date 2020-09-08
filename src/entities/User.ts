import {
  ObjectType, Field, Int, ID, registerEnumType, GraphQLISODateTime,
} from 'type-graphql';
import { GraphQLScalarType } from 'graphql';

enum Gender {
  FEMALE,
  MALE,
}

registerEnumType(Gender, {
  name: 'Gender',
  description: 'member gender',
});

@ObjectType()
export class User {
  @Field(() => ID)
  readonly id!: string;

  @Field()
  phoneNumber!: string;

  @Field()
  password!: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  birthDate?: GraphQLScalarType;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => Int, { nullable: true })
  height?: number;

  @Field(() => Int, { nullable: true })
  weight?: number;

  @Field({ nullable: true })
  isGlasses?: boolean;

  @Field({ nullable: true })
  isTattoo?: boolean;

  @Field({ nullable: true })
  isDyeing?: boolean;
}
