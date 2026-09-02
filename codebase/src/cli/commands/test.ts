import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { GenerateKitService } from 'src/kit/service/generate-kit';

@Injectable()
@Command({
  name: 'generate:kit',
  arguments: '<times> <version>',
  description:
    'Generates multiple kits with QR codes and saves them to the database',
})
export class GenerateKitCommand extends CommandRunner {
  constructor(private readonly generateKitService: GenerateKitService) {
    super();
  }

  async run(inputs: string[], options?: Record<string, any>): Promise<void> {
    const times = parseInt(inputs[0]);
    const version = parseInt(inputs[1]);

    console.log(times, version);

    if (isNaN(times) || isNaN(version)) {
      console.error('Invalid arguments: times and version must be numbers.');
      process.exit(1);
    }

    console.log(`Generating ${times} version ${version} kits...`);

    await this.generateKitService.executeMultiple(times, version);

    console.log('Kit generation completed successfully.');
  }
}
