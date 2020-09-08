import { Resolver, Query } from 'type-graphql';
import { User } from '../entities/User';

@Resolver()
export class UserResolver {
  private usersCollection: User[] = [];

  @Query(() => [User])
  async members() {
    return await this.usersCollection;
  }
}
