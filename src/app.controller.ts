import { Controller, Get } from '@nestjs/common';
import RepoService from './repo.service';

@Controller()
export class AppController {
  constructor(private readonly appService: RepoService) {}

  @Get()
  async getHello(): Promise<string> {
    return `Total messages are: ${await this.appService.MessageRepo.count()}`;
  }
}
