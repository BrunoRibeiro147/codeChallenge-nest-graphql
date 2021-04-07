import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import RepoService from '../repo.service';
import User from '../db/models/user.entity';
import UserInput from './input/user.input';

@Resolver(() => User)
export default class UserResolver {
  constructor(private readonly repoService: RepoService) {}

  @Query(() => [User])
  public async getUsers(): Promise<User[]> {
    return this.repoService.UserRepo.find();
  }
  @Query(() => User, { nullable: true })
  public async getUser(@Args('id') id: number): Promise<User> {
    return this.repoService.UserRepo.findOne(id);
  }

  @Mutation(() => User)
  public async createOrLoginUser(
    @Args('data') input: UserInput,
  ): Promise<User> {
    let user = await this.repoService.UserRepo.findOne({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      user = this.repoService.UserRepo.create({
        email: input.email.toLowerCase().trim(),
      });

      await this.repoService.UserRepo.save(user);
    }

    return user;
  }
}
