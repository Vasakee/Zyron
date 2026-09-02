import { Console, Command } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { GenerateKitService } from 'src/kit/service/generate-kit';

@Console()
@Injectable()
export class GenerateKitCommand {
  constructor(private readonly generateKitService: GenerateKitService) {}

  @Command({
    command: 'generate:kit <times> <version>',
    description:
      'Generates multiple kits with QR codes and saves them to the database',
  })
  async generateKits(times: number, version: number) {
    console.log(`Generating ${times} version ${version} kits...`);

    await this.generateKitService.executeMultiple(times, version);

    console.log('Kit generation completed successfully.');
  }
}
