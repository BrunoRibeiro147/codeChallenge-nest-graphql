import {
  Args,
  Mutation,
  Query,
  Resolver,
  Parent,
  ResolveField,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import RepoService from '../repo.service';
import Message from '../db/models/message.entity';
import MessageInput, { DeleteMessageInput } from './input/message.input';
import User from 'src/db/models/user.entity';

export const pubSub = new PubSub();

@Resolver(() => Message)
export default class MessageResolver {
  constructor(private readonly repoService: RepoService) {}

  @Query(() => [Message])
  public async getMessages(): Promise<Message[]> {
    return this.repoService.MessageRepo.find();
  }

  @Query(() => [Message])
  public async getMessagesFromUser(
    @Args('userId') userId: number,
  ): Promise<Message[]> {
    return this.repoService.MessageRepo.find({
      where: { userId },
    });
  }

  @Query(() => Message, { nullable: true })
  public async getMessage(@Args('id') id: number): Promise<Message> {
    return this.repoService.MessageRepo.findOne(id);
  }

  @Mutation(() => Message)
  public async createMessage(
    @Args('data') input: MessageInput,
  ): Promise<Message> {
    const message = this.repoService.MessageRepo.create({
      content: input.content,
      userId: input.userId,
    });

    const response = await this.repoService.MessageRepo.save(message);

    pubSub.publish('messageAdded', { messageAdded: message });

    return response;
  }

  @Mutation(() => Message)
  public async deleteMessage(
    @Args('data') input: DeleteMessageInput,
  ): Promise<Message> {
    const message = await this.repoService.MessageRepo.findOne(input.id);

    const copy = { ...message };

    if (!message || message.userId !== input.userId)
      throw new Error('Message does not Exist or you not the message author');

    await this.repoService.MessageRepo.remove(message);

    return copy;
  }

  @Subscription(() => Message)
  messageAdded() {
    return pubSub.asyncIterator('messageAdded');
  }

  @ResolveField(() => User, { name: 'user' })
  public async getUser(@Parent() parent: Message): Promise<User> {
    return this.repoService.UserRepo.findOne(parent.userId);
  }
}
